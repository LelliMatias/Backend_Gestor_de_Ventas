import { Inject, Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
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
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductosService {
  constructor(
    @Inject('IProductoRepository')
    private readonly productoRepository: IProductoRepository,
    private readonly marcasService: MarcasService,
    private readonly lineasService: LineasService,
    private readonly proveedoresService: ProveedoresService,
    private readonly dataSource: DataSource,
    @InjectRepository(ProductoProveedor)
    private readonly productoProveedorRepository: Repository<ProductoProveedor>
  ) { }

  async create(createProductoDto: CreateProductoDto) {
    const marca = await this.marcasService.findOne(createProductoDto.id_marca);
    const linea = await this.lineasService.findOne(createProductoDto.id_linea);

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

    if (id_marca) await this.marcasService.findOne(id_marca);
    if (id_linea) await this.lineasService.findOne(id_linea);

    if (id_marca && id_linea) {
      const linea = await this.lineasService.findOne(id_linea);
      if (linea.marca.id !== id_marca) {
        throw new BadRequestException('La línea seleccionada no pertenece a la nueva marca especificada.');
      }
    }

    return this.productoRepository.update(id, updateProductoDto);
  }

  // Método de tu amigo para borrado lógico
  async remove(id: number) {
    await this.findOne(id);
    // NOTA: Asegúrate de que tu IProductoRepository tenga un método softDelete
    // await this.productoRepository.softDelete(id); 
  }

  // Método de tu amigo para restaurar un producto
  async restore(id: number) {
    // NOTA: Asegúrate de que tu IProductoRepository tenga la lógica para encontrar borrados
    // y que la entidad Producto tenga una columna @DeleteDateColumn
    // const producto = await this.productoRepository.findOne({ where: { id }, withDeleted: true });
    // ... lógica de restore ...
    // await this.productoRepository.restore(id);
  }

  async addProveedorToProducto(productoId: number, addProveedorDto: AddProveedorDto) {
    await this.findOne(productoId);
    await this.proveedoresService.findOne(addProveedorDto.proveedorId);

    const nuevaRelacion = this.productoProveedorRepository.create({
      productoId: productoId,
      proveedorId: addProveedorDto.proveedorId,
      codigoProveedor: addProveedorDto.codigoProveedor,
      precioCompra: addProveedorDto.precioCompra,
    });

    return this.productoProveedorRepository.save(nuevaRelacion);
  }

  // Se conserva la versión más robusta del método
  async findProveedoresByProductoId(productoId: number) {
    await this.findOne(productoId);

    return this.productoProveedorRepository.find({
      where: { productoId: productoId },
      relations: {
        proveedor: true,
      },
    });
  }

  async updateProveedoresForProducto(productoId: number, dto: UpdateProveedoresDto) {
    await this.findOne(productoId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(ProductoProveedor, { productoId: productoId });

      if (dto.proveedores && dto.proveedores.length > 0) {
        const nuevasAsociaciones = dto.proveedores.map(p =>
          queryRunner.manager.create(ProductoProveedor, {
            productoId: productoId,
            proveedorId: p.proveedorId,
            precioCompra: p.precioCompra,
            codigoProveedor: p.codigoProveedor,
          })
        );
        await queryRunner.manager.save(nuevasAsociaciones);
      }

      await queryRunner.commitTransaction();
      return this.findProveedoresByProductoId(productoId);

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}