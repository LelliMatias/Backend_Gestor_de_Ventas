import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum RolUsuario {
    ADMIN = "ADMIN",
    VENDEDOR = "VENDEDOR"
}

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    contraseña: string;

    @Column({
        type: "enum",
        enum: RolUsuario
    })
    rol: RolUsuario;
}