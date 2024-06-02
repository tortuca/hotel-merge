import cache from './cache';
import HotelService from './hotels.service';
import SupplierService from '../suppliers/suppliers.service';

class HotelsController {
    public hotelService = new HotelService();
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
            if (!lastUpdatedAt) {
                // perform load and merge if not updated recently
                await this.supplierService.loadHotelsToDb();
                cache.set('update', now);
                console.log(`[cache] last load and merge = ${now}`);
            } else {
                // if ((now - lastUpdatedAt) > 5 * 60 * 1000) {
                //     console.log('test');
                // }
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