import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';

// const mongoose = require('mongoose');
// const route = require('./routes/routes');
// const auth = require('./routes/user');
// const admin = require('./routes/admin');

const app= express();
const port = 3000;

/*mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1/WEPPO', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;

db.on('error', error => {
    console.log(error);
})
db.once('open', () => {
    console.log('Connected to Mongoose');
})

// to reset database:
//db.dropCollection();
*/

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('sgs90890s8g90as8rg90as8g9r8a0srg8'));

/*
app.use('/', route);
app.use('/cart', cart);
app.use('/', auth);
app.use('/', admin);
*/

app.get('/', (_req: Request, res: Response) => {
    res.send('Hello World!');
});

app.get('/api/data', (_req: Request, res: Response) => {
    res.json({ username: 'Hello from Express!' });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
