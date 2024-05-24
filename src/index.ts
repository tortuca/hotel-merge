import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import router from './routes/api';
import { URLSearchParams } from 'url';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(router);

app.get('/', (req: Request, res: Response) => {
    res.send('Hotel Merge');
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`)
});

export default app;