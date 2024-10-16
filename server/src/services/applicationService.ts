import applicationRepository from '../repositories/applicationRepository';
import schoolRepository from '../repositories/schoolRepository';
import { Application } from '../models/applicationModel';
import { ValidationError } from "../errors/validationError";
import { db } from '../db';

class ApplicationService {

    async addApplication(firstName: string, lastName: string, pesel: string, schools: number[], userId: number): Promise<void> {
        // TODO: Check if application already exists?
        for (const schoolId of schools) {
            const school = await schoolRepository.getById(schoolId);
            if (!school) {
                throw new ValidationError('School ID is not recognized.', 400);
            }
        }

        await db.tx(async t => {
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

                    await applicationRepository.insert(newApplication, t);
                }
        });
    }
}

export default new ApplicationService();