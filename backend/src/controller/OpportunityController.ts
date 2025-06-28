import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Opportunity, OpportunityStage } from '../entity/Opportunity';
import { validationResult } from 'express-validator';
import { ILike } from 'typeorm';

export class OpportunityController {
    
    static async getAll(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { page = 1, limit = 20, search, stage } = req.query;
            const offset = (Number(page) - 1) * Number(limit);

            const opportunityRepository = AppDataSource.getRepository(Opportunity);
            
            let whereCondition: any = {};
            
            if (search) {
                whereCondition = [
                    { title: ILike(`%${search}%`) },
                    { description: ILike(`%${search}%`) }
                ];
            }
            
            if (stage) {
                if (Array.isArray(whereCondition)) {
                    whereCondition = whereCondition.map(condition => ({ ...condition, stage }));
                } else {
                    whereCondition.stage = stage;
                }
            }

            const [opportunities, total] = await opportunityRepository.findAndCount({
                where: whereCondition,
                order: { createdAt: 'DESC' },
                skip: offset,
                take: Number(limit),
                relations: ['customer', 'activities']
            });

            res.json({
                opportunities,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            console.error('Opportunity getAll error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const opportunityRepository = AppDataSource.getRepository(Opportunity);
            
            const opportunity = await opportunityRepository.findOne({
                where: { id: Number(id) },
                relations: ['customer', 'activities']
            });

            if (!opportunity) {
                return res.status(404).json({ message: 'Opportunity not found' });
            }

            res.json(opportunity);
        } catch (error) {
            console.error('Opportunity getById error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const opportunityData = req.body;
            const opportunityRepository = AppDataSource.getRepository(Opportunity);
            
            const opportunity = opportunityRepository.create(opportunityData);
            const savedOpportunity = await opportunityRepository.save(opportunity);

            res.status(201).json({
                message: 'Opportunity created successfully',
                opportunity: savedOpportunity
            });
        } catch (error) {
            console.error('Opportunity create error:', error);
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
            const opportunityData = req.body;
            const opportunityRepository = AppDataSource.getRepository(Opportunity);
            
            const opportunity = await opportunityRepository.findOne({ where: { id: Number(id) } });
            if (!opportunity) {
                return res.status(404).json({ message: 'Opportunity not found' });
            }

            Object.assign(opportunity, opportunityData);
            const updatedOpportunity = await opportunityRepository.save(opportunity);

            res.json({
                message: 'Opportunity updated successfully',
                opportunity: updatedOpportunity
            });
        } catch (error) {
            console.error('Opportunity update error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const opportunityRepository = AppDataSource.getRepository(Opportunity);
            
            const opportunity = await opportunityRepository.findOne({ where: { id: Number(id) } });
            if (!opportunity) {
                return res.status(404).json({ message: 'Opportunity not found' });
            }

            await opportunityRepository.remove(opportunity);

            res.json({ message: 'Opportunity deleted successfully' });
        } catch (error) {
            console.error('Opportunity delete error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async close(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { won, reason } = req.body;
            const opportunityRepository = AppDataSource.getRepository(Opportunity);
            
            const opportunity = await opportunityRepository.findOne({ where: { id: Number(id) } });
            if (!opportunity) {
                return res.status(404).json({ message: 'Opportunity not found' });
            }

            opportunity.close(won, reason);
            const updatedOpportunity = await opportunityRepository.save(opportunity);

            res.json({
                message: `Opportunity ${won ? 'won' : 'lost'} successfully`,
                opportunity: updatedOpportunity
            });
        } catch (error) {
            console.error('Opportunity close error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getByStage(req: Request, res: Response) {
        try {
            const { stage } = req.params;
            const opportunityRepository = AppDataSource.getRepository(Opportunity);
            
            const opportunities = await opportunityRepository.find({
                where: { stage: stage as OpportunityStage },
                relations: ['customer'],
                order: { expectedCloseDate: 'ASC' }
            });

            res.json(opportunities);
        } catch (error) {
            console.error('Opportunity getByStage error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getPipelineStats(req: Request, res: Response) {
        try {
            const opportunityRepository = AppDataSource.getRepository(Opportunity);
            
            const stats = await opportunityRepository
                .createQueryBuilder('opportunity')
                .select('opportunity.stage', 'stage')
                .addSelect('COUNT(opportunity.id)', 'count')
                .addSelect('SUM(opportunity.value)', 'totalValue')
                .addSelect('AVG(opportunity.probability)', 'avgProbability')
                .groupBy('opportunity.stage')
                .getRawMany();

            const pipeline = Object.values(OpportunityStage).map(stage => {
                const stageStats = stats.find(s => s.stage === stage);
                return {
                    stage,
                    count: stageStats ? parseInt(stageStats.count) : 0,
                    totalValue: stageStats ? parseFloat(stageStats.totalValue || 0) : 0,
                    avgProbability: stageStats ? parseFloat(stageStats.avgProbability || 0) : 0
                };
            });

            res.json({ pipeline });
        } catch (error) {
            console.error('Opportunity getPipelineStats error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getActivities(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const opportunityRepository = AppDataSource.getRepository(Opportunity);
            
            const opportunity = await opportunityRepository.findOne({
                where: { id: Number(id) },
                relations: ['activities']
            });

            if (!opportunity) {
                return res.status(404).json({ message: 'Opportunity not found' });
            }

            res.json(opportunity.activities);
        } catch (error) {
            console.error('Opportunity getActivities error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}