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

@Injectable()
export class VentaService {
  constructor(
    // Inyectamos DataSource para manejar las transacciones
    private readonly dataSource: DataSource,

    // Inyectamos el repositorio de ventas
    @Inject('IVentaRepository')
    private readonly ventaRepository: IVentaRepository,

    // Inyectamos el repositorio de productos
    @Inject('IProductoRepository')
    private readonly productoRepository: IProductoRepository,
  ) {}

  async create(createVentaDto: CreateVentaDto, usuarioPayload: any) {
    if (!usuarioPayload || !usuarioPayload.sub) {
        throw new BadRequestException('Payload de JWT inválido o no se encontró "sub" (ID de usuario).');
    }

    const idUsuarioAutenticado = usuarioPayload.sub;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const usuario = await queryRunner.manager.findOne(Usuario, {
        where: { 
          id_usuario: idUsuarioAutenticado, 
          fecha_eliminacion: IsNull()
        } 
      });

      if (!usuario) {
        throw new UnauthorizedException(`Usuario con ID #${idUsuarioAutenticado} (del token) no encontrado o inactivo.`);
      }

      const venta = queryRunner.manager.create(Venta, {
         usuario: usuario,
         total: 0, 
      });
      const savedVenta = await queryRunner.manager.save(venta);

      let totalVenta = 0;

      for (const detalleDto of createVentaDto.detalles) {
        // Usamos el queryRunner para bloquear la fila del producto
        const producto = await queryRunner.manager.findOne(Producto, {
            where: { id: detalleDto.id_producto },
            lock: { mode: 'pessimistic_write' } // Bloqueo para evitar concurrencia
        });

        if (!producto) {
          throw new NotFoundException(`Producto con ID #${detalleDto.id_producto} no encontrado.`);
        }
         // Verificamos si el producto está borrado
        if (producto.fecha_eliminacion) {
           throw new BadRequestException(`El producto "${producto.nombre}" no está disponible (está borrado).`);
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

        // Actualizamos el stock usando el queryRunner
        await queryRunner.manager.update(Producto, producto.id, {
          stockActual: producto.stockActual - detalleDto.cantidad
        });
      }

      savedVenta.total = totalVenta;
      await queryRunner.manager.save(Venta, savedVenta);

      await queryRunner.commitTransaction();

      // Devolvemos la venta completa con sus relaciones cargadas
      return this.ventaRepository.findById(savedVenta.id_venta); 

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error; 
    } finally {
      await queryRunner.release();
    }
  }

  // --- MÉTODO 'findAll' IMPLEMENTADO ---
  /**
   * Devuelve todas las ventas activas (no borradas).
   * El repositorio ya carga las relaciones ('usuario', 'detalles', 'detalles.producto').
   */
  async findAll(): Promise<Venta[]> {
    return this.ventaRepository.findAll();
  }

  // --- MÉTODO 'findOne' IMPLEMENTADO ---
  /**
   * Busca una venta activa por ID.
   * Lanza NotFoundException si no la encuentra.
   */
  async findOne(id: number): Promise<Venta> {
    const venta = await this.ventaRepository.findById(id);
    if (!venta) {
      throw new NotFoundException(`Venta con ID #${id} no encontrada`);
    }
    return venta;
  }

  // --- MÉTODO 'update' IMPLEMENTADO ---
  /**
   * Actualiza una venta.
   * NOTA: Este método es simple. No maneja la lógica transaccional
   * de actualizar detalles, stock, o recalcular totales.
   * Solo actualiza los campos planos de la Venta (ej: un estado, una nota, etc.)
   */
  async update(id: number, updateVentaDto: UpdateVentaDto): Promise<Venta> {
    // Primero, verificamos que la venta exista (usando el findOne de este servicio)
    await this.findOne(id);
    
    // Llamamos al repositorio que se encarga de hacer el merge y save
    return this.ventaRepository.update(id, updateVentaDto);
  }

  // --- MÉTODO 'remove' (YA ESTABA BIEN) ---
  /**
   * Realiza un borrado lógico (soft delete) de una venta.
   */
  async remove(id: number): Promise<void> {
    // Verificamos que exista
    const venta = await this.ventaRepository.findById(id);
    if (!venta) {
      throw new NotFoundException(`Venta con ID #${id} no encontrada`);
    }
    
    // NOTA: Si quisieras revertir el stock al borrar una venta,
    // esa lógica transaccional iría aquí.

    await this.ventaRepository.softDelete(id);
  }

  // --- MÉTODO 'restore' (YA ESTABA BIEN) ---
  /**
   * Restaura una venta borrada lógicamente.
   */
  async restore(id: number): Promise<void> {
    const venta = await this.ventaRepository.findOne({ 
     where: { id_venta: id }, 
     withDeleted: true 
   });
    if (!venta) {
     throw new NotFoundException(`Venta con ID #${id} no encontrada (incluso borrada)`);
   }
    if (!venta.fecha_eliminacion) {
     throw new ConflictException(`La venta con ID #${id} no está borrada.`);
   }

   // NOTA: Aquí podrías validar si el usuario o los productos
   // de la venta siguen activos antes de restaurarla.
   
   await this.ventaRepository.restore(id);
 }
}