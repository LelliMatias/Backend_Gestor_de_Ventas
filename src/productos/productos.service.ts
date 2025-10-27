// src/productos/productos.service.ts
import { Inject, Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { LineasService } from '../lineas/lineas.service';
import { MarcasService } from '../marcas/marcas.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import type { IProductoRepository } from './interfaces/producto.repository.interface';
import { ProductoProveedor } from './entities/producto-proveedor.entity';
import { DataSource, Repository } from 'typeorm';
import { AddProveedorDto } from './dto/add-proveedor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProveedoresService } from 'src/proveedores/proveedores.service';
import { UpdateProveedoresDto } from './dto/update-proveedores.dto';

@Injectable()
export class ProductosService {
  constructor(
    @Inject('IProductoRepository')
    private readonly productoRepository: IProductoRepository,
    private readonly marcasService: MarcasService,
    private readonly lineasService: LineasService,
    private readonly proveedoresService: ProveedoresService,
    private dataSource: DataSource,
    @InjectRepository(ProductoProveedor)
    private readonly productoProveedorRepository: Repository<ProductoProveedor>
  ) { }

  async create(createProductoDto: CreateProductoDto) {
    // Verificamos que marca y línea existan
    const marca = await this.marcasService.findOne(createProductoDto.id_marca);
    const linea = await this.lineasService.findOne(createProductoDto.id_linea);

    // Verificación de consistencia: la línea debe pertenecer a la marca.
    if (linea.marca.id !== marca.id) {
      throw new BadRequestException('La línea seleccionada no pertenece a la marca especificada.');
    }

    return this.productoRepository.create(createProductoDto);
  }

  findAll() {
    return this.productoRepository.findAll();
  }

  async findOne(id: number) {
    const producto = await this.productoRepository.findById(id);
    if (!producto) {
      throw new NotFoundException(`Producto con ID #${id} no encontrado`);
    }
    return producto;
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    await this.findOne(id);

    const { id_marca, id_linea } = updateProductoDto;

    if (id_marca) {
      await this.marcasService.findOne(id_marca);
    }
    if (id_linea) {
      await this.lineasService.findOne(id_linea);
    }

    if (id_marca && id_linea) {
      const linea = await this.lineasService.findOne(id_linea);
      if (linea.marca.id !== id_marca) {
        throw new BadRequestException('La línea seleccionada no pertenece a la nueva marca especificada.');
      }
    }

    return this.productoRepository.update(id, updateProductoDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.productoRepository.softDelete(id);
  }

  async addProveedorToProducto(productoId: number, addProveedorDto: AddProveedorDto) {
    // 1. Validar que el producto y el proveedor existan
    // Asegúrate que tu servicio tenga un método `findOne` para productos
    await this.productoRepository.findById(productoId);
    await this.proveedoresService.findOne(addProveedorDto.proveedorId);

    // 2. Crear la nueva relación
    const nuevaRelacion = this.productoProveedorRepository.create({
      productoId: productoId,
      proveedorId: addProveedorDto.proveedorId,
      codigoProveedor: addProveedorDto.codigoProveedor,
      precioCompra: addProveedorDto.precioCompra,
    });

    // 3. Guardar la relación en la base de datos
    return this.productoProveedorRepository.save(nuevaRelacion);
  }

  async findProveedoresByProductoId(productoId: number) {
    // Primero, verificamos que el producto principal exista.
    await this.findOne(productoId);

    // Luego, buscamos en la tabla intermedia y traemos la info del proveedor.
    return this.productoProveedorRepository.find({
      where: { productoId: productoId },
      relations: {
        proveedor: true, // Carga la entidad completa del Proveedor
      },
    });
  }

  async restore(id: number) {
    const producto = await this.productoRepository.findOne({
      where: { id },
      withDeleted: true
    });
    if (!producto) {
      throw new NotFoundException(`Producto con ID #${id} no encontrado (incluso borrado)`);
    }
    if (!producto.fecha_eliminacion) {
      throw new ConflictException(`El producto con ID #${id} no está borrado.`);
    }

    // (Aquí podrías validar si la marca o línea del producto a restaurar
    //  siguen existiendo y no están borradas)

    await this.productoRepository.restore(id);
  }


  async findProveedoresByProductoId(productoId: number) {
    return this.productoProveedorRepository.find({
      where: { productoId: productoId },
      relations: ['proveedor'], // ¡Importante para obtener los detalles del proveedor!
    });
  }

  async updateProveedoresForProducto(productoId: number, dto: UpdateProveedoresDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Borrar todas las asociaciones existentes para este producto
      await queryRunner.manager.delete(ProductoProveedor, { productoId: productoId });

      // 2. Crear las nuevas asociaciones a partir de los datos del DTO
      const nuevasAsociaciones = dto.proveedores.map(p =>
        queryRunner.manager.create(ProductoProveedor, {
          productoId: productoId,
          proveedorId: p.proveedorId,
          precioCompra: p.precioCompra,
          codigoProveedor: p.codigoProveedor,
        })
      );

      // 3. Guardar todas las nuevas asociaciones
      await queryRunner.manager.save(nuevasAsociaciones);

      // 4. Confirmar la transacción
      await queryRunner.commitTransaction();

      // 5. Devolver las nuevas asociaciones creadas
      return nuevasAsociaciones;

    } catch (err) {
      // Si algo falla, deshacer todos los cambios
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Liberar el query runner
      await queryRunner.release();
    }
  }
}