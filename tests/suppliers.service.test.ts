import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SupplierService from '../src/modules/suppliers/suppliers.service';

dotenv.config();

beforeAll(async () => {
    const MONGO_URL = process.env.MONGO_URL || '';
    await mongoose.connect(MONGO_URL);
    mongoose.connection.on('error', (error: Error) => console.log(error));
})

afterAll(async () => {
    await mongoose.disconnect();
})

describe('Get suppliers', () => {
    const supplierService = new SupplierService();
    const enableDownload = (process.env.ENABLE_DOWNLOAD || 'true') === 'true';

    it('responds with 200', async () => {
        let response = await supplierService.importSupplierData(enableDownload);
        expect(response).toBeDefined();
    });
});
