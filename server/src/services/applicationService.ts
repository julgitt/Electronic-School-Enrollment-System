import { ApplicationRepository } from '../repositories/applicationRepository';
import { SchoolRepository } from '../repositories/schoolRepository';
import { Application } from '../models/applicationModel';

export class ApplicationService {
    private appRepo: ApplicationRepository;
    private schoolRepo: SchoolRepository;

    constructor(appRepo: ApplicationRepository, schoolRepo: SchoolRepository) {
        this.appRepo = appRepo;
        this.schoolRepo = schoolRepo;
    }

    async addApplication(firstName: string, lastName: string, pesel: string, schools: number[], userId: number): Promise<Application[]> {
        for (const school_id of schools) {
            if (! await this.schoolRepo.getSchoolById(school_id)) {
                throw new Error('School name is not recognized.');
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
            return this.appRepo.insertApplication(newApplication);
        });

        return Promise.all(applicationPromises);
    }
}
