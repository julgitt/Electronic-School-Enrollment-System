import { Request, Response } from 'express';
import { SchoolService } from '../services/schoolService';
import { School } from '../models/schoolModel';

export class SchoolController {
    private schoolService: SchoolService;

    constructor() {
        this.schoolService = new SchoolService();
    }

    async getAllSchools(_req: Request, res: Response) {
        try {
            const schools: School[] = await this.schoolService.getAllSchools();
            return res.status(200).json(schools);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching schools', error });
        }
    }

    async addSchool(req: Request, res: Response) {
        try {
            const { name, enrollmentLimit } = req.body;
            const createdSchool: School = await this.schoolService.addNewSchool(name, enrollmentLimit);
            return res.status(201).json(createdSchool);
        } catch (error) {
            return res.status(500).json({ message: 'Error adding school', error });
        }
    }
}
