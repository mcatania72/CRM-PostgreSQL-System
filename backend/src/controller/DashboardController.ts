import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Customer } from '../entity/Customer';
import { Opportunity } from '../entity/Opportunity';
import { Activity } from '../entity/Activity';
import { Interaction } from '../entity/Interaction';
import { MoreThan, Between } from 'typeorm';

export class DashboardController {
    
    static async getStats(req: Request, res: Response) {
        try {
            const { startDate, endDate } = req.query;
            
            const customerRepository = AppDataSource.getRepository(Customer);
            const opportunityRepository = AppDataSource.getRepository(Opportunity);
            const activityRepository = AppDataSource.getRepository(Activity);
            const interactionRepository = AppDataSource.getRepository(Interaction);

            // Date range filter
            let dateFilter = {};
            if (startDate && endDate) {
                dateFilter = {
                    createdAt: Between(new Date(startDate as string), new Date(endDate as string))
                };
            }

            // Basic counts
            const totalCustomers = await customerRepository.count(dateFilter);
            const totalOpportunities = await opportunityRepository.count(dateFilter);
            const totalActivities = await activityRepository.count(dateFilter);
            const totalInteractions = await interactionRepository.count(
                startDate && endDate ? {
                    date: Between(new Date(startDate as string), new Date(endDate as string))
                } : {}
            );

            // Opportunity value stats
            const totalValue = await opportunityRepository
                .createQueryBuilder('opportunity')
                .select('SUM(opportunity.value)', 'total')
                .getRawOne();

            const wonValue = await opportunityRepository
                .createQueryBuilder('opportunity')
                .select('SUM(opportunity.value)', 'total')
                .where('opportunity.stage = :stage', { stage: 'closed-won' })
                .getRawOne();

            res.json({
                customers: { total: totalCustomers },
                opportunities: { 
                    total: totalOpportunities,
                    totalValue: parseFloat(totalValue?.total || 0),
                    wonValue: parseFloat(wonValue?.total || 0)
                },
                activities: { total: totalActivities },
                interactions: { total: totalInteractions }
            });
        } catch (error) {
            console.error('Dashboard getStats error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getMetrics(req: Request, res: Response) {
        try {
            const opportunityRepository = AppDataSource.getRepository(Opportunity);
            
            const totalOpps = await opportunityRepository.count();
            const wonOpps = await opportunityRepository.count({ where: { stage: 'closed-won' } });
            const conversionRate = totalOpps > 0 ? (wonOpps / totalOpps) * 100 : 0;

            res.json({
                conversionRate: parseFloat(conversionRate.toFixed(2)),
                opportunityCounts: { total: totalOpps, won: wonOpps }
            });
        } catch (error) {
            console.error('Dashboard getMetrics error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getRecentActivity(req: Request, res: Response) {
        try {
            const activityRepository = AppDataSource.getRepository(Activity);
            
            const recentActivities = await activityRepository.find({
                relations: ['customer', 'opportunity'],
                order: { createdAt: 'DESC' },
                take: 10
            });

            res.json(recentActivities);
        } catch (error) {
            console.error('Dashboard getRecentActivity error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getPipeline(req: Request, res: Response) {
        try {
            const opportunityRepository = AppDataSource.getRepository(Opportunity);
            
            const pipeline = await opportunityRepository
                .createQueryBuilder('opportunity')
                .select('opportunity.stage', 'stage')
                .addSelect('COUNT(opportunity.id)', 'count')
                .addSelect('SUM(opportunity.value)', 'totalValue')
                .groupBy('opportunity.stage')
                .getRawMany();

            res.json({ pipeline });
        } catch (error) {
            console.error('Dashboard getPipeline error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getPerformance(req: Request, res: Response) {
        try {
            res.json({ message: 'Performance metrics coming soon' });
        } catch (error) {
            console.error('Dashboard getPerformance error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getRevenueChart(req: Request, res: Response) {
        try {
            res.json({ message: 'Revenue chart coming soon' });
        } catch (error) {
            console.error('Dashboard getRevenueChart error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getPipelineChart(req: Request, res: Response) {
        try {
            res.json({ message: 'Pipeline chart coming soon' });
        } catch (error) {
            console.error('Dashboard getPipelineChart error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getActivityChart(req: Request, res: Response) {
        try {
            res.json({ message: 'Activity chart coming soon' });
        } catch (error) {
            console.error('Dashboard getActivityChart error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}