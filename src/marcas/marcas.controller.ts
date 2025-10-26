// src/marcas/marcas.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { MarcasService } from './marcas.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';

@Controller('marcas')
export class MarcasController {
  constructor(private readonly marcasService: MarcasService) { }

  @Post()
  create(@Body() createMarcaDto: CreateMarcaDto) {
    // Esto ya funciona con la lógica de unicidad (withDeleted)
    return this.marcasService.create(createMarcaDto.nombre);
  }

  @Get()
  findAll() {
    // Esto está perfecto, solo trae los activos (no borrados)
    return this.marcasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // Esto está perfecto, solo trae uno activo
    return this.marcasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMarcaDto: UpdateMarcaDto) {
    if (updateMarcaDto.nombre === undefined) {
      throw new Error('El nombre no puede ser indefinido');
    }
    // Esto ya funciona con la lógica de unicidad en el update
    return this.marcasService.update(id, updateMarcaDto.nombre);
  }

  // --- 1. CORRECCIÓN AQUÍ ---
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.marcasService.remove(id);
  }

  // --- 2. ENDPOINT AÑADIDO ---
  /**
   * Restaura una marca que fue borrada lógicamente.
   */
  @Post(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.marcasService.restore(id);
  }
}