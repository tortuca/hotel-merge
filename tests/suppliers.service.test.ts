import mongoose from 'mongoose';
import SuppliersService from '../src/modules/suppliers/suppliers.service';

beforeAll(async () => {
    const MONGO_URL = process.env.MONGO_URL || '';
    await mongoose.connect(MONGO_URL);
    mongoose.connection.on('error', (error: Error) => console.log(error));
})

afterAll(async () => {
    await mongoose.disconnect();
})

describe('Get suppliers', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseStatus: jest.Mock;
    let responseSend: jest.Mock;
    
    const suppliersService = new SuppliersService();

    it('responds with 200', async () => {
        let response = await suppliersService.downloadSuppliers(false);
        expect(response).toBeDefined();
    });
});
