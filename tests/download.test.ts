import { getSuppliers } from '../src/services/download';

describe('Get suppliers', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseStatus: jest.Mock;
    let responseSend: jest.Mock;
    
    it('responds with 200', async () => {
        let response = await getSuppliers(false);
        expect(response).toBeDefined();
    });
});
