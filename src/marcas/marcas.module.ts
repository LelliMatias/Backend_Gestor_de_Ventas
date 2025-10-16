// src/marcas/marcas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarcasService } from './marcas.service';
import { MarcasController } from './marcas.controller';
import { Marca } from './entities/marca.entity';
import { MarcaRepository } from './repositories/marca.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Marca])
  ],
  controllers: [MarcasController],
  providers: [
    MarcasService,
    {
      provide: 'IMarcaRepository',
      useClass: MarcaRepository,
    },
  ],
  exports: [MarcasService],
})
export class MarcasModule { }