import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from "body-parser";

import userRoutes from './routes/userRoute';
import applicationRoutes from './routes/applicationRoute';
import schoolRoutes from './routes/schoolRoute';
import errorHandler from './middlewares/errorHandler';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'default_secret'));

app.use('/api', userRoutes);
app.use('/api', applicationRoutes);
app.use('/api', schoolRoutes);

app.use(errorHandler);

export { app };



