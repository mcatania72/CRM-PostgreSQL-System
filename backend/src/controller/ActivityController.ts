import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Activity, ActivityStatus } from '../entity/Activity';
import { User, UserRole } from '../entity/User';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';

export class ActivityController {
    
    static async getAll(req: AuthRequest, res: Response) {
        try {
            const { status, type, assignedToId, page = 1, limit = 10 } = req.query;
            
            const activityRepository = AppDataSource.getRepository(Activity);
            const queryBuilder = activityRepository.createQueryBuilder('activity')
                .leftJoinAndSelect('activity.assignedTo', 'user')
                .leftJoinAndSelect('activity.customer', 'customer');

            // Filtri
            if (status) {
                queryBuilder.where('activity.status = :status', { status });
            }

            if (type) {
                queryBuilder.andWhere('activity.type = :type', { type });
            }

            if (assignedToId) {
                queryBuilder.andWhere('activity.assignedToId = :assignedToId', { assignedToId });
            }

            // Se non è admin, mostra solo le proprie attività
            if (req.user?.role !== UserRole.ADMIN) {
                queryBuilder.andWhere('activity.assignedToId = :userId', { userId: req.user?.id });
            }

            // Paginazione
            const skip = (Number(page) - 1) * Number(limit);
            queryBuilder.skip(skip).take(Number(limit));

            // Ordinamento per data di scadenza
            queryBuilder.orderBy('activity.dueDate', 'ASC');

            const [activities, total] = await queryBuilder.getManyAndCount();

            res.json({
                activities,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            console.error('Errore nel recupero attività:', error);
            res.status(500).json({ message: 'Errore interno del server' });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const activityRepository = AppDataSource.getRepository(Activity);
            
            const activity = await activityRepository.findOne({
                where: { id: Number(id) },
                relations: ['assignedTo', 'customer']
            });

            if (!activity) {
                return res.status(404).json({ message: 'Attività non trovata' });
            }

            res.json(activity);
        } catch (error) {
            console.error('Errore nel recupero attività:', error);
            res.status(500).json({ message: 'Errore interno del server' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const activityRepository = AppDataSource.getRepository(Activity);
            const newActivity = activityRepository.create(req.body);
            
            const savedActivity = await activityRepository.save(newActivity) as unknown as Activity;
            
            // Ricarica con le relazioni
            const activityWithRelations = await activityRepository.findOne({
                where: { id: savedActivity.id },
                relations: ['assignedTo', 'customer']
            });
            
            res.status(201).json({
                message: 'Attività creata con successo',
                activity: activityWithRelations
            });
        } catch (error) {
            console.error('Errore nella creazione attività:', error);
            res.status(500).json({ message: 'Errore interno del server' });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { id } = req.params;
            const activityRepository = AppDataSource.getRepository(Activity);
            
            let activity = await activityRepository.findOne({ 
                where: { id: Number(id) },
                relations: ['assignedTo', 'customer']
            });
            
            if (!activity) {
                return res.status(404).json({ message: 'Attività non trovata' });
            }

            // Se l'attività viene completata, imposta la data di completamento
            if (req.body.status === ActivityStatus.COMPLETED && !activity.completedAt) {
                req.body.completedAt = new Date();
            }

            activityRepository.merge(activity, req.body);
            await activityRepository.save(activity);

            res.json({
                message: 'Attività aggiornata con successo',
                activity
            });
        } catch (error) {
            console.error('Errore nell\'aggiornamento attività:', error);
            res.status(500).json({ message: 'Errore interno del server' });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const activityRepository = AppDataSource.getRepository(Activity);
            
            const activity = await activityRepository.findOne({ where: { id: Number(id) } });
            if (!activity) {
                return res.status(404).json({ message: 'Attività non trovata' });
            }

            await activityRepository.remove(activity);
            
            res.json({ message: 'Attività eliminata con successo' });
        } catch (error) {
            console.error('Errore nell\'eliminazione attività:', error);
            res.status(500).json({ message: 'Errore interno del server' });
        }
    }

    static async markAsCompleted(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const activityRepository = AppDataSource.getRepository(Activity);
            
            let activity = await activityRepository.findOne({ where: { id: Number(id) } });
            if (!activity) {
                return res.status(404).json({ message: 'Attività non trovata' });
            }

            activity.status = ActivityStatus.COMPLETED;
            activity.completedAt = new Date();
            
            await activityRepository.save(activity);
            
            res.json({
                message: 'Attività marcata come completata',
                activity
            });
        } catch (error) {
            console.error('Errore nel completamento attività:', error);
            res.status(500).json({ message: 'Errore interno del server' });
        }
    }
}