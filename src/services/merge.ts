import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { Hotel, ImageUrl } from '../models/hotel.model';
import cache from './cache';

dotenv.config();

const suppliers: string[] = (process.env.SUPPLIERS || '').split(',');

/*** Data functions ***/

export const getSuppliers = async (download: boolean) => {
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
                let supplier = el.split('/').pop();
                const filePath = path.resolve(__dirname, '..', '..', 'data', `${supplier}.json`);
                fs.writeFile(filePath, JSON.stringify(data), (err) => {
                    if (err) {
                        console.log(`[error] file: ${err}`);
                    }
                });
                return { data, error: null };
            }
        }));
        return responses;
    } catch (error) {
        console.error('[error] unable to fetch suppliers:', error);
        throw error;
    }
}

export const testFetch = async () => {
    try {
        const response = await fetch('https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/acme');
        const data = await response.json();
    } catch (error) {
        throw error;
    }
}

export const filterDestination = (item: any, destination: number) => {
    return destination === -1 || item.destination === destination;
}

export const filterHotels = (item: any, hotels: string[]) => {
    return hotels.length === 0 || hotels.includes(item.id);
}

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

export const loadHotels = async () => {
    try {
        const download = (process.env.DOWNLOAD || 'true') === 'true';
        await getSuppliers(download);
        const paperfliesPath = path.resolve(__dirname, '..', '..', 'data', 'paperflies.json');
        const acmePath = path.resolve(__dirname, '..', '..', 'data', 'acme.json');
        const patagoniaPath = path.resolve(__dirname, '..', '..', 'data', 'patagonia.json');

        // load files in parallel
        const [paperfliesData, acmeData, patagoniaData] = await Promise.all([
            fs.promises.readFile(paperfliesPath, 'utf8'),
            fs.promises.readFile(acmePath, 'utf8'),
            fs.promises.readFile(patagoniaPath, 'utf8')
        ]);
        // Parse JSON after reading all files
        const paperfliesJson = JSON.parse(paperfliesData);
        const acmeJson = JSON.parse(acmeData);
        const patagoniaJson = JSON.parse(patagoniaData);

        return mergeSuppliers(paperfliesJson, acmeJson, patagoniaJson);
    } catch (error) {
        console.error('[error] unable to load files:', error);
        throw error;
    }
}

export const mergeSuppliers = async (paperfliesJson: any, acmeJson: any, patagoniaJson: any) => {
    const result: Hotel[] = paperfliesJson.map(transformPaperflies);
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

/*** Transformation functions ***/

const transformPaperflies = (input: any) => {
    const output = {
        id: input.hotel_id,
        destination: input.destination_id,
        name: input.hotel_name,
        description: input.details,
        ...input // copy other properties
    }

    delete output.hotel_id;
    delete output.destination_id;
    delete output.hotel_name;
    delete output.details;

    return transformImages(output);
}

const transformAcme = (input: any) => {
    const output: any = {};

    for (const key in input) {
        const value = input[key];
        if (!value) continue;

        const newKey = convertPascalToSnake(key);
        output[newKey] = value;
    }

    output.destination = output.destination_id;
    output.amenities = output.facilities;

    delete output.destination_id;
    delete output.facilities;

    return transformAmenities(output);
}

const transformPatagonia = (input: any) => {
    input.description = input.info;
    delete input.input;

    input = transformAmenities(input);
    input = transformImages(input);
    return input;
}

const transformAmenities = (input: any) => {
    const amenities = input?.amenities;
    if (!amenities) return input;

    Object.values(amenities).forEach((name, index) => {
        input.amenities[index] = convertPascalToTags(name as string);
    });
    return input;
}

const transformImages = (input: any) => {
    const images = input?.images;
    if (!images) return input;

    for (const imageGroup of Object.values(images)) {
        if (!Array.isArray(imageGroup)) continue;

        for (const image of imageGroup) {
            if (image.url) {
                image.link = image.url;
                delete image.url;
            }
            if (image.caption) {
                image.description = image.caption;
                delete image.caption;
            }
        }
    }
    return input;
}

/*** Utility functions ***/

const mergeDedupe = (arr: any) => {
    let set = [...new Set([].concat(...arr))];
    return set.filter(x => x != undefined);
}

export const removeDuplicateTags = (arr: string[]) => {
    const seen = new Set();
    const unique : string[] = [];

    for (const str of arr) {
        const normalizedStr = str.replace(/\s+/g, '');
        if (!seen.has(normalizedStr)) {
            seen.add(normalizedStr);
            unique.push(str);
        }
    }
    return unique;
}

export const removeDuplicateLinks = (arr: { link: string, description: string }[]) => {
    const seen = new Set<string>();
    return arr.filter(a => {
      if (seen.has(a.link)) {
        return false;
      } else {
        seen.add(a.link);
        return true;
      }
    });
}

export const removeStringsIfPresent = (arr1: string[], arr2: string[]) => {
    const remove = new Set(arr2.map(str => str.replace(/\s+/g, '')));
    return arr1.filter(str => !remove.has(str.replace(/\s+/g, '')));
}

export const findLongestName = (arr: string[]) => {
    return arr.filter(x => x != undefined).reduce((a, b) => a.length < b.length ? b : a, "");
}

export const convertPascalToSnake = (input: string) => {
    return input.split(/\.?(?=[A-Z])/).join('_').toLowerCase().trim();
}

export const convertPascalToTags = (input: string) => {
    return input.split(/\.?(?=[A-Z])/).join(' ').toLowerCase().trim();
}