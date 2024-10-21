import defaultApplicationRepository, { ApplicationRepository } from '../repositories/applicationRepository';
import defaultSchoolRepository, { SchoolRepository } from '../repositories/schoolRepository';
import { Application } from '../models/applicationModel';
import { ValidationError } from "../errors/validationError";
import { tx } from '../db';
import { ITask } from "pg-promise";

export class ApplicationService {
    private _applicationRepository: ApplicationRepository;
    private _schoolRepository: SchoolRepository;
    private _tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>;

    public set tx(tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>) {
        this._tx = tx;
    }

    public set applicationRepository(applicationRepository: ApplicationRepository) {
        this._applicationRepository = applicationRepository;
    }
    public set schoolRepository(schoolRepository: SchoolRepository) {
        this._schoolRepository = schoolRepository;
    }

    constructor() {
        this._applicationRepository = defaultApplicationRepository;
        this._schoolRepository = defaultSchoolRepository;
        this._tx = tx
    }

    async addApplication(firstName: string, lastName: string, pesel: string, schools: number[], userId: number): Promise<void> {
        // TODO: Check if application already exists?
        for (const schoolId of schools) {
            const school = await this._schoolRepository.getById(schoolId);
            if (!school) {
                throw new ValidationError('School ID is not recognized.', 400);
            }
        }

        await this._tx(async t => {
            for (const schoolId of schools) {
                const newApplication: Application = {
                    userId: userId,
                    schoolId: schoolId,
                    firstName: firstName,
                    lastName: lastName,
                    pesel: pesel,
                    stage: 1,
                    status: 'pending',
                };

                await this._applicationRepository.insert(newApplication, t);
            }
        });
    }
}

export default new ApplicationService()