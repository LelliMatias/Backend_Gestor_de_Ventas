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
  ) { }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {

    // 1. Verificar unicidad de email
    const emailExiste = await this.usuarioRepository.findOne({
      where: { email: createUsuarioDto.email },
      withDeleted: true, // Esto sigue siendo correcto para buscar en *todos*
    });
    
    if (emailExiste) {
      throw new ConflictException('El email ya se encuentra registrado.');
    }

    const hashedPassword = await bcrypt.hash(createUsuarioDto.contraseña, 10); // hasheo contraseña

    const nuevoUsuario = {
      ...createUsuarioDto,
      contraseña: hashedPassword,
    };
    
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

  async findOneByEmail(email: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findOneByEmail(email);
  }


  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    // Nota: El update de unicidad también debería usar withDeleted
    // pero es más complejo (ej: ¿el email es el mismo que el actual?).
    // Por simplicidad, lo dejamos así por ahora.
    const usuarioToUpdate = await this.findOne(id);

    if (updateUsuarioDto.contraseña) {
      updateUsuarioDto.contraseña = await bcrypt.hash(updateUsuarioDto.contraseña, 10);
    }

    Object.assign(usuarioToUpdate, updateUsuarioDto);

    return this.usuarioRepository.save(usuarioToUpdate);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Verifica que exista
    await this.usuarioRepository.softDelete(id);
  }

  async restore(id: number): Promise<void> {
    // Buscar CON borrados
    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario: id },
      withDeleted: true,
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID #${id} no encontrado (incluso borrado)`);
    }
    if (!usuario.fecha_eliminacion) {
       throw new ConflictException(`El usuario con ID #${id} no está borrado.`);
    }

    // Antes de restaurar, verificar si hay un conflicto de unicidad
    // (Ej: alguien creó un usuario con el mismo email mientras este estaba borrado)
    const emailConflicto = await this.usuarioRepository.findOne({
      where: { email: usuario.email } // Busca solo activos
    });
    if (emailConflicto) {
       throw new ConflictException(`No se puede restaurar. Ya existe un usuario activo con el email ${usuario.email}.`);
    }
    
    // (Repetir para 'nombre' si es necesario)
    const nombreConflicto = await this.usuarioRepository.findOne({
      where: { nombre: usuario.nombre } // Busca solo activos
    });
    if (nombreConflicto) {
       throw new ConflictException(`No se puede restaurar. Ya existe un usuario activo con el nombre ${usuario.nombre}.`);
    }

    await this.usuarioRepository.restore(id);
  }
}