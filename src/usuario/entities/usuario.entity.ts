import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum RolUsuario {
    ADMIN = "ADMIN",
    VENDEDOR = "VENDEDOR"
}

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: false})
    nombre: string;

    @Column( {nullable: false })
    contraseña: string;

    @Column({nullable: false, unique: true})
    email: string;
    

    @Column({
        type: 'enum',
        enum: RolUsuario,
        default: RolUsuario.VENDEDOR
    })

    rol: RolUsuario;
}