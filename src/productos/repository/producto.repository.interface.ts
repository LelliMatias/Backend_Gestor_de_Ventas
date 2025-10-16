// src/productos/repositories/producto.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { Producto } from '../entities/producto.entity';
import { IProductoRepository } from '../interfaces/producto.repository.interface';

@Injectable()
export class ProductoRepository implements IProductoRepository {
    constructor(
        @InjectRepository(Producto)
        private readonly typeormRepository: Repository<Producto>,
    ) { }

    findAll(): Promise<Producto[]> {
        return this.typeormRepository.find();
    }

    findById(id: number): Promise<Producto | null> {
        return this.typeormRepository.findOneBy({ id });
    }

    async create(createProductoDto: CreateProductoDto): Promise<Producto> {
        const nuevoProducto = this.typeormRepository.create({
            nombre: createProductoDto.nombre,
            descripcion: createProductoDto.descripcion,
            precioUnitario: createProductoDto.precio_unitario,
            stockActual: createProductoDto.stock_actual,
            imagen: createProductoDto.imagen,
            marca: { id: createProductoDto.id_marca },
            linea: { id: createProductoDto.id_linea },
        });
        return this.typeormRepository.save(nuevoProducto);
    }

    async update(id: number, updateProductoDto: UpdateProductoDto): Promise<Producto> {
        const { id_marca, id_linea, ...data } = updateProductoDto;
        const payload = {
            ...data,
            ...(id_marca && { marca: { id: id_marca } }),
            ...(id_linea && { linea: { id: id_linea } }),
        };
        await this.typeormRepository.update(id, payload);
        const updatedProducto = await this.findById(id);
        if (!updatedProducto) {
            throw new Error('Producto no encontrado');
        }
        return updatedProducto;
    }

    async delete(id: number): Promise<void> {
        await this.typeormRepository.delete(id);
    }
}