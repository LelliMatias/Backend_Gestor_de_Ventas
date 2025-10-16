// src/marcas/repositories/marca.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { IUsuarioRepository } from '../interfaces/usuario.repository.interface';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';

@Injectable()
export class UsuarioRepository implements IUsuarioRepository {
    constructor(
        @InjectRepository(Usuario)
        private readonly typeormRepository: Repository<Usuario>,
    ) { }

    findAll(): Promise<Usuario[]> {
        return this.typeormRepository.find();
    }

    findById(id: number): Promise<Usuario | null> {
        return this.typeormRepository.findOneBy({ id });
    }

    async create(createDto: CreateUsuarioDto): Promise<Usuario> {
        const nuevoUsuario = this.typeormRepository.create(createDto);
        return this.typeormRepository.save(nuevoUsuario);
    }

    save(usuario: Usuario): Promise<Usuario> {
        return this.typeormRepository.save(usuario);
    }

    async delete(id: number): Promise<void> {
        await this.typeormRepository.delete(id);
    }
}
    