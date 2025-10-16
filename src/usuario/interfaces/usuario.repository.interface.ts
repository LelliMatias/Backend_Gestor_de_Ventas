import { CreateUsuarioDto } from "../dto/create-usuario.dto";
import { Usuario } from "../entities/usuario.entity";

export interface IUsuarioRepository {
    findAll(): Promise<Usuario[]>;
    findById(id: number): Promise<Usuario | null>;
    create(createDto: CreateUsuarioDto): Promise<Usuario>;
    save(usuario: Usuario): Promise<Usuario>; //Usamos save debido a que hasheamos la contraseña y usamos el ORM, mas seguro en este caso
    delete(id: number): Promise<void>;
}