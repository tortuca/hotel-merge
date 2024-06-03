import cache, { isCacheStale } from '../utils/cache';
import HotelRepository from './hotels.repository';
import { IHotel } from './hotels.interface';
import { triggerDownload } from '../utils/cron';

class HotelService {
    public hotelRepository: HotelRepository;

    constructor() {
        this.hotelRepository = new HotelRepository();
    }

    public searchHotels = async ( destination: number, hotels: string[] ) => {
        try {
            const cachedData = cache.get(`${destination}:${hotels}`);
            if (cachedData) {
                console.log(`[cache] found ${destination}:${hotels}`);
                return cachedData;
            }
        
            const now : number = Date.now();

            let lastUpdatedAt = cache.get('update');
            if (!lastUpdatedAt || isCacheStale(now, Number(lastUpdatedAt))) {
                console.log(`[cache] last load and merge = ${lastUpdatedAt}`);
                // perform load and merge if not updated recently
                await triggerDownload();
            }
            
            let result;
            if (destination !== -1) {
                let test = this.hotelRepository.findHotelsByDestination(destination);
                result = hotels.length === 0 
                    ? await this.hotelRepository.findHotelsByDestination(destination) 
                    : await this.hotelRepository.findHotelsByDestinationAndHotelIds(destination, hotels);
            } else {
                result = hotels.length !== 0 
                    ? await this.hotelRepository.findHotelsByHotelIds(hotels) 
                    : await this.hotelRepository.findHotels();
            }

            cache.set(`${destination}:${hotels}`, result);
            console.log(`[cache] saved ${destination}:${hotels}`);
            return result;
        } catch (error) {
            console.error('[error] unable to load cache:', error);
            throw error;
        }
    }

    public async saveToDb(hotels: IHotel[]) {
        return this.hotelRepository.upsertHotels(hotels);
    }
}

export default HotelService;