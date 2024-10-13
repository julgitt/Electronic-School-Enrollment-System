import applicationRepository from '../repositories/applicationRepository';
import schoolRepository from '../repositories/schoolRepository';
import { Application } from '../models/applicationModel';
import { ValidationError } from "../errors/validationError";

class ApplicationService {
    async addApplication(firstName: string, lastName: string, pesel: string, schools: number[], userId: number): Promise<void> {
        for (const school_id of schools) {
            if (! await schoolRepository.getById(school_id)) {
                throw new ValidationError('School name is not recognized.', 400);
            }
        }

        const applicationPromises = schools.map(schoolId => {
            const newApplication: Application = {
                userId: userId,
                schoolId: schoolId,
                firstName: firstName,
                lastName: lastName,
                pesel: pesel,
                stage: 1,
                status: 'pending',
            };
            return applicationRepository.insert(newApplication);
        });

        await Promise.all(applicationPromises);
    }
}

export default new ApplicationService();