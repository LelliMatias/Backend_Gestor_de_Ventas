// usuario.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Inject } from '@nestjs/common';
import type { IUsuarioRepository } from './interfaces/usuario.repository.interface';
import { Usuario } from './entities/usuario.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
  ) { }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const nuevoUsuario = this.usuarioRepository.create(createUsuarioDto);
    return this.usuarioRepository.save(await nuevoUsuario);
  }


  findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.findAll();
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID #${id} no encontrado`);
    }
    return usuario;
  }

  async findOneByEmail(email: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findOneByEmail(email);
  }


  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuarioToUpdate = await this.findOne(id);

    if (updateUsuarioDto.contraseña) {
      updateUsuarioDto.contraseña = await bcrypt.hash(updateUsuarioDto.contraseña, 10);
    }

    Object.assign(usuarioToUpdate, updateUsuarioDto);

    return this.usuarioRepository.save(usuarioToUpdate);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    return this.usuarioRepository.delete(id);
  }
}