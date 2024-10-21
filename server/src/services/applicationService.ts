import { ITask } from "pg-promise";

import { ValidationError } from "../errors/validationError";

import { Application } from '../models/applicationModel';
import { ApplicationRepository } from '../repositories/applicationRepository';
import { SchoolRepository } from '../repositories/schoolRepository';

export class ApplicationService {
    private _applicationRepository: ApplicationRepository;
    private _schoolRepository: SchoolRepository;
    private readonly _tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>;

    constructor(
        applicationRepository: ApplicationRepository,
        schoolRepository: SchoolRepository,
        tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>
    ) {
        this._applicationRepository = applicationRepository;
        this._schoolRepository = schoolRepository;
        this._tx = tx;
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