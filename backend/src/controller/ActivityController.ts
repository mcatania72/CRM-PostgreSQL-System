import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Activity, ActivityStatus } from '../entity/Activity';
import { validationResult } from 'express-validator';
import { Between, ILike, LessThan, MoreThan } from 'typeorm';

export class ActivityController {
    
    static async getAll(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { page = 1, limit = 20, search, status, startDate, endDate } = req.query;
            const offset = (Number(page) - 1) * Number(limit);

            const activityRepository = AppDataSource.getRepository(Activity);
            
            let whereCondition: any = {};
            
            if (search) {
                whereCondition = [
                    { title: ILike(`%${search}%`) },
                    { description: ILike(`%${search}%`) }
                ];
            }
            
            if (status) {
                if (Array.isArray(whereCondition)) {
                    whereCondition = whereCondition.map(condition => ({ ...condition, status }));
                } else {
                    whereCondition.status = status;
                }
            }

            if (startDate && endDate) {
                const dateFilter = Between(new Date(startDate as string), new Date(endDate as string));
                if (Array.isArray(whereCondition)) {
                    whereCondition = whereCondition.map(condition => ({ ...condition, dueDate: dateFilter }));
                } else {
                    whereCondition.dueDate = dateFilter;
                }
            }

            const [activities, total] = await activityRepository.findAndCount({
                where: whereCondition,
                order: { dueDate: 'ASC', createdAt: 'DESC' },
                skip: offset,
                take: Number(limit),
                relations: ['customer', 'opportunity', 'assignedTo']
            });

            res.json({
                activities,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            console.error('Activity getAll error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const activityRepository = AppDataSource.getRepository(Activity);
            
            const activity = await activityRepository.findOne({
                where: { id: Number(id) },
                relations: ['customer', 'opportunity', 'assignedTo']
            });

            if (!activity) {
                return res.status(404).json({ message: 'Activity not found' });
            }

            res.json(activity);
        } catch (error) {
            console.error('Activity getById error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const activityData = req.body;
            const activityRepository = AppDataSource.getRepository(Activity);
            
            const activity = activityRepository.create(activityData);
            const savedActivity = await activityRepository.save(activity);

            res.status(201).json({
                message: 'Activity created successfully',
                activity: savedActivity
            });
        } catch (error) {
            console.error('Activity create error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { id } = req.params;
            const activityData = req.body;
            const activityRepository = AppDataSource.getRepository(Activity);
            
            const activity = await activityRepository.findOne({ where: { id: Number(id) } });
            if (!activity) {
                return res.status(404).json({ message: 'Activity not found' });
            }

            Object.assign(activity, activityData);
            const updatedActivity = await activityRepository.save(activity);

            res.json({
                message: 'Activity updated successfully',
                activity: updatedActivity
            });
        } catch (error) {
            console.error('Activity update error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const activityRepository = AppDataSource.getRepository(Activity);
            
            const activity = await activityRepository.findOne({ where: { id: Number(id) } });
            if (!activity) {
                return res.status(404).json({ message: 'Activity not found' });
            }

            await activityRepository.remove(activity);

            res.json({ message: 'Activity deleted successfully' });
        } catch (error) {
            console.error('Activity delete error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async complete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { result, actualDuration } = req.body;
            const activityRepository = AppDataSource.getRepository(Activity);
            
            const activity = await activityRepository.findOne({ where: { id: Number(id) } });
            if (!activity) {
                return res.status(404).json({ message: 'Activity not found' });
            }

            activity.complete(result, actualDuration);
            const updatedActivity = await activityRepository.save(activity);

            res.json({
                message: 'Activity completed successfully',
                activity: updatedActivity
            });
        } catch (error) {
            console.error('Activity complete error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async cancel(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const activityRepository = AppDataSource.getRepository(Activity);
            
            const activity = await activityRepository.findOne({ where: { id: Number(id) } });
            if (!activity) {
                return res.status(404).json({ message: 'Activity not found' });
            }

            activity.cancel(reason);
            const updatedActivity = await activityRepository.save(activity);

            res.json({
                message: 'Activity cancelled successfully',
                activity: updatedActivity
            });
        } catch (error) {
            console.error('Activity cancel error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getByUser(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const activityRepository = AppDataSource.getRepository(Activity);
            
            const activities = await activityRepository.find({
                where: { assignedToId: Number(userId) },
                relations: ['customer', 'opportunity'],
                order: { dueDate: 'ASC' }
            });

            res.json(activities);
        } catch (error) {
            console.error('Activity getByUser error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getDueToday(req: Request, res: Response) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const activityRepository = AppDataSource.getRepository(Activity);
            
            const activities = await activityRepository.find({
                where: {
                    dueDate: Between(today, tomorrow),
                    status: ActivityStatus.PENDING
                },
                relations: ['customer', 'opportunity', 'assignedTo'],
                order: { dueDate: 'ASC' }
            });

            res.json(activities);
        } catch (error) {
            console.error('Activity getDueToday error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getOverdue(req: Request, res: Response) {
        try {
            const now = new Date();
            const activityRepository = AppDataSource.getRepository(Activity);
            
            const activities = await activityRepository.find({
                where: {
                    dueDate: LessThan(now),
                    status: ActivityStatus.PENDING
                },
                relations: ['customer', 'opportunity', 'assignedTo'],
                order: { dueDate: 'ASC' }
            });

            res.json(activities);
        } catch (error) {
            console.error('Activity getOverdue error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}