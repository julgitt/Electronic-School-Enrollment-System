import { Request, Response } from 'express';
import { SchoolService } from '../services/schoolService';
import { School } from '../models/schoolModel';

export class SchoolController {
    private schoolService: SchoolService;

    constructor() {
        this.schoolService = new SchoolService();
    }

    async getAllSchools(req: Request, res: Response): Promise<void> {
        try {
            const schools: School[] = await this.schoolService.getAllSchools();
            res.status(200).json(schools);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching schools', error });
        }
    }

    async addSchool(req: Request, res: Response): Promise<void> {
        try {
            const { name, enrollmentLimit } = req.body;
            const createdSchool: School = await this.schoolService.addNewSchool(name, enrollmentLimit);
            res.status(201).json(createdSchool);
        } catch (error) {
            res.status(500).json({ message: 'Error adding school', error });
        }
    }
}
