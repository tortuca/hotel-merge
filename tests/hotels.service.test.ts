import mongoose from 'mongoose';
import HotelService from '../src/modules/hotels/hotels.service';
    
const hotelService = new HotelService();

beforeAll(async () => {
    const MONGO_URL = process.env.MONGO_URL || '';
    await mongoose.connect(MONGO_URL);
    mongoose.connection.on('error', (error: Error) => console.log(error));
})

afterEach(() => {
    jest.clearAllMocks();
})

afterAll(async () => {
    await mongoose.disconnect();
})

describe('Get hotels', () => {
    it('responds with 200', async () => {
        const hotels = hotelService.hotelRepository;
        hotels.findHotels = jest.fn().mockReturnValue([
            {
              id: 'abc2',
              destination: 5432,
              name: 'test',
            },
        ]);
        let response = await hotelService.searchHotels(-1, []);
        expect(response).toBeDefined();
    });
});
