// src/productos/productos.service.ts
import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { LineasService } from '../lineas/lineas.service';
import { MarcasService } from '../marcas/marcas.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import type { IProductoRepository } from './interfaces/producto.repository.interface';

@Injectable()
export class ProductosService {
  constructor(
    @Inject('IProductoRepository')
    private readonly productoRepository: IProductoRepository,
    private readonly marcasService: MarcasService,
    private readonly lineasService: LineasService,
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
    await this.findOne(id); // Verificamos que el producto exista
    // Validaciones opcionales si se actualizan marca o línea
    if (updateProductoDto.id_marca) await this.marcasService.findOne(updateProductoDto.id_marca);
    if (updateProductoDto.id_linea) await this.lineasService.findOne(updateProductoDto.id_linea);

    // (Opcional Avanzado) Se podría agregar una validación de consistencia como en el create.

    return this.productoRepository.update(id, updateProductoDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.productoRepository.delete(id);
  }
}