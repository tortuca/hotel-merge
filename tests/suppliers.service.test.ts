import mongoose from 'mongoose';
import SupplierService from '../src/modules/suppliers/suppliers.service';

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

    it('responds with 200', async () => {
        let response = await supplierService.downloadSuppliers(false);
        expect(response).toBeDefined();
    });
});
