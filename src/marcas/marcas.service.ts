// src/marcas/marcas.service.ts
import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import type { IMarcaRepository } from './interfaces/marca.repository.interface';

@Injectable()
export class MarcasService {
  constructor(
    @Inject('IMarcaRepository')
    private readonly marcaRepository: IMarcaRepository,
  ) { }

  async create(nombre: string) {
    const marcaExistente = await this.marcaRepository.findOne({
      where: { nombre: nombre },
      withDeleted: true, // ¡Importante!
    });
    if (marcaExistente) {
      throw new ConflictException(`La marca "${nombre}" ya existe (puede estar "borrada").`);
    }
    return this.marcaRepository.create(nombre);
  }

  async findAll() {
    return this.marcaRepository.findAll();
  }

  async findOne(id: number) {
    const marca = await this.marcaRepository.findById(id);
    if (!marca) {
      throw new NotFoundException(`Marca con ID #${id} no encontrada`);
    }
    return marca;
  }

  async remove(id: number) {
    return this.marcaRepository.softDelete(id);
  }

  async update(id: number, nombre: string) {
    await this.findOne(id);
    
    // --- Verificación de unicidad en Update ---
     const marcaExistente = await this.marcaRepository.findOne({
      where: { nombre: nombre },
      withDeleted: true,
    });
    // Si existe Y NO es la misma marca que estoy editando
    if (marcaExistente && marcaExistente.id !== id) {
       throw new ConflictException(`El nombre "${nombre}" ya está en uso por otra marca (puede estar "borrada").`);
    }
    // --- Fin verificación ---

    return this.marcaRepository.update(id, nombre);
  }

  async restore(id: number) {
    const marca = await this.marcaRepository.findOne({ 
      where: { id }, 
      withDeleted: true 
    });
    if (!marca) {
      throw new NotFoundException(`Marca con ID #${id} no encontrada (incluso borrada)`);
    }
    if (!marca.fecha_eliminacion) {
      throw new ConflictException(`La marca con ID #${id} no está borrada.`);
    }

    // Validar conflicto antes de restaurar
    const conflicto = await this.marcaRepository.findOne({
      where: { nombre: marca.nombre } // Busca solo activos
    });
    if (conflicto) {
      throw new ConflictException(`No se puede restaurar. Ya existe una marca activa con el nombre "${marca.nombre}".`);
    }
    
    await this.marcaRepository.restore(id);
  }
}