import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from "typeorm";
import { Opportunity } from "./Opportunity";
import { Interaction } from "./Interaction";
import { Activity } from "./Activity";

export enum CustomerStatus {
    PROSPECT = "prospect",
    ACTIVE = "active", 
    INACTIVE = "inactive",
    LOST = "lost"
}

@Entity("customers")
@Index(["status"])
@Index(["company"])
@Index(["email"])
@Index(["createdAt"])
export class Customer {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 255 })
    name!: string;

    @Column({ length: 255, nullable: true })
    company?: string;

    @Column({ length: 100, nullable: true })
    industry?: string;

    @Column({ length: 255, nullable: true })
    email?: string;

    @Column({ length: 50, nullable: true })
    phone?: string;

    @Column({ type: "text", nullable: true })
    address?: string;

    @Column({ length: 100, nullable: true })
    city?: string;

    @Column({ length: 10, nullable: true })
    postalCode?: string;

    @Column({ length: 100, nullable: true })
    state?: string;

    @Column({ length: 100, nullable: true })
    country?: string;

    @Column({
        type: "enum",
        enum: CustomerStatus,
        default: CustomerStatus.PROSPECT
    })
    status!: CustomerStatus;

    @Column({ type: "text", nullable: true })
    notes?: string;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    estimatedValue?: number;

    @Column({ length: 255, nullable: true })
    website?: string;

    @Column({ type: "integer", nullable: true })
    employeeCount?: number;

    @Column({ type: "jsonb", nullable: true })
    customFields?: Record<string, any>;

    @Column({ type: "text", array: true, nullable: true })
    tags?: string[];

    @CreateDateColumn({ type: "timestamp with time zone" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp with time zone" })
    updatedAt!: Date;

    // Relations with cascade delete
    @OneToMany(() => Opportunity, opportunity => opportunity.customer, { 
        cascade: ["remove"],
        onDelete: "CASCADE"
    })
    opportunities!: Opportunity[];

    @OneToMany(() => Interaction, interaction => interaction.customer, {
        cascade: ["remove"],
        onDelete: "CASCADE"
    })
    interactions!: Interaction[];

    @OneToMany(() => Activity, activity => activity.customer, {
        cascade: ["remove"],
        onDelete: "CASCADE"
    })
    activities!: Activity[];

    // Virtual fields
    get displayName(): string {
        return this.company ? `${this.name} (${this.company})` : this.name;
    }

    get isActive(): boolean {
        return this.status === CustomerStatus.ACTIVE;
    }

    get isProspect(): boolean {
        return this.status === CustomerStatus.PROSPECT;
    }

    // Helper methods
    getTotalOpportunityValue(): number {
        return this.opportunities?.reduce((sum, opp) => sum + (opp.value || 0), 0) || 0;
    }

    getActiveOpportunities(): Opportunity[] {
        return this.opportunities?.filter(opp => 
            opp.stage !== 'closed-lost' && opp.stage !== 'closed-won'
        ) || [];
    }
}