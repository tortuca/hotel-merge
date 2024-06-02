import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import router from './routes/api';

import HotelRepository from './modules/hotels/hotels.repository';
import SupplierService from './modules/suppliers/suppliers.service';
import { SupplierModel, initSupplierDb } from './modules/suppliers/suppliers.model';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;
const enableDownload = (process.env.ENABLE_DOWNLOAD || 'true') === 'true';

app.use(router);

app.get('/', (req: Request, res: Response) => {
    res.send('Hotel Merge');
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

//DB
const MONGO_URL = process.env.MONGO_URL || '';
importData();

async function connectDb() {
    await mongoose.connect(MONGO_URL);
    mongoose.connection.on('error', (error: Error) => console.log(error));
    console.log('[db]: connected to MongoDB');
}

async function importData() {
    await connectDb();
    const hotelRepository: HotelRepository = new HotelRepository();
    await hotelRepository.initHotelDb();
    await initSupplierDb();

    const supplierService: SupplierService = new SupplierService();
    await supplierService.importSupplierData(enableDownload);
}

export default app;