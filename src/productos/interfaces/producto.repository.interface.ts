// src/productos/interfaces/producto.repository.interface.ts
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { Producto } from '../entities/producto.entity';

export interface IProductoRepository {
    findAll(): Promise<Producto[]>;
    findById(id: number): Promise<Producto | null>;
    create(createProductoDto: CreateProductoDto): Promise<Producto>;
    update(id: number, updateProductoDto: UpdateProductoDto): Promise<Producto>;
    delete(id: number): Promise<void>;
}