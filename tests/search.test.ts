import { searchHotels } from '../src/services/search';

describe('Get hotels', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseStatus: jest.Mock;
    let responseSend: jest.Mock;
    
    it('responds with 200', async () => {
        let response = await searchHotels(false, 0, ['']);
        expect(response).toBeDefined();
    });
});
