import cache, { isCacheStale } from './cache';
import HotelRepository from './hotels.repository';
import SupplierService from '../suppliers/suppliers.service';

class HotelsController {
    public hotelService = new HotelRepository();
    public supplierService = new SupplierService();

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
                let test = this.hotelService.findHotelsByDestination(destination);
                result = hotels.length === 0 
                    ? await this.hotelService.findHotelsByDestination(destination) 
                    : await this.hotelService.findHotelsByDestinationAndHotelIds(destination, hotels);
            } else {
                result = hotels.length !== 0 
                    ? await this.hotelService.findHotelsByHotelIds(hotels) 
                    : await this.hotelService.findHotels();
            }

            cache.set(`${destination}:${hotels}`, result);
            console.log(`[cache] saved ${destination}:${hotels}`);
            return result;
        } catch (error) {
            console.error('[error] unable to load cache:', error);
            throw error;
        }
    }
}

export default HotelsController;