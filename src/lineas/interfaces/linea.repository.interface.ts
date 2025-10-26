import { FindOneOptions } from 'typeorm';
import { CreateLineaDto } from '../dto/create-linea.dto';
import { UpdateLineaDto } from '../dto/update-linea.dto';
import { Linea } from '../entities/linea.entity';

export interface ILineaRepository {
    findAll(): Promise<Linea[]>;
    findById(id: number): Promise<Linea | null>;
    findByNameAndMarca(nombre: string, id_marca: number): Promise<Linea | null>;
    create(createLineaDto: CreateLineaDto): Promise<Linea>;
    update(id: number, updateLineaDto: UpdateLineaDto): Promise<Linea>;
    delete(id: number): Promise<void>;
    /**
         * Busca una entidad 'Linea' que coincida con las opciones.
         * Esencial para usar 'withDeleted: true' en el servicio.
         */
    findOne(options: FindOneOptions<Linea>): Promise<Linea | null>;
    softDelete(id: number): Promise<void>;
    restore(id: number): Promise<void>;
}