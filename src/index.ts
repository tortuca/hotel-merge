import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import router from './routes/api';

import { initializeDatabase } from './modules/utils/db';
import { job, triggerDownload } from './modules/utils/cron';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(router);

app.get('/', (req: Request, res: Response) => {
    res.send('Hotel Merge');
});

const initializeApp = async () => {
    // DB
    await initializeDatabase();
    await triggerDownload();
    job.start();
}
initializeApp();

app.listen(port, async () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;