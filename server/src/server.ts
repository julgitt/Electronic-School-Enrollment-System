import {app} from './app';
import dotenv from 'dotenv';
import {runSimulation} from "./utils/setup";

dotenv.config();

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

//runSimulation()
