import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import cache from '../utils/cache';

import HotelRepository from '../hotels/hotels.repository';
import SupplierRepository from '../suppliers/suppliers.repository';
import { IHotel } from '../hotels/hotels.interface';
import { transformPaperflies, transformAcme, transformPatagonia } from '../utils/transform';
import { findLongestName, removeDuplicateTags, removeDuplicateLinks, removeStringsIfPresent, mergeDedupe } from '../utils/stringOperators';

dotenv.config();

const suppliers: string[] = (process.env.SUPPLIERS || '').split(',');

class SupplierService {
    public hotelRepository: HotelRepository;
    public supplierRepository: SupplierRepository;

    constructor() {
        this.hotelRepository = new HotelRepository();
        this.supplierRepository = new SupplierRepository();
    }

    public async importSupplierData(enableDownload: boolean): Promise<any> {
        try {
            const data = await this.downloadSuppliers(enableDownload);
            const hotels = await this.loadHotelsToDb();

            const now = Date.now();
            cache.set('update', now);
            console.log(`[cache] newest load and merge = ${(new Date(now)).toISOString()}`);
            return hotels; 
        } catch (error) {
            console.error('[error] unable to import suppliers:', error);
            throw error;
        }
    }

    public async downloadSuppliers(download: boolean): Promise<any> {
        if (!download) return {};
        try {
            // parallel fetching for all suppliers to speed up performance
            const responses = await Promise.all(suppliers.map(async (el) => {
                const response = await fetch(el);
                console.log('[fetch]', response.status, el);
                if (!response.ok) {
                    console.log(el, `[error] HTTP: ${response.status}`);
                    return { data: null, error: `HTTP: ${response.status}` };
                } else {
                    const data = await response.json();
                    await this.saveToDb(el.split('/').pop()!, data);
                    return { data, error: null };
                }
            }));
            return responses;
        } catch (error) {
            console.error('[error] unable to fetch suppliers:', error);
            throw error;
        }
    }
    
    public async loadHotelsToDb(): Promise<IHotel[]> {
        try {
            // Parse JSON after reading all files
            const paperfliesData = await this.supplierRepository.getDataBySupplier('paperflies');
            const acmeData = await this.supplierRepository.getDataBySupplier('acme');
            const patagoniaData = await this.supplierRepository.getDataBySupplier('patagonia');
    
            const paperfliesJson = JSON.parse(paperfliesData?.data!);
            const acmeJson = JSON.parse(acmeData?.data!);
            const patagoniaJson = JSON.parse(patagoniaData?.data!);
    
            const hotels = await this.mergeSuppliers(paperfliesJson, acmeJson, patagoniaJson);
            const saved = await this.hotelRepository.upsertHotels(hotels);
            return saved;
        } catch (error) {
            console.error('[error] unable to load files:', error);
            throw error;
        }
    }
    
    public async mergeSuppliers(paperfliesJson: any, acmeJson: any, patagoniaJson: any): Promise<IHotel[]> {
        const result: IHotel[] = paperfliesJson.map(transformPaperflies);
        const acme = acmeJson.map(transformAcme)
        const patagonia = patagoniaJson.map(transformPatagonia);
    
        // aggregating and merging data
        for (const el of result) {
            const patItem = patagonia.find((item: { id: string; }) => item.id == el.id);
            const acmeItem = acme.find((item: { id: string; }) => item.id == el.id);
    
            el.name = findLongestName([el.name, patItem?.name, acmeItem?.name]);
            el.description = findLongestName([el.description, patItem?.description, acmeItem?.description]);
            
            // location data
            el.location = {
                address: findLongestName([el.location.address, patItem?.address, acmeItem?.address]),
                lat: patItem?.lat || acmeItem?.latitude,
                lng: patItem?.lng || acmeItem?.longitude,
                city: patItem?.city || acmeItem?.city,
                country: el.location.country || patItem?.country || acmeItem?.country
            };
            
            el.amenities = {
                room: removeDuplicateTags(mergeDedupe([el.amenities.room, patItem?.amenities])),
                general: removeDuplicateTags(mergeDedupe([el.amenities.general, acmeItem?.amenities]))
            };
    
            el.images = {
                rooms: removeDuplicateLinks(mergeDedupe([el.images?.rooms, patItem?.images?.rooms])),
                site: el.images?.site,
                amenities: patItem?.images?.amenities 
            };
    
            // remove general amenities if found in room
            el.amenities.general = removeStringsIfPresent(el.amenities.general, el.amenities.room);
        }
        return result;
    }

    public async testFetch(): Promise<any> {
        try {
            const response = await fetch('https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/acme');
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    }

    public async saveToDb(supplier: string, data: string): Promise<void> {
        this.supplierRepository.saveDataBySupplier(supplier, JSON.stringify(data));
    }

    public async saveToFile(supplier: string, data: string): Promise<void> {
        const filePath = path.resolve(__dirname, '..', '..', 'data', `${supplier}.json`);
        fs.writeFile(filePath, JSON.stringify(data), (err) => {
            if (err) {
                console.log(`[error] file: ${err}`);
            }
        });
    }
}

export default SupplierService;