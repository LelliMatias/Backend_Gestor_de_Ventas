import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Venta } from "../../venta/entities/venta.entity";

export enum RolUsuario {
    ADMIN = "ADMIN",
    VENDEDOR = "VENDEDOR"
}

@Entity({ name: 'Usuario' })
export class Usuario {
    @PrimaryGeneratedColumn()
    id_usuario: number;

    @Column({ unique: true, nullable: false })
    nombre: string;


    @Column({ nullable: false, unique: true })
    email: string;


    @Column({ nullable: false })
    contraseña: string;

    @Column({
        type: 'enum',
        enum: RolUsuario,
        default: RolUsuario.VENDEDOR
    })

    rol: RolUsuario;


    @OneToMany(() => Venta, (venta) => venta.usuario)
    ventas: Venta[];

    @DeleteDateColumn({
        name: 'fecha_eliminacion',
        type: 'timestamp',
        nullable: true
    })
    fecha_eliminacion?: Date;
}