import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import router from './routes/api';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(router);
app.set('query parser', 'simple');

app.get('/', (req: Request, res: Response) => {
    res.send('Room Merge 2');
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`)
});

export default app;