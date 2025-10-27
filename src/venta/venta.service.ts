import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import type { IVentaRepository } from './interfaces/venta.repository.interface';
import type { IProductoRepository } from 'src/productos/interfaces/producto.repository.interface';
import { DataSource, IsNull } from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from 'src/detalle_venta/entities/detalle_venta.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
// --- NUEVOS IMPORTS ---
import { HistorialVentaService } from 'src/historial_venta/historial_venta.service';
import { TipoAccionHistorial } from 'src/historial_venta/entities/historial_venta.entity';
import { UpdateVentaDetallesDto } from './dto/update-detalle-venta.dto';



@Injectable()
export class VentaService {
  constructor(
    private readonly dataSource: DataSource,
    @Inject('IVentaRepository')
    private readonly ventaRepository: IVentaRepository,
    @Inject('IProductoRepository')
    private readonly productoRepository: IProductoRepository,
    // --- NUEVA INYECCIÓN ---
    private readonly historialService: HistorialVentaService
  ) {}

  async create(createVentaDto: CreateVentaDto, usuarioPayload: any) {
    // Tu lógica de 'create' (con stock) se queda igual.
    // Solo añadimos la llamada al historial al final.
    
    if (!usuarioPayload || !usuarioPayload.id_usuario) { 
      throw new BadRequestException('Payload de JWT inválido o usuario no adjuntado.');
    }

    const idUsuarioAutenticado = usuarioPayload.id_usuario;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const usuario = await queryRunner.manager.findOne(Usuario, {
        where: { id_usuario: idUsuarioAutenticado, fecha_eliminacion: IsNull() } 
      });
      if (!usuario) {
        throw new UnauthorizedException(`Usuario (del token) no encontrado.`);
      }

      const venta = queryRunner.manager.create(Venta, { usuario: usuario, total: 0 });
      const savedVenta = await queryRunner.manager.save(venta);
      
      let totalVenta = 0;
      const detallesParaHistorial: any[] = []; // Para el historial

      for (const detalleDto of createVentaDto.detalles) {
        const producto = await queryRunner.manager.findOne(Producto, {
            where: { id: detalleDto.id_producto },
            lock: { mode: 'pessimistic_write' } 
        });

        if (!producto || producto.fecha_eliminacion) {
          throw new BadRequestException(`Producto con ID #${detalleDto.id_producto} no disponible.`);
        }
        if (producto.stockActual < detalleDto.cantidad) {
          throw new BadRequestException(`Stock insuficiente para "${producto.nombre}". Stock actual: ${producto.stockActual}`);
        }

        const precioUnitario = Number(producto.precioUnitario);
        const subtotal = precioUnitario * detalleDto.cantidad;
        totalVenta += subtotal;

        const nuevoDetalle = queryRunner.manager.create(DetalleVenta, {
          venta: savedVenta,
          producto: producto,
          cantidad: detalleDto.cantidad,
          precio_unitario: precioUnitario,
          subtotal: subtotal,
        });
        await queryRunner.manager.save(nuevoDetalle);

        await queryRunner.manager.update(Producto, producto.id, {
          stockActual: producto.stockActual - detalleDto.cantidad
        });
        
        // Guardamos info para el historial
        detallesParaHistorial.push({ 
            id: producto.id, 
            nombre: producto.nombre, 
            cant: detalleDto.cantidad, 
            precio: precioUnitario 
        });
      }

      savedVenta.total = totalVenta;
      await queryRunner.manager.save(Venta, savedVenta);

      // --- AÑADIMOS EL REGISTRO DE HISTORIAL ---
      await this.historialService.registrarAccion(
        queryRunner.manager, // Pasamos el manager de la transacción
        savedVenta, 
        usuario, 
        TipoAccionHistorial.CREACION, 
        null, 
        detallesParaHistorial // Guardamos los detalles creados
      );

      await queryRunner.commitTransaction();
      return this.ventaRepository.findById(savedVenta.id_venta); 

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error; 
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Venta[]> {
    return this.ventaRepository.findAll();
  }

  // --- NUEVO MÉTODO ---
  async findAllWithDeleted(): Promise<Venta[]> {
     return this.ventaRepository.find({ // Asumiendo que tu repo tiene `find`
        relations: ['usuario', 'detalles', 'detalles.producto'],
        withDeleted: true, // Incluye las borradas
        order: { fecha_creacion: 'DESC' }
     });
  }

  async findOne(id: number): Promise<Venta> {
    const venta = await this.ventaRepository.findById(id);
    if (!venta) {
      throw new NotFoundException(`Venta con ID #${id} no encontrada`);
    }
    return venta;
  }

  async update(id: number, updateVentaDto: UpdateVentaDto): Promise<Venta> {
    await this.findOne(id);
    return this.ventaRepository.update(id, updateVentaDto);
  }

  // --- MÉTODO 'remove' (ACTUALIZADO) ---
  /**
   * Realiza un borrado lógico (soft delete) y registra en el historial.
   * NO devuelve stock (según tu requisito).
   */
  async remove(id: number, usuarioPayload: any): Promise<void> {
    if (!usuarioPayload || !usuarioPayload.id_usuario) {
      throw new BadRequestException('Payload de JWT inválido');
  }
    
    // Usamos el manager general (sin transacción)
    const manager = this.dataSource.manager;

    const venta = await this.ventaRepository.findById(id);
    if (!venta) {
      throw new NotFoundException(`Venta con ID #${id} no encontrada`);
    }
    
    const usuario = await manager.findOne(Usuario, { 
      where: { id_usuario: usuarioPayload.id_usuario, fecha_eliminacion: IsNull() } 
  });
    if (!usuario) {
        throw new UnauthorizedException(`Usuario no encontrado`);
    }

    // Registrar en el historial
    await this.historialService.registrarAccion(
        manager,
        venta, 
        usuario, 
        TipoAccionHistorial.CANCELACION, 
        venta.detalles.map(d => ({ id: d.producto.id, cant: d.cantidad })), // Snapshot
        null
    );

    // Borrado lógico simple
    await this.ventaRepository.softDelete(id);
  }

  // --- MÉTODO 'restore' (ACTUALIZADO) ---
  /**
   * Restaura una venta borrada lógicamente y registra en el historial.
   * NO re-descuenta stock (según tu requisito).
   */
  async restore(id: number, usuarioPayload: any): Promise<void> {
    if (!usuarioPayload || !usuarioPayload.id_usuario) {
      throw new BadRequestException('Payload de JWT inválido');
  }

    const manager = this.dataSource.manager;
    
    const venta = await this.ventaRepository.findOne({ 
       where: { id_venta: id }, 
       relations: ['detalles', 'detalles.producto'],
       withDeleted: true 
    });
    if (!venta) {
       throw new NotFoundException(`Venta con ID #${id} no encontrada`);
    }
    if (!venta.fecha_eliminacion) {
       throw new ConflictException(`La venta con ID #${id} no está borrada.`);
    }

    const usuario = await manager.findOne(Usuario, { 
      where: { id_usuario: usuarioPayload.id_usuario, fecha_eliminacion: IsNull() } 
  });
    if (!usuario) {
        throw new UnauthorizedException(`Usuario no encontrado`);
    }

    // Registrar en el historial
    await this.historialService.registrarAccion(
        manager,
        venta, 
        usuario, 
        TipoAccionHistorial.RESTAURACION,
        null,
        venta.detalles.map(d => ({ id: d.producto.id, cant: d.cantidad })) // Snapshot
    );
   
    // Restauración simple
    await this.ventaRepository.restore(id);
  }

  // --- NUEVO MÉTODO (PARA MODIFICAR DETALLES) ---
  /**
   * Actualiza los DETALLES de una venta.
   * Esta operación SÍ es transaccional y SÍ maneja stock
   * para ser coherente con el método 'create'.
   */
  async updateDetalles(
    id_venta: number, 
    updateDto: UpdateVentaDetallesDto, 
    usuarioPayload: any
  ) {
    // --- CORRECCIÓN AQUÍ TAMBIÉN ---
    if (!usuarioPayload || !usuarioPayload.id_usuario) {
        throw new BadRequestException('Payload de JWT inválido');
    }
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Obtener usuario y venta (con sus detalles ANTIGUOS)
      const usuario = await queryRunner.manager.findOne(Usuario, {
        where: { id_usuario: usuarioPayload.id_usuario, fecha_eliminacion: IsNull() }
      });
      if (!usuario) throw new UnauthorizedException('Usuario no autorizado');

      const venta = await queryRunner.manager.findOne(Venta, {
        where: { id_venta, fecha_eliminacion: IsNull() },
        relations: ['detalles', 'detalles.producto']
      });
      if (!venta) throw new NotFoundException(`Venta #${id_venta} no encontrada o está cancelada.`);

      const detallesAntiguos = venta.detalles;
      const snapshotAntiguo = detallesAntiguos.map(d => ({ 
          id: d.producto.id, 
          nombre: d.producto.nombre, 
          cant: d.cantidad, 
          precio: d.precio_unitario 
      }));

      // 2. Calcular diferencias de stock
      const mapaStockAntiguo = new Map<number, number>(); // <id_producto, cantidad>
      for (const det of detallesAntiguos) {
          mapaStockAntiguo.set(det.producto.id, det.cantidad);
      }

      const mapaStockNuevo = new Map<number, number>();
      for (const det of updateDto.detalles) {
          const cant = (mapaStockNuevo.get(det.id_producto) || 0) + det.cantidad;
          mapaStockNuevo.set(det.id_producto, cant);
      }

      const mapaDiferencias = new Map<number, number>(); // <id_producto, diferencia>
      
      mapaStockAntiguo.forEach((cant, id) => {
          mapaDiferencias.set(id, (mapaDiferencias.get(id) || 0) + cant); // +Stock (devolver)
      });
      mapaStockNuevo.forEach((cant, id) => {
          mapaDiferencias.set(id, (mapaDiferencias.get(id) || 0) - cant); // -Stock (descontar)
      });

      // 3. Aplicar diferencias de stock (con bloqueo)
      for (const [id_producto, diferencia] of mapaDiferencias.entries()) {
        if (diferencia === 0) continue; 

        const producto = await queryRunner.manager.findOne(Producto, {
           where: { id: id_producto, fecha_eliminacion: IsNull() },
           lock: { mode: 'pessimistic_write' }
        });
        if (!producto) throw new BadRequestException(`Producto #${id_producto} no disponible`);

        const nuevoStock = producto.stockActual - diferencia; // (Restar la diferencia)
        if (nuevoStock < 0) {
            throw new BadRequestException(`Stock insuficiente para "${producto.nombre}". Stock actual: ${producto.stockActual}`);
        }
        await queryRunner.manager.update(Producto, id_producto, { stockActual: nuevoStock });
      }

      // 4. Borrar detalles antiguos y crear los nuevos
      await queryRunner.manager.softRemove(detallesAntiguos); // O softDelete

      let totalVentaNuevo = 0;
      
      // --- INICIO DE LA CORRECCIÓN ---
      const nuevosDetallesEntidades: DetalleVenta[] = [];
      const snapshotNuevo: any[] = [];
      // --- FIN DE LA CORRECCIÓN ---

      for (const detalleDto of updateDto.detalles) {
         const producto = await queryRunner.manager.findOne(Producto, { where: { id: detalleDto.id_producto }});
         if (!producto) throw new NotFoundException(`Producto #${detalleDto.id_producto} no encontrado`);
         
         const precioUnitario = Number(producto.precioUnitario);
         const subtotal = precioUnitario * detalleDto.cantidad;
         totalVentaNuevo += subtotal;

         const nuevoDetalle = queryRunner.manager.create(DetalleVenta, {
            venta: venta,
            producto: producto,
            cantidad: detalleDto.cantidad,
            precio_unitario: precioUnitario,
            subtotal: subtotal,
         });
         nuevosDetallesEntidades.push(nuevoDetalle);
         snapshotNuevo.push({ id: producto.id, nombre: producto.nombre, cant: detalleDto.cantidad, precio: precioUnitario });
      }
      
      await queryRunner.manager.save(nuevosDetallesEntidades);
      
      // 5. Actualizar total de la venta
      venta.total = totalVentaNuevo;
      await queryRunner.manager.save(venta);

      // 6. Registrar en el historial
      await this.historialService.registrarAccion(
          queryRunner.manager,
          venta,
          usuario,
          TipoAccionHistorial.MODIFICACION,
          snapshotAntiguo,
          snapshotNuevo,
          updateDto.motivo
      );

      await queryRunner.commitTransaction();
      return this.ventaRepository.findById(id_venta);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  
}