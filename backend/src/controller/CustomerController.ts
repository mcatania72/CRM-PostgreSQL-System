import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Customer, CustomerStatus } from '../entity/Customer';
import { Opportunity } from '../entity/Opportunity';
import { Interaction } from '../entity/Interaction';
import { validationResult } from 'express-validator';
import { Like } from 'typeorm';

export class CustomerController {
    
    static async getAll(req: Request, res: Response) {
        try {
            const { search, industry, status, page = 1, limit = 10 } = req.query;
            
            const customerRepository = AppDataSource.getRepository(Customer);
            const queryBuilder = customerRepository.createQueryBuilder('customer');

            // Filtri di ricerca (PostgreSQL optimized)
            if (search) {
                queryBuilder.where(
                    'customer.name ILIKE :search OR customer.company ILIKE :search OR customer.email ILIKE :search',
                    { search: `%${search}%` }
                );
            }

            if (industry) {
                queryBuilder.andWhere('customer.industry = :industry', { industry });
            }

            if (status) {
                queryBuilder.andWhere('customer.status = :status', { status });
            }

            // Paginazione
            const skip = (Number(page) - 1) * Number(limit);
            queryBuilder.skip(skip).take(Number(limit));

            // Ordinamento
            queryBuilder.orderBy('customer.createdAt', 'DESC');

            const [customers, total] = await queryBuilder.getManyAndCount();

            res.json({
                customers,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            console.error('Errore nel recupero clienti:', error);
            res.status(500).json({ message: 'Errore interno del server' });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const customerRepository = AppDataSource.getRepository(Customer);
            
            const customer = await customerRepository.findOne({
                where: { id: Number(id) },
                relations: ['opportunities', 'interactions']
            });

            if (!customer) {
                return res.status(404).json({ message: 'Cliente non trovato' });
            }

            res.json(customer);
        } catch (error) {
            console.error('Errore nel recupero cliente:', error);
            res.status(500).json({ message: 'Errore interno del server' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const customerRepository = AppDataSource.getRepository(Customer);
            const customer = customerRepository.create(req.body);
            
            await customerRepository.save(customer);
            
            res.status(201).json({
                message: 'Cliente creato con successo',
                customer
            });
        } catch (error) {
            console.error('Errore nella creazione cliente:', error);
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
            const customerRepository = AppDataSource.getRepository(Customer);
            
            let customer = await customerRepository.findOne({ where: { id: Number(id) } });
            if (!customer) {
                return res.status(404).json({ message: 'Cliente non trovato' });
            }

            customerRepository.merge(customer, req.body);
            await customerRepository.save(customer);

            res.json({
                message: 'Cliente aggiornato con successo',
                customer
            });
        } catch (error) {
            console.error('Errore nell\'aggiornamento cliente:', error);
            res.status(500).json({ message: 'Errore interno del server' });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const customerRepository = AppDataSource.getRepository(Customer);
            const opportunityRepository = AppDataSource.getRepository(Opportunity);
            const interactionRepository = AppDataSource.getRepository(Interaction);
            
            // Trova il customer
            const customer = await customerRepository.findOne({ where: { id: Number(id) } });
            if (!customer) {
                return res.status(404).json({ message: 'Cliente non trovato' });
            }

            // Controlla dipendenze - opportunità
            const opportunitiesCount = await opportunityRepository.count({ 
                where: { customer: { id: Number(id) } }
            });

            // Controlla dipendenze - interazioni
            const interactionsCount = await interactionRepository.count({ 
                where: { customer: { id: Number(id) } }
            });

            // Se ci sono dipendenze, restituisci errore informativo
            if (opportunitiesCount > 0 || interactionsCount > 0) {
                const dependencies = [];
                if (opportunitiesCount > 0) {
                    dependencies.push(`${opportunitiesCount} opportunità`);
                }
                if (interactionsCount > 0) {
                    dependencies.push(`${interactionsCount} interazioni`);
                }

                return res.status(409).json({
                    message: 'Impossibile eliminare il cliente',
                    reason: 'Il cliente ha dati collegati che devono essere eliminati prima',
                    dependencies: dependencies.join(' e '),
                    details: {
                        customerName: customer.name,
                        opportunitiesCount,
                        interactionsCount
                    },
                    suggestion: 'Elimina prima tutte le opportunità e interazioni associate a questo cliente, oppure trasferiscile ad un altro cliente.'
                });
            }

            // Se non ci sono dipendenze, procedi con l'eliminazione
            await customerRepository.remove(customer);
            
            console.log(`Cliente eliminato con successo: ${customer.name} (ID: ${id})`);
            
            res.json({ 
                message: 'Cliente eliminato con successo',
                deletedCustomer: {
                    id: customer.id,
                    name: customer.name
                }
            });
        } catch (error) {
            console.error('Errore nell\'eliminazione cliente:', error);
            
            res.status(500).json({ 
                message: 'Errore interno del server',
                details: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }

    static async getStats(req: Request, res: Response) {
        try {
            const customerRepository = AppDataSource.getRepository(Customer);
            
            const totalCustomers = await customerRepository.count();
            const activeCustomers = await customerRepository.count({ where: { status: CustomerStatus.ACTIVE } });
            const prospectCustomers = await customerRepository.count({ where: { status: CustomerStatus.PROSPECT } });
            const inactiveCustomers = await customerRepository.count({ where: { status: CustomerStatus.INACTIVE } });

            res.json({
                totalCustomers,
                activeCustomers,
                prospectCustomers,
                inactiveCustomers
            });
        } catch (error) {
            console.error('Errore nel recupero statistiche clienti:', error);
            res.status(500).json({ message: 'Errore interno del server' });
        }
    }
}