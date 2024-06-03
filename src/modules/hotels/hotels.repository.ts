import { IHotel } from './hotels.interface';
import { HotelModel } from './hotels.model';

const hideFields = { '_id': 0, '__v': 0 };

class HotelRepository {
    public hotels = HotelModel;

    public async findHotels(): Promise<IHotel[]> {
         return await this.hotels.find({}, hideFields);
    }; 

    public async findHotelsByDestination(dest: number): Promise<IHotel[]> {
        return await this.hotels.find({destination: dest}, hideFields);
    }

    public async getHotelByHotelId(hotel_id: string): Promise<IHotel | null> {
        return (await this.hotels.findOne({id : hotel_id}, hideFields)) || null;
    }

    public async findHotelsByHotelIds(hotel_ids: string[]): Promise<IHotel[]> {
        return await this.hotels.find({
            id : { 
                $in: hotel_ids
            }
        }, hideFields);
    }

    public async findHotelsByDestinationAndHotelIds(dest: number, hotel_ids: string[]): Promise<IHotel[]> {
        return await this.hotels.find({
            destination: dest, 
            id : { 
                $in: hotel_ids
            } 
        }, hideFields);
    }

    public async saveHotels(hotels: IHotel[]): Promise<IHotel[]> {
        return await this.hotels.insertMany(hotels);
    }

    public async upsertHotels(hotels: IHotel[]): Promise<IHotel[]> {
        try {
            const response = await this.hotels.bulkWrite(hotels.map(h => ({
                updateOne: {
                    filter: { id: h.id },
                    update: { $set: h },
                    upsert: true,
                }
            })));
            return hotels;
        } catch (error) {
            console.error('[error] unable to save data:', error);
            throw error;
        }
    }

    public async initHotelDb(): Promise<any> {
        try {
            let collection = await this.hotels.createCollection();
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