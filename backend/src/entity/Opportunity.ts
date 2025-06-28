import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Index, JoinColumn } from "typeorm";
import { Customer } from "./Customer";
import { Activity } from "./Activity";

export enum OpportunityStage {
    LEAD = "lead",
    QUALIFIED = "qualified",
    PROPOSAL = "proposal",
    NEGOTIATION = "negotiation",
    CLOSED_WON = "closed-won",
    CLOSED_LOST = "closed-lost"
}

@Entity("opportunities")
@Index(["stage"])
@Index(["expectedCloseDate"])
@Index(["value"])
@Index(["customerId"])
export class Opportunity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 255 })
    title!: string;

    @Column({ type: "text", nullable: true })
    description?: string;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    value?: number;

    @Column({
        type: "enum",
        enum: OpportunityStage,
        default: OpportunityStage.LEAD
    })
    stage!: OpportunityStage;

    @Column({ type: "integer", default: 0, nullable: true })
    probability?: number; // 0-100

    @Column({ type: "date", nullable: true })
    expectedCloseDate?: Date;

    @Column({ type: "date", nullable: true })
    actualCloseDate?: Date;

    @Column({ length: 100, nullable: true })
    source?: string;

    @Column({ length: 100, nullable: true })
    competitorAnalysis?: string;

    @Column({ type: "text", nullable: true })
    lossReason?: string;

    @Column({ type: "jsonb", nullable: true })
    customFields?: Record<string, any>;

    @Column({ type: "text", array: true, nullable: true })
    tags?: string[];

    @CreateDateColumn({ type: "timestamp with time zone" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp with time zone" })
    updatedAt!: Date;

    // Relations
    @ManyToOne(() => Customer, customer => customer.opportunities, {
        onDelete: "CASCADE",
        nullable: false
    })
    @JoinColumn({ name: "customerId" })
    customer!: Customer;

    @Column()
    customerId!: number;

    @OneToMany(() => Activity, activity => activity.opportunity, {
        cascade: ["remove"],
        onDelete: "CASCADE"
    })
    activities!: Activity[];

    // Virtual fields
    get isClosed(): boolean {
        return this.stage === OpportunityStage.CLOSED_WON || 
               this.stage === OpportunityStage.CLOSED_LOST;
    }

    get isWon(): boolean {
        return this.stage === OpportunityStage.CLOSED_WON;
    }

    get isLost(): boolean {
        return this.stage === OpportunityStage.CLOSED_LOST;
    }

    get isActive(): boolean {
        return !this.isClosed;
    }

    get displayValue(): string {
        if (!this.value) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(this.value);
    }

    get daysToClose(): number | null {
        if (!this.expectedCloseDate || this.isClosed) return null;
        const today = new Date();
        const closeDate = new Date(this.expectedCloseDate);
        const diffTime = closeDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    get isOverdue(): boolean {
        const days = this.daysToClose;
        return days !== null && days < 0 && this.isActive;
    }

    // Helper methods
    close(won: boolean, reason?: string): void {
        this.stage = won ? OpportunityStage.CLOSED_WON : OpportunityStage.CLOSED_LOST;
        this.actualCloseDate = new Date();
        this.probability = won ? 100 : 0;
        if (!won && reason) {
            this.lossReason = reason;
        }
    }

    updateProbabilityByStage(): void {
        const stageToProb: Record<OpportunityStage, number> = {
            [OpportunityStage.LEAD]: 10,
            [OpportunityStage.QUALIFIED]: 25,
            [OpportunityStage.PROPOSAL]: 50,
            [OpportunityStage.NEGOTIATION]: 75,
            [OpportunityStage.CLOSED_WON]: 100,
            [OpportunityStage.CLOSED_LOST]: 0
        };
        this.probability = stageToProb[this.stage];
    }
}