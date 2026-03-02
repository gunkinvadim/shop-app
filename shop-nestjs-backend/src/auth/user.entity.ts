import { Product } from "../products/product.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

export type Role = "BUYER" | "SELLER" | "ADMIN" | "MODERATOR";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: "simple-array" })
    roles: Role[];

    @OneToMany(() => Product, product => product.seller)
    products: Product[];
}