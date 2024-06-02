import mongoose from 'mongoose';
import HotelService from '../src/modules/hotels/hotels.service';
    
const hotelsController = new HotelService();

beforeAll(async () => {
    const MONGO_URL = process.env.MONGO_URL || '';
    await mongoose.connect(MONGO_URL);
    mongoose.connection.on('error', (error: Error) => console.log(error));
})

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
