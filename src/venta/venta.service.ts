import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
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
    console.log('PAYLOAD RECIBIDO (Prueba 2):', usuarioPayload);

    // --- VAMOS A BORRAR O COMENTAR EL BLOQUE "IF" ANTIGUO ---
    // const idUsuarioAutenticado = usuarioPayload.sub; 
    // if (!idUsuarioAutenticado) { 
    //     throw new UnauthorizedException('Payload de JWT inválido, no se encontró "sub" (ID de usuario)');
    // }

    // --- AÑADE ESTE NUEVO BLOQUE DE PRUEBA ---
    if (!usuarioPayload || !usuarioPayload.sub) {
        throw new BadRequestException('¡¡¡ERROR DE PRUEBA!! El servidor NO se ha reiniciado.');
    }

    // Si pasamos la prueba, usamos el ID
    const idUsuarioAutenticado = usuarioPayload.sub;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2. Validar que el usuario (del JWT) exista en la DB
      // ¡Este paso es NUEVO y CRÍTICO!
      const usuario = await queryRunner.manager.findOne(Usuario, {
        where: { 
          id_usuario: idUsuarioAutenticado, 
          fecha_eliminacion: IsNull() // Asegurarse que no esté borrado lógicamente
        } 
      });

      if (!usuario) {
        throw new UnauthorizedException(`Usuario con ID #${idUsuarioAutenticado} (del token) no encontrado o inactivo.`);
      }

      // 3. Crear la Venta "cabecera"
      const venta = queryRunner.manager.create(Venta, {
         usuario: usuario, // <-- Se usa el objeto 'Usuario' encontrado
         total: 0, 
      });
      const savedVenta = await queryRunner.manager.save(venta);

      let totalVenta = 0;

      // 4. Procesar cada detalle
      for (const detalleDto of createVentaDto.detalles) {
        const producto = await this.productoRepository.findById(detalleDto.id_producto);

        if (!producto) {
          throw new NotFoundException(`Producto con ID #${detalleDto.id_producto} no encontrado.`);
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
      }

      // 5. Actualizar la Venta con el total final
      savedVenta.total = totalVenta;
      await queryRunner.manager.save(Venta, savedVenta);

      // 6. Confirmar la transacción
      await queryRunner.commitTransaction();

      // 7. Devolver la venta completa
      return this.ventaRepository.findById(savedVenta.id_venta); 

    } catch (error) {
      // 8. Revertir TODOS los cambios
      await queryRunner.rollbackTransaction();
      throw error; 
    } finally {
      // 9. Siempre liberar el queryRunner
      await queryRunner.release();
    }
  }

  findAll() {
    return `This action returns all venta`;
  }

  findOne(id: number) {
    return `This action returns a #${id} venta`;
  }

  update(id: number, updateVentaDto: UpdateVentaDto) {
    return `This action updates a #${id} venta`;
  }

  remove(id: number) {
    return `This action removes a #${id} venta`;
  }
}
