// usuario.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    // <-- BUENA PRÁCTICA: Lógica de negocio antes de la creación.
    // 1. Hashear la contraseña.
    const hashedPassword = await bcrypt.hash(createUsuarioDto.contraseña, 10);

    // 2. Preparar la nueva entidad con la contraseña hasheada.
    const nuevoUsuario = {
      ...createUsuarioDto,
      contraseña: hashedPassword,
    };
    
    // 3. Pasar la entidad preparada al repositorio.
    return this.usuarioRepository.create(nuevoUsuario);
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

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    // <-- PRINCIPIO SRP: El servicio orquesta la actualización.
    // 1. Busca la entidad. findOne ya se encarga de lanzar el error 404 si no existe.
    const usuarioToUpdate = await this.findOne(id);

    // 2. Si se está actualizando la contraseña, la hasheamos.
    if (updateUsuarioDto.contraseña) {
      updateUsuarioDto.contraseña = await bcrypt.hash(updateUsuarioDto.contraseña, 10);
    }
    
    // 3. Fusionamos los datos del DTO (ya procesados) en la entidad.
    Object.assign(usuarioToUpdate, updateUsuarioDto);
    
    // 4. Le pasamos la entidad COMPLETA al repositorio para que la guarde.
    return this.usuarioRepository.save(usuarioToUpdate);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    return this.usuarioRepository.delete(id);
  }
}