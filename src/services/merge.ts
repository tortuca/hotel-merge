import dotenv from 'dotenv';
import fs from 'fs';

import acmeJson from '../../data/acme.json';
import paperfliesJson from '../../data/paperflies.json';
import patagoniaJson from '../../data/patagonia.json';
import { Hotel, ImageUrl } from '../models/hotel.model';

dotenv.config();

const suppliers: string[] = (process.env.SUPPLIERS || '').split(',');

export const getSuppliers = async () => {
    try {
        // parallel fetching for all suppliers to speed up performance
        const responses = await Promise.all(suppliers.map(async (el) => {
            const response = await fetch(el);
            console.log(response.status, response.ok, el, 'fetch');
            if (!response.ok) {
                console.log(el, `[error] HTTP: ${response.status}`);
                return { data: null, error: `HTTP: ${response.status}` };
            } else {
                const data = await response.json();
                let supplier = el.split('/').pop();
                fs.writeFile(`../../data/${supplier}.json`, JSON.stringify(data), function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
                return { data, error: null };
            }
        }));
        return responses;
    } catch (error) {
        console.error('Error fetching suppliers:', error);
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

export const getHotels = async (download: boolean, destination: number, hotels: string[]) => {
    if (download) {
        await getSuppliers();
    }
    return mergeSuppliers(destination, hotels);
}

export const mergeSuppliers = async (destination: number, hotels: string[]) => {
    const result: Hotel[] = structuredClone(paperfliesJson).map(transformPaperflies);
    const acme = structuredClone(acmeJson).map(transformAcme);
    const patagonia = structuredClone(patagoniaJson).map(transformPatagonia);

    for (const el of result) {
        // aggregating data
        const patItem = patagonia.find(item => item.id == el.id);
        const acmeItem = acme.find(item => item.id == el.id);

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
            room: removeDuplicates(mergeDedupe([el.amenities.room, patItem?.amenities])),
            general: removeDuplicates(mergeDedupe([el.amenities.general, acmeItem?.amenities]))
        };

        el.images = {
            site: mergeDedupe([el.images?.site, patItem?.images?.amenities, acmeItem?.images?.site]),
            rooms: mergeDedupe([el.images?.rooms, patItem?.images?.rooms, acmeItem?.images?.rooms])
        };

        // remove general amenities if found in room
        el.amenities.general = removeStringsIfPresent(el.amenities.general, el.amenities.room);
    }
    return result;
}

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

        const newKey = convertSnakeToPascal(key);
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
        input.amenities[index] = convertSnakeToTags(name as string);
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

const mergeDedupe = (arr: any) => {
    let set = [...new Set([].concat(...arr))];
    return set.filter(x => x != undefined);
}

export const removeDuplicates = (arr: string[]) => {
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

export const removeStringsIfPresent = (arr1: string[], arr2: string[]) => {
    const remove = new Set(arr2.map(str => str.replace(/\s+/g, '')));
    return arr1.filter(str => !remove.has(str.replace(/\s+/g, '')));
}

export const findLongestName = (arr: string[]) => {
    return arr.filter(x => x != undefined).reduce((a, b) => a.length < b.length ? b : a, "");
}

export const convertSnakeToPascal = (input: string) => {
    return input.split(/\.?(?=[A-Z])/).join('_').toLowerCase().trim();
}

export const convertSnakeToTags = (input: string) => {
    return input.split(/\.?(?=[A-Z])/).join(' ').toLowerCase().trim();
}