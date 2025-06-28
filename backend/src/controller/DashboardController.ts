import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Customer, CustomerStatus } from '../entity/Customer';
import { Opportunity, OpportunityStage } from '../entity/Opportunity';
import { Activity, ActivityStatus } from '../entity/Activity';
import { Interaction } from '../entity/Interaction';
import { AuthRequest } from '../middleware/auth';

export class DashboardController {
    
    static async getStats(req: AuthRequest, res: Response) {
        try {
            const customerRepository = AppDataSource.getRepository(Customer);
            const opportunityRepository = AppDataSource.getRepository(Opportunity);
            const activityRepository = AppDataSource.getRepository(Activity);
            const interactionRepository = AppDataSource.getRepository(Interaction);

            // Statistiche clienti
            const totalCustomers = await customerRepository.count();
            const activeCustomers = await customerRepository.count({ where: { status: CustomerStatus.ACTIVE } });
            const newCustomersThisMonth = await customerRepository
                .createQueryBuilder('customer')
                .where('customer.createdAt >= :startOfMonth', { 
                    startOfMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
                })
                .getCount();

            // Statistiche opportunità
            const totalOpportunities = await opportunityRepository.count();
            const openOpportunities = await opportunityRepository
                .createQueryBuilder('opportunity')
                .where('opportunity.stage NOT IN (:...closedStages)', { 
                    closedStages: [OpportunityStage.CLOSED_WON, OpportunityStage.CLOSED_LOST] 
                })
                .getCount();

            const totalValue = await opportunityRepository
                .createQueryBuilder('opportunity')
                .select('SUM(opportunity.value)', 'total')
                .getRawOne();

            const wonValue = await opportunityRepository
                .createQueryBuilder('opportunity')
                .select('SUM(opportunity.value)', 'total')
                .where('opportunity.stage = :stage', { stage: OpportunityStage.CLOSED_WON })
                .getRawOne();

            // Statistiche attività
            const totalActivities = await activityRepository.count();
            const pendingActivities = await activityRepository.count({ 
                where: { status: ActivityStatus.PENDING } 
            });

            // Interazioni recenti
            const totalInteractions = await interactionRepository.count();

            res.json({
                customers: {
                    total: totalCustomers,
                    recent: newCustomersThisMonth
                },
                opportunities: {
                    total: totalOpportunities,
                    totalValue: parseFloat(totalValue?.total) || 0,
                    wonValue: parseFloat(wonValue?.total) || 0,
                    recent: openOpportunities
                },
                activities: {
                    total: totalActivities
                },
                interactions: {
                    total: totalInteractions
                }
            });
        } catch (error) {
            console.error('Errore nel recupero statistiche dashboard:', error);
            res.status(500).json({ message: 'Errore interno del server' });
        }
    }

    static async getMetrics(req: Request, res: Response) {
        try {
            const opportunityRepository = AppDataSource.getRepository(Opportunity);

            // Calcola il tasso di conversione
            const totalOpportunities = await opportunityRepository.count();
            const wonOpportunities = await opportunityRepository.count({ 
                where: { stage: OpportunityStage.CLOSED_WON } 
            });
            const lostOpportunities = await opportunityRepository.count({ 
                where: { stage: OpportunityStage.CLOSED_LOST } 
            });

            const conversionRate = totalOpportunities > 0 
                ? (wonOpportunities / totalOpportunities) * 100 
                : 0;

            res.json({
                conversionRate,
                opportunityCounts: {
                    total: totalOpportunities,
                    won: wonOpportunities,
                    lost: lostOpportunities,
                    active: totalOpportunities - wonOpportunities - lostOpportunities
                }
            });
        } catch (error) {
            console.error('Errore nel recupero metriche:', error);
            res.status(500).json({ message: 'Errore interno del server' });
        }
    }

    static async getRecentActivity(req: Request, res: Response) {
        try {
            const activityRepository = AppDataSource.getRepository(Activity);
            
            const recentActivities = await activityRepository
                .createQueryBuilder('activity')
                .leftJoinAndSelect('activity.customer', 'customer')
                .leftJoinAndSelect('activity.assignedTo', 'user')
                .orderBy('activity.createdAt', 'DESC')
                .limit(10)
                .getMany();

            res.json(recentActivities);
        } catch (error) {
            console.error('Errore nel recupero attività recenti:', error);
            res.status(500).json({ message: 'Errore interno del server' });
        }
    }

    static async getPipeline(req: Request, res: Response) {
        try {
            const opportunityRepository = AppDataSource.getRepository(Opportunity);
            
            const pipelineData = await opportunityRepository
                .createQueryBuilder('opportunity')
                .select('opportunity.stage', 'stage')
                .addSelect('COUNT(*)', 'count')
                .addSelect('SUM(opportunity.value)', 'totalValue')
                .addSelect('AVG(opportunity.probability)', 'avgProbability')
                .groupBy('opportunity.stage')
                .getRawMany();

            // Transform data to ensure proper number types
            const formattedData = pipelineData.map(item => ({
                stage: item.stage,
                count: parseInt(item.count),
                totalValue: parseFloat(item.totalValue) || 0,
                avgProbability: parseFloat(item.avgProbability) || 0
            }));

            res.json(formattedData);
        } catch (error) {
            console.error('Errore nel recupero pipeline:', error);
            res.status(500).json({ message: 'Errore interno del server' });
        }
    }
}