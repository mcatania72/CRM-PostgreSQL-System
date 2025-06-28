import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index, JoinColumn } from "typeorm";
import { Customer } from "./Customer";
import { User } from "./User";

export enum InteractionType {
    PHONE = "phone",
    EMAIL = "email",
    MEETING = "meeting",
    CHAT = "chat",
    SOCIAL = "social",
    WEBSITE = "website",
    OTHER = "other"
}

export enum InteractionDirection {
    INBOUND = "inbound",
    OUTBOUND = "outbound"
}

@Entity("interactions")
@Index(["type"])
@Index(["direction"])
@Index(["date"])
@Index(["customerId"])
@Index(["userId"])
export class Interaction {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "enum",
        enum: InteractionType,
        default: InteractionType.OTHER
    })
    type!: InteractionType;

    @Column({
        type: "enum",
        enum: InteractionDirection,
        default: InteractionDirection.OUTBOUND
    })
    direction!: InteractionDirection;

    @Column({ length: 255, nullable: true })
    subject?: string;

    @Column({ type: "text" })
    description!: string;

    @Column({ type: "text", nullable: true })
    notes?: string;

    @Column({ type: "timestamp with time zone" })
    date!: Date;

    @Column({ type: "integer", nullable: true })
    duration?: number; // in minutes

    @Column({ length: 100, nullable: true })
    channel?: string; // specific channel like 'LinkedIn', 'WhatsApp', etc.

    @Column({ type: "jsonb", nullable: true })
    metadata?: Record<string, any>; // for storing additional data like email headers, call logs, etc.

    @Column({ type: "text", array: true, nullable: true })
    tags?: string[];

    @Column({ type: "boolean", default: false })
    isImportant!: boolean;

    @Column({ type: "boolean", default: false })
    needsFollowUp!: boolean;

    @Column({ type: "timestamp with time zone", nullable: true })
    followUpDate?: Date;

    @CreateDateColumn({ type: "timestamp with time zone" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp with time zone" })
    updatedAt!: Date;

    // Relations
    @ManyToOne(() => Customer, customer => customer.interactions, {
        onDelete: "CASCADE",
        nullable: false
    })
    @JoinColumn({ name: "customerId" })
    customer!: Customer;

    @Column()
    customerId!: number;

    @ManyToOne(() => User, user => user.interactions, {
        onDelete: "SET NULL",
        nullable: true
    })
    @JoinColumn({ name: "userId" })
    user?: User;

    @Column({ nullable: true })
    userId?: number;

    // Virtual fields
    get isInbound(): boolean {
        return this.direction === InteractionDirection.INBOUND;
    }

    get isOutbound(): boolean {
        return this.direction === InteractionDirection.OUTBOUND;
    }

    get displayDuration(): string {
        if (!this.duration) return 'N/A';
        const hours = Math.floor(this.duration / 60);
        const minutes = this.duration % 60;
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    get isRecent(): boolean {
        const now = new Date();
        const interactionDate = new Date(this.date);
        const diffDays = (now.getTime() - interactionDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7; // within last 7 days
    }

    get needsFollowUpSoon(): boolean {
        if (!this.needsFollowUp || !this.followUpDate) return false;
        const now = new Date();
        const followUp = new Date(this.followUpDate);
        const diffHours = (followUp.getTime() - now.getTime()) / (1000 * 60 * 60);
        return diffHours <= 24 && diffHours > 0;
    }

    get isFollowUpOverdue(): boolean {
        if (!this.needsFollowUp || !this.followUpDate) return false;
        return new Date() > new Date(this.followUpDate);
    }

    // Helper methods
    markAsImportant(important: boolean = true): void {
        this.isImportant = important;
    }

    scheduleFollowUp(date: Date): void {
        this.needsFollowUp = true;
        this.followUpDate = date;
    }

    completeFollowUp(): void {
        this.needsFollowUp = false;
        this.followUpDate = undefined;
    }

    addTag(tag: string): void {
        if (!this.tags) this.tags = [];
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
        }
    }

    removeTag(tag: string): void {
        if (this.tags) {
            this.tags = this.tags.filter(t => t !== tag);
        }
    }
}