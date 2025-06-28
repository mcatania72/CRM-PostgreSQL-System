import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index, JoinColumn } from "typeorm";
import { Customer } from "./Customer";
import { Opportunity } from "./Opportunity";
import { User } from "./User";

export enum ActivityType {
    CALL = "call",
    EMAIL = "email",
    MEETING = "meeting",
    TASK = "task",
    NOTE = "note",
    FOLLOW_UP = "follow-up"
}

export enum ActivityStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    OVERDUE = "overdue"
}

export enum ActivityPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}

@Entity("activities")
@Index(["type"])
@Index(["status"])
@Index(["dueDate"])
@Index(["priority"])
@Index(["customerId"])
@Index(["opportunityId"])
@Index(["assignedToId"])
export class Activity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 255 })
    title!: string;

    @Column({ type: "text", nullable: true })
    description?: string;

    @Column({
        type: "enum",
        enum: ActivityType,
        default: ActivityType.TASK
    })
    type!: ActivityType;

    @Column({
        type: "enum",
        enum: ActivityStatus,
        default: ActivityStatus.PENDING
    })
    status!: ActivityStatus;

    @Column({
        type: "enum",
        enum: ActivityPriority,
        default: ActivityPriority.MEDIUM
    })
    priority!: ActivityPriority;

    @Column({ type: "timestamp with time zone", nullable: true })
    dueDate?: Date;

    @Column({ type: "timestamp with time zone", nullable: true })
    completedAt?: Date;

    @Column({ type: "integer", nullable: true })
    estimatedDuration?: number; // in minutes

    @Column({ type: "integer", nullable: true })
    actualDuration?: number; // in minutes

    @Column({ type: "text", nullable: true })
    result?: string;

    @Column({ type: "text", nullable: true })
    notes?: string;

    @Column({ type: "jsonb", nullable: true })
    customFields?: Record<string, any>;

    @Column({ type: "text", array: true, nullable: true })
    tags?: string[];

    @CreateDateColumn({ type: "timestamp with time zone" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp with time zone" })
    updatedAt!: Date;

    // Relations
    @ManyToOne(() => Customer, customer => customer.activities, {
        onDelete: "CASCADE",
        nullable: false
    })
    @JoinColumn({ name: "customerId" })
    customer!: Customer;

    @Column()
    customerId!: number;

    @ManyToOne(() => Opportunity, opportunity => opportunity.activities, {
        onDelete: "CASCADE",
        nullable: true
    })
    @JoinColumn({ name: "opportunityId" })
    opportunity?: Opportunity;

    @Column({ nullable: true })
    opportunityId?: number;

    @ManyToOne(() => User, user => user.activities, {
        onDelete: "SET NULL",
        nullable: true
    })
    @JoinColumn({ name: "assignedToId" })
    assignedTo?: User;

    @Column({ nullable: true })
    assignedToId?: number;

    // Virtual fields
    get isCompleted(): boolean {
        return this.status === ActivityStatus.COMPLETED;
    }

    get isPending(): boolean {
        return this.status === ActivityStatus.PENDING;
    }

    get isOverdue(): boolean {
        if (!this.dueDate || this.isCompleted) return false;
        return new Date() > new Date(this.dueDate);
    }

    get isDueToday(): boolean {
        if (!this.dueDate || this.isCompleted) return false;
        const today = new Date();
        const due = new Date(this.dueDate);
        return today.toDateString() === due.toDateString();
    }

    get isDueSoon(): boolean {
        if (!this.dueDate || this.isCompleted) return false;
        const now = new Date();
        const due = new Date(this.dueDate);
        const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
        return diffHours <= 24 && diffHours > 0;
    }

    get displayDuration(): string {
        const duration = this.actualDuration || this.estimatedDuration;
        if (!duration) return 'N/A';
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    // Helper methods
    complete(result?: string, actualDuration?: number): void {
        this.status = ActivityStatus.COMPLETED;
        this.completedAt = new Date();
        if (result) this.result = result;
        if (actualDuration) this.actualDuration = actualDuration;
    }

    cancel(reason?: string): void {
        this.status = ActivityStatus.CANCELLED;
        if (reason) this.notes = (this.notes || '') + `\nCancelled: ${reason}`;
    }

    updateStatus(): void {
        if (this.isOverdue && this.status === ActivityStatus.PENDING) {
            this.status = ActivityStatus.OVERDUE;
        }
    }
}