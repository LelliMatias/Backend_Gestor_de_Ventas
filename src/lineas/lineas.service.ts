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

    const lineaExistente = await this.lineaRepository.findOne({
      where: {
        nombre: createLineaDto.nombre,
        marca: { id: createLineaDto.id_marca } // Asumiendo repo estándar de TypeORM
      },
      withDeleted: true, // ¡Importante!
    });

  if (lineaExistente) {
    throw new ConflictException(`Ya existe una línea con el nombre "${createLineaDto.nombre}" para esta marca (puede estar "borrada").`);
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
    await this.lineaRepository.softDelete(id);
  }

  async restore(id: number) {
    const linea = await this.lineaRepository.findOne({ 
     where: { id }, 
     withDeleted: true,
     relations: ['marca'] // Cargar la marca para la validación
   });
   if (!linea) {
     throw new NotFoundException(`Línea con ID #${id} no encontrada (incluso borrada)`);
   }
   if (!linea.fecha_eliminacion) {
     throw new ConflictException(`La línea con ID #${id} no está borrada.`);
   }

   // Validar conflicto antes de restaurar
   const conflicto = await this.lineaRepository.findOne({
     where: { 
       nombre: linea.nombre,
       marca: { id: linea.marca.id }
     } // Busca solo activos
   });
   if (conflicto) {
     throw new ConflictException(`No se puede restaurar. Ya existe una línea activa con ese nombre para esa marca.`);
   }

   await this.lineaRepository.restore(id);
 }
}
