// src/lineas/lineas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LineasService } from './lineas.service';
import { LineasController } from './lineas.controller';
import { Linea } from './entities/linea.entity';
import { LineaRepository } from './repository/linea.repository';
import { MarcasModule } from '../marcas/marcas.module'; // ¡Importante!

@Module({
  imports: [
    TypeOrmModule.forFeature([Linea]), // Registramos la entidad Linea
    MarcasModule, // Importamos para poder usar MarcasService
  ],
  controllers: [LineasController],
  providers: [
    LineasService,
    {
      provide: 'ILineaRepository',
      useClass: LineaRepository,
    },
  ],
})
export class LineasModule { }