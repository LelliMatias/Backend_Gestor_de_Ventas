// src/lineas/lineas.service.ts
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MarcasService } from '../marcas/marcas.service'; // Importamos MarcasService
import { CreateLineaDto } from './dto/create-linea.dto';
import { UpdateLineaDto } from './dto/update-linea.dto';
import type { ILineaRepository } from './interfaces/linea.repository.interface';

@Injectable()
export class LineasService {
  constructor(
    @Inject('ILineaRepository')
    private readonly lineaRepository: ILineaRepository,
    private readonly marcasService: MarcasService,
  ) { }

  async create(createLineaDto: CreateLineaDto) {
    // 1. Verificamos que la marca exista. Si no, MarcasService lanzará un NotFoundException.
    await this.marcasService.findOne(createLineaDto.id_marca);

    // 2. Verificamos si ya existe una línea con el mismo nombre para esa marca.
    const lineaExistente = await this.lineaRepository.findByNameAndMarca(createLineaDto.nombre, createLineaDto.id_marca);
    if (lineaExistente) {
      throw new ConflictException(`Ya existe una línea con el nombre "${createLineaDto.nombre}" para esta marca.`);
    }

    return this.lineaRepository.create(createLineaDto);
  }

  findAll() {
    return this.lineaRepository.findAll();
  }

  async findOne(id: number) {
    const linea = await this.lineaRepository.findById(id);
    if (!linea) {
      throw new NotFoundException(`Línea con ID #${id} no encontrada`);
    }
    return linea;
  }

  async update(id: number, updateLineaDto: UpdateLineaDto) {
    await this.findOne(id);

    if (updateLineaDto.id_marca) {
      await this.marcasService.findOne(updateLineaDto.id_marca);
    }
    return this.lineaRepository.update(id, updateLineaDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.lineaRepository.delete(id);
  }
}