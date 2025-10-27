import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from '../entities/proveedor.entity';
import { IProveedorRepository } from '../interfaces/proveedor.repository.interface';
import { CreateProveedorDto } from '../dto/create-proveedor.dto';
import { UpdateProveedorDto } from '../dto/update-proveedor.dto';

@Injectable()
export class ProveedorRepository implements IProveedorRepository {
    constructor(
        @InjectRepository(Proveedor)
        private readonly typeormRepository: Repository<Proveedor>,
    ) { }

    findAll(): Promise<Proveedor[]> {
        return this.typeormRepository.find();
    }

    findById(id: number): Promise<Proveedor | null> {
        return this.typeormRepository.findOneBy({ id });
    }

    async create(createProveedorDto: CreateProveedorDto): Promise<Proveedor> {
        const nuevaProveedor = this.typeormRepository.create(createProveedorDto);
        return this.typeormRepository.save(nuevaProveedor);
    }

    async update(id: number, updateProveedorDto: UpdateProveedorDto): Promise<Proveedor> {
        await this.typeormRepository.update(id, updateProveedorDto);
        const updatedProveedor = await this.findById(id);
        if (!updatedProveedor) {
            throw new Error('Proveedor no encontrada');
        }
        return updatedProveedor;
    }

    async delete(id: number): Promise<void> {
        await this.typeormRepository.delete(id);
    }
}