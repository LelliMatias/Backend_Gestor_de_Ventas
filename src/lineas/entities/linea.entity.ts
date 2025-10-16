// src/lineas/entities/linea.entity.ts
import { Marca } from '../../marcas/entities/marca.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';

@Entity({ name: 'Linea' })

@Unique(['nombre', 'marca'])
export class Linea {
    @PrimaryGeneratedColumn({ name: 'id_linea' })
    id: number;

    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;


    @ManyToOne(() => Marca, { nullable: false })
    @JoinColumn({ name: 'id_marca' })
    marca: Marca;
}