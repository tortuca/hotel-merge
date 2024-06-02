import cache, { isCacheStale } from './cache';
import HotelRepository from './hotels.repository';
import SupplierService from '../suppliers/suppliers.service';
import { Hotel } from './hotels.interface';

class HotelService {
    public hotelRepository: HotelRepository;
    public supplierService: SupplierService;

    constructor() {
        this.hotelRepository = new HotelRepository();
        this.supplierService = new SupplierService();
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
            console.log(`[cache] last load and merge = ${lastUpdatedAt}`);
            if (!lastUpdatedAt || isCacheStale(now, Number(lastUpdatedAt))) {
                // perform load and merge if not updated recently
                const enableDownload = (process.env.ENABLE_DOWNLOAD || 'true') === 'true';
                await this.supplierService.importSupplierData(enableDownload);
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

    public async saveToDb(hotels: Hotel[]) {
        return this.hotelRepository.upsertHotels(hotels);
    }
}

export default HotelService;