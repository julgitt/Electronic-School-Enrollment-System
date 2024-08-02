import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from "body-parser";
import auth from './routes/userRoute';
import dotenv from 'dotenv';

dotenv.config();

const app= express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'default_secret'));

app.use('/api', auth);

app.get('/api/user', (req: Request, res: Response) => {
    if (req.signedCookies.user) {
        res.json({ username: req.signedCookies.user });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
