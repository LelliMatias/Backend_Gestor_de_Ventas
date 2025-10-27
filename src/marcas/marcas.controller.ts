// src/marcas/marcas.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MarcasService } from './marcas.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { RolUsuario } from 'src/usuario/entities/usuario.entity';

@Controller('marcas')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(RolUsuario.ADMIN)
export class MarcasController {
  constructor(private readonly marcasService: MarcasService) { }

  @Post()
  create(@Body() createMarcaDto: CreateMarcaDto) {
    return this.marcasService.create(createMarcaDto.nombre);
  }

  @Get()
  findAll() {
    return this.marcasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.marcasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMarcaDto: UpdateMarcaDto) {
    if (updateMarcaDto.nombre === undefined) {
      throw new Error('El nombre no puede ser indefinido');
    }
    return this.marcasService.update(id, updateMarcaDto.nombre);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.marcasService.remove(id);
  }

  @Post(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.marcasService.restore(id);
  }
}