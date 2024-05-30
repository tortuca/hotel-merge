import { Hotel, ImageUrl } from '../models/hotel.model';
import cache from '../db/cache';
import { loadHotels } from '../services/merge';

export const searchHotels = async (download: boolean, destination: number, hotels: string[]) => {
    try {
        const cachedData = cache.get(`${destination}:${hotels}`);
        if (cachedData) {
            console.log(`[cache] found ${destination}:${hotels}`);
            return cachedData;
        }
    
        let data : Hotel[] | undefined = cache.get('all');
        if (!data) {
            // save initial download to cache - expires in x minutes
            data = await loadHotels();
            cache.set('all', data);
            console.log(`[cache] saved all data`);
        }

        const result = data.filter(item => filterDestination(item, destination))
            .filter(item => filterHotels(item, hotels));
        cache.set(`${destination}:${hotels}`, result);
        console.log(`[cache] saved ${destination}:${hotels}`);
        return result;
    } catch (error) {
        console.error('[error] unable to load cache:', error);
        throw error;
    }
}

export const filterDestination = (item: any, destination: number) => {
    return destination === -1 || item.destination === destination;
}

export const filterHotels = (item: any, hotels: string[]) => {
    return hotels.length === 0 || hotels.includes(item.id);
}