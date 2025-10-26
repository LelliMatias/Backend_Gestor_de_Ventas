import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity({ name: 'Marca' })
export class Marca {
    @PrimaryGeneratedColumn({ name: 'id_marca' })
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    nombre: string;

    @DeleteDateColumn({
        name: 'fecha_eliminacion',
        type: 'timestamp',
        nullable: true
    })
    fecha_eliminacion?: Date;
}