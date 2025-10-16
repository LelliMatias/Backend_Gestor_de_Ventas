import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'Marca' })
export class Marca {
    @PrimaryGeneratedColumn({ name: 'id_marca' })
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    nombre: string;
}