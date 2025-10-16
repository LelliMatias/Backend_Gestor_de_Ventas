// src/marcas/repositories/marca.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Marca } from '../entities/marca.entity';
import { IMarcaRepository } from '../interfaces/marca.repository.interface';

@Injectable()
export class MarcaRepository implements IMarcaRepository {
    constructor(
        @InjectRepository(Marca)
        private readonly typeormRepository: Repository<Marca>,
    ) { }

    findAll(): Promise<Marca[]> {
        return this.typeormRepository.find();
    }

    findById(id: number): Promise<Marca | null> {
        return this.typeormRepository.findOneBy({ id });
    }

    async create(nombre: string): Promise<Marca> {
        const nuevaMarca = this.typeormRepository.create({ nombre });
        return this.typeormRepository.save(nuevaMarca);
    }

    async update(id: number, nombre: string): Promise<Marca> {
        await this.typeormRepository.update(id, { nombre });
        const updatedMarca = await this.findById(id);
        if (!updatedMarca) {
            throw new Error('Marca no encontrada');
        }
        return updatedMarca;
    }

    async delete(id: number): Promise<void> {
        await this.typeormRepository.delete(id);
    }
}