import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Customer, CustomerStatus } from '../entity/Customer';
import { validationResult } from 'express-validator';
import { Like, ILike } from 'typeorm';

export class CustomerController {
    
    static async getAll(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { page = 1, limit = 20, search, status } = req.query;
            const offset = (Number(page) - 1) * Number(limit);

            const customerRepository = AppDataSource.getRepository(Customer);
            
            let whereCondition: any = {};
            
            if (search) {
                whereCondition = [
                    { name: ILike(`%${search}%`) },
                    { company: ILike(`%${search}%`) },
                    { email: ILike(`%${search}%`) }
                ];
            }
            
            if (status) {
                if (Array.isArray(whereCondition)) {
                    whereCondition = whereCondition.map(condition => ({ ...condition, status }));
                } else {
                    whereCondition.status = status;
                }
            }

            const [customers, total] = await customerRepository.findAndCount({
                where: whereCondition,
                order: { createdAt: 'DESC' },
                skip: offset,
                take: Number(limit),
                relations: ['opportunities', 'interactions']
            });

            res.json({
                customers,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            console.error('Customer getAll error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const customerRepository = AppDataSource.getRepository(Customer);
            
            const customer = await customerRepository.findOne({
                where: { id: Number(id) },
                relations: ['opportunities', 'interactions', 'activities']
            });

            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }

            res.json(customer);
        } catch (error) {
            console.error('Customer getById error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const customerData = req.body;
            const customerRepository = AppDataSource.getRepository(Customer);
            
            const customer = customerRepository.create(customerData);
            const savedCustomer = await customerRepository.save(customer);

            res.status(201).json({
                message: 'Customer created successfully',
                customer: savedCustomer
            });
        } catch (error) {
            console.error('Customer create error:', error);
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
            const customerData = req.body;
            const customerRepository = AppDataSource.getRepository(Customer);
            
            const customer = await customerRepository.findOne({ where: { id: Number(id) } });
            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }

            Object.assign(customer, customerData);
            const updatedCustomer = await customerRepository.save(customer);

            res.json({
                message: 'Customer updated successfully',
                customer: updatedCustomer
            });
        } catch (error) {
            console.error('Customer update error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const customerRepository = AppDataSource.getRepository(Customer);
            
            const customer = await customerRepository.findOne({ where: { id: Number(id) } });
            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }

            await customerRepository.remove(customer);

            res.json({ message: 'Customer deleted successfully' });
        } catch (error) {
            console.error('Customer delete error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getOpportunities(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const customerRepository = AppDataSource.getRepository(Customer);
            
            const customer = await customerRepository.findOne({
                where: { id: Number(id) },
                relations: ['opportunities']
            });

            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }

            res.json(customer.opportunities);
        } catch (error) {
            console.error('Customer getOpportunities error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getActivities(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const customerRepository = AppDataSource.getRepository(Customer);
            
            const customer = await customerRepository.findOne({
                where: { id: Number(id) },
                relations: ['activities']
            });

            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }

            res.json(customer.activities);
        } catch (error) {
            console.error('Customer getActivities error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getInteractions(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const customerRepository = AppDataSource.getRepository(Customer);
            
            const customer = await customerRepository.findOne({
                where: { id: Number(id) },
                relations: ['interactions']
            });

            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }

            res.json(customer.interactions);
        } catch (error) {
            console.error('Customer getInteractions error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getSummary(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const customerRepository = AppDataSource.getRepository(Customer);
            
            const customer = await customerRepository.findOne({
                where: { id: Number(id) },
                relations: ['opportunities', 'interactions', 'activities']
            });

            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }

            const summary = {
                customer,
                stats: {
                    totalOpportunities: customer.opportunities?.length || 0,
                    activeOpportunities: customer.opportunities?.filter(opp => 
                        opp.stage !== 'closed-won' && opp.stage !== 'closed-lost'
                    ).length || 0,
                    totalValue: customer.opportunities?.reduce((sum, opp) => sum + (opp.value || 0), 0) || 0,
                    wonValue: customer.opportunities?.filter(opp => opp.stage === 'closed-won')
                        .reduce((sum, opp) => sum + (opp.value || 0), 0) || 0,
                    totalInteractions: customer.interactions?.length || 0,
                    recentInteractions: customer.interactions?.filter(int => {
                        const daysDiff = (new Date().getTime() - new Date(int.date).getTime()) / (1000 * 60 * 60 * 24);
                        return daysDiff <= 30;
                    }).length || 0,
                    totalActivities: customer.activities?.length || 0,
                    pendingActivities: customer.activities?.filter(act => act.status === 'pending').length || 0
                }
            };

            res.json(summary);
        } catch (error) {
            console.error('Customer getSummary error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}