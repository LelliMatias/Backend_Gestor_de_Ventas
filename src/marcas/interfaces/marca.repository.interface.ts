import { Marca } from '../entities/marca.entity';
import { FindOneOptions } from "typeorm";

export interface IMarcaRepository {
    findAll(): Promise<Marca[]>;
    findById(id: number): Promise<Marca | null>;
    create(nombre: string): Promise<Marca>;
    update(id: number, nombre: string): Promise<Marca>;
    delete(id: number): Promise<void>;
    /**
     * Busca una entidad 'Marca' que coincida con las opciones.
     * Esencial para usar 'withDeleted: true' en el servicio.
     */
    findOne(options: FindOneOptions<Marca>): Promise<Marca | null>;
    softDelete(id: number): Promise<void>;
    restore(id: number): Promise<void>;
}