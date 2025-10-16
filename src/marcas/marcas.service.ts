// src/marcas/marcas.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IMarcaRepository } from './interfaces/marca.repository.interface';

@Injectable()
export class MarcasService {
  constructor(
    @Inject('IMarcaRepository')
    private readonly marcaRepository: IMarcaRepository,
  ) { }

  async create(nombre: string) {
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

  async update(id: number, nombre: string) {
    await this.findOne(id); // para verificar que exite
    return this.marcaRepository.update(id, nombre);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.marcaRepository.delete(id);
  }
}