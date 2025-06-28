import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from "typeorm";
import { Activity } from "./Activity";
import { Interaction } from "./Interaction";

export enum UserRole {
    ADMIN = "admin",
    MANAGER = "manager", 
    SALESPERSON = "salesperson",
    USER = "user"
}

@Entity("users")
@Index(["email"], { unique: true })
@Index(["isActive"])
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true, length: 255 })
    email!: string;

    @Column({ length: 255 })
    password!: string;

    @Column({ length: 255 })
    name!: string;

    @Column({ length: 100, nullable: true })
    firstName?: string;

    @Column({ length: 100, nullable: true })
    lastName?: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.USER
    })
    role!: UserRole;

    @Column({ default: true })
    isActive!: boolean;

    @Column({ type: "timestamp", nullable: true })
    lastLoginAt?: Date;

    @Column({ type: "inet", nullable: true })
    lastLoginIp?: string;

    @Column({ type: "jsonb", nullable: true })
    preferences?: Record<string, any>;

    @CreateDateColumn({ type: "timestamp with time zone" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp with time zone" })
    updatedAt!: Date;

    // Relations
    @OneToMany(() => Activity, activity => activity.assignedTo)
    activities!: Activity[];

    @OneToMany(() => Interaction, interaction => interaction.user)
    interactions!: Interaction[];

    // Virtual fields
    get fullName(): string {
        if (this.firstName && this.lastName) {
            return `${this.firstName} ${this.lastName}`;
        }
        return this.name;
    }

    get isAdmin(): boolean {
        return this.role === UserRole.ADMIN;
    }

    get isManager(): boolean {
        return this.role === UserRole.MANAGER || this.role === UserRole.ADMIN;
    }
}