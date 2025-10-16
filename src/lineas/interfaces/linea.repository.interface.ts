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
}