import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from "body-parser";

import userRoutes from './routes/userRoute';
import applyRoutes from './routes/applyRoute';
import schoolRoutes from './routes/schoolRoute';
import { SchoolService } from './services/schoolService';
import {School} from "./models/schoolModel";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'default_secret'));

app.use('/api', userRoutes);
app.use('/api', applyRoutes);
app.use('/api', schoolRoutes);

/*sync function initializeSampleData() {
    const schoolService = new SchoolService();

    const sampleSchools: Omit<School,"id">[] = [
        { name: 'Szkoła Podstawowa nr 1', enrollmentLimit: 300 },
        { name: 'Liceum Ogólnokształcące nr 2', enrollmentLimit: 500 },
        { name: 'Technikum nr 3', enrollmentLimit: 200 },
    ];

    try {
        for (const school of sampleSchools) {
            await schoolService.addNewSchool(school.name, school.enrollmentLimit);
        }
        console.log('Sample schools initialized successfully.');
    } catch (error) {
        console.error('Error initializing sample schools:', error);
    }
}

initializeSampleData().then(() => {
    console.log('Data initialization complete.');
}).catch(err => {
    console.error('Failed to initialize data:', err);
});*/

export { app };



