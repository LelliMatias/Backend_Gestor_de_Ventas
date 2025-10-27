import { Proveedor } from "../entities/proveedor.entity";
import { CreateProveedorDto } from "../dto/create-proveedor.dto";
import { UpdateProveedorDto } from "../dto/update-proveedor.dto";
export interface IProveedorRepository {
    findAll(): Promise<Proveedor[]>;
    findById(id: number): Promise<Proveedor | null>;
    create(createProveedorDto: CreateProveedorDto): Promise<Proveedor>;
    update(id: number, updateProveedorDto: UpdateProveedorDto): Promise<Proveedor>;
    delete(id: number): Promise<void>;
}