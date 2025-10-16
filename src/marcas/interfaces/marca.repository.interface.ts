import { Marca } from '../entities/marca.entity';

export interface IMarcaRepository {
    findAll(): Promise<Marca[]>;
    findById(id: number): Promise<Marca | null>;
    create(nombre: string): Promise<Marca>;
    update(id: number, nombre: string): Promise<Marca>;
    delete(id: number): Promise<void>;
}