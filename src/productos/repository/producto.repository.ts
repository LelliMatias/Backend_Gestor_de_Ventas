import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { Producto } from '../entities/producto.entity';
import { IProductoRepository } from '../interfaces/producto.repository.interface';
import { Marca } from 'src/marcas/entities/marca.entity'; // Importa las entidades relacionadas
import { Linea } from 'src/lineas/entities/linea.entity'; // Importa las entidades relacionadas

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

    // --- MÉTODO UPDATE CORREGIDO ---
    async update(id: number, updateProductoDto: UpdateProductoDto): Promise<Producto> {
        // 1. Definimos un tipo más flexible para el payload
        const payload: { [key: string]: any } = {};

        if (updateProductoDto.nombre) payload.nombre = updateProductoDto.nombre;
        if (updateProductoDto.descripcion) payload.descripcion = updateProductoDto.descripcion;
        if (updateProductoDto.imagen) payload.imagen = updateProductoDto.imagen;
        if (updateProductoDto.precio_unitario) payload.precioUnitario = updateProductoDto.precio_unitario;
        if (updateProductoDto.stock_actual) payload.stockActual = updateProductoDto.stock_actual;

        // Asignamos las relaciones como objetos con solo el ID
        if (updateProductoDto.id_marca) payload.marca = { id: updateProductoDto.id_marca };
        if (updateProductoDto.id_linea) payload.linea = { id: updateProductoDto.id_linea };

        // 2. Ejecuta la actualización en la base de datos
        const result = await this.typeormRepository.update(id, payload);

        if (result.affected === 0) {
            throw new NotFoundException(`Producto con ID #${id} no encontrado para actualizar.`);
        }

        const updatedProduct = await this.findById(id);
        if (!updatedProduct) {
            throw new InternalServerErrorException(`No se pudo encontrar el producto #${id} después de la actualización.`);
        }
        return updatedProduct;
    }

    async delete(id: number): Promise<void> {
        await this.typeormRepository.delete(id);
    }

    async save(producto: Producto): Promise<Producto> {
        return this.typeormRepository.save(producto);
    }
    findOne(options: FindOneOptions<Producto>): Promise<Producto | null> {
            return this.typeormRepository.findOne(options);
    }
    
    async softDelete(id: number): Promise<void> {
            await this.typeormRepository.softDelete(id);
        }
    
    async restore(id: number): Promise<void> {
            await this.typeormRepository.restore(id);
    }
}