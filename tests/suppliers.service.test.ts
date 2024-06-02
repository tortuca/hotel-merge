import SuppliersService from '../src/suppliers/suppliers.service';

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
