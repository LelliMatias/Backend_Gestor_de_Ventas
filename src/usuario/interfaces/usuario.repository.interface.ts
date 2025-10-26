import { CreateUsuarioDto } from "../dto/create-usuario.dto";
import { Usuario } from "../entities/usuario.entity";
import { FindOneOptions } from "typeorm";

export interface IUsuarioRepository {
    findAll(): Promise<Usuario[]>;
    findById(id: number): Promise<Usuario | null>;
    create(createDto: CreateUsuarioDto): Promise<Usuario>;
    save(usuario: Usuario): Promise<Usuario>; //Usamos save debido a que hasheamos la contraseña y usamos el ORM, mas seguro en este caso
    delete(id: number): Promise<void>;
    findOneByEmail(email: string): Promise<Usuario | null>;
    /**
     * Busca una entidad 'Usuario' que coincida con las opciones.
     * Esencial para usar 'withDeleted: true' en el servicio.
     */
    findOne(options: FindOneOptions<Usuario>): Promise<Usuario | null>;
    softDelete(id: number): Promise<void>;
    restore(id: number): Promise<void>;
}