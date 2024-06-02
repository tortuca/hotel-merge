import HotelsController from '../src/hotels/hotels.controller';
    
const hotelsController = new HotelsController();

afterEach(() => {
    jest.clearAllMocks();
})

describe('Get hotels', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseStatus: jest.Mock;
    let responseSend: jest.Mock;

    it('responds with 200', async () => {
        const hotels = hotelsController.hotelService;
        hotels.findHotels = jest.fn().mockReturnValue([
            {
              id: 'abc2',
              destination: 5432,
              name: 'test',
            },
        ]);
        let response = await hotelsController.searchHotels(-1, []);
        expect(response).toBeDefined();
    });
});
