// src/lineas/repositories/linea.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLineaDto } from '../dto/create-linea.dto';
import { UpdateLineaDto } from '../dto/update-linea.dto';
import { Linea } from '../entities/linea.entity';
import { ILineaRepository } from '../interfaces/linea.repository.interface';

@Injectable()
export class LineaRepository implements ILineaRepository {
    constructor(
        @InjectRepository(Linea)
        private readonly typeormRepository: Repository<Linea>,
    ) { }

    // Para que al buscar las líneas, también nos traiga la información de la marca asociada
    findAll(): Promise<Linea[]> {
        return this.typeormRepository.find({ relations: ['marca'] });
    }

    findById(id: number): Promise<Linea | null> {
        return this.typeormRepository.findOne({ where: { id }, relations: ['marca'] });
    }

    findByNameAndMarca(nombre: string, id_marca: number): Promise<Linea | null> {
        return this.typeormRepository.findOne({ where: { nombre, marca: { id: id_marca } } });
    }

    async create(createLineaDto: CreateLineaDto): Promise<Linea> {
        const nuevaLinea = this.typeormRepository.create({
            ...createLineaDto,
            marca: { id: createLineaDto.id_marca }, // Así se asigna la relación por ID
        });
        return this.typeormRepository.save(nuevaLinea);
    }

    async update(id: number, updateLineaDto: UpdateLineaDto): Promise<Linea> {
        const payload = {
            ...updateLineaDto,
            ...(updateLineaDto.id_marca && { marca: { id: updateLineaDto.id_marca } }),
        };
        await this.typeormRepository.update(id, payload);
        const updatedLinea = await this.findById(id);
        if (!updatedLinea) {
            throw new Error('Linea no encontrada');
        }
        return updatedLinea;
    }

    async delete(id: number): Promise<void> {
        await this.typeormRepository.delete(id);
    }
}