import { Hotel } from './hotels.interface';
import { HotelModel } from './hotels.model';

const hideFields = { '_id': 0, '__v': 0 };

class HotelRepository {
    public hotels = HotelModel;

    public async findHotels(): Promise<Hotel[]> {
         return HotelModel.find({}, hideFields);
    }; 

    public async findHotelsByDestination(dest: number): Promise<Hotel[]> {
        return await HotelModel.find({destination: dest}, hideFields);
    }

    public async getHotelByHotelId(hotel_id: string): Promise<Hotel | null> {
        return (await HotelModel.findOne({id : hotel_id}, hideFields)) || null;
    }

    public async findHotelsByHotelIds(hotel_ids: string[]): Promise<Hotel[]> {
        return await HotelModel.find({
            id : { 
                $in: hotel_ids
            }
        }, hideFields);
    }

    public async findHotelsByDestinationAndHotelIds(dest: number, hotel_ids: string[]): Promise<Hotel[]> {
        return await HotelModel.find({
            destination: dest, 
            id : { 
                $in: hotel_ids
            } 
        }, hideFields);
    }

    public async saveHotels(hotels: Hotel[]): Promise<Hotel[]> {
        return await HotelModel.insertMany(hotels);
    }

    public async upsertHotels(hotels: Hotel[]): Promise<any> {
        const response = await HotelModel.bulkWrite(hotels.map(h => ({
            updateOne: {
                filter: { id: h.id },
                update: { $set: h },
                upsert: true,
            }
        })));
    }

    public async initHotelDb(): Promise<any> {
        try {
            let collection = await HotelModel.createCollection();
            console.log('[db]: hotel collection created');
            collection.createIndex( { destination : -1 } );
            collection.createIndex( { id : -1 } );
        } catch (error) {
            console.error('[error] unable to create collection:', error);
            throw error;
        }
    }
}

export default HotelRepository;