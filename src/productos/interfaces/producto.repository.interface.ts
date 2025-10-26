// src/productos/interfaces/producto.repository.interface.ts
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { Producto } from '../entities/producto.entity';
import { FindOneOptions } from 'typeorm';

export interface IProductoRepository {
    findAll(): Promise<Producto[]>;
    findById(id: number): Promise<Producto | null>;
    create(createProductoDto: CreateProductoDto): Promise<Producto>;
    update(id: number, updateProductoDto: UpdateProductoDto): Promise<Producto>;
    delete(id: number): Promise<void>;
     /**
         * Busca una entidad 'Producto' que coincida con las opciones.
         * Esencial para usar 'withDeleted: true' en el servicio.
         */
    findOne(options: FindOneOptions<Producto>): Promise<Producto | null>;
    softDelete(id: number): Promise<void>;
    restore(id: number): Promise<void>;
    
}