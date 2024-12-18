import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from "body-parser";

import userRoutes from './routes/userRoute';
import candidateRoutes from './routes/candidateRoute';
import applicationRoutes from './routes/applicationRoute';
import schoolRoutes from './routes/schoolRoute';
import gradeRoutes from './routes/gradeRoute';
import subjectRoutes from './routes/subjectRoute';
import enrollmentRoutes from './routes/deadlineRoute';
import adminRoutes from './routes/adminRoute';
import errorHandler from './middlewares/errorHandler';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser(process.env.COOKIE_SECRET || 'default_secret'));

app.use('/api', userRoutes);
app.use('/api', candidateRoutes);
app.use('/api', applicationRoutes);
app.use('/api', schoolRoutes);
app.use('/api', gradeRoutes);
app.use('/api', subjectRoutes);
app.use('/api', enrollmentRoutes);
app.use('/api', adminRoutes);

app.use(errorHandler);

export {app};



