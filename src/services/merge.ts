import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { Hotel, ImageUrl } from '../models/hotel.model';
import cache from '../db/cache';
import { getSuppliers } from './download';
import { convertPascalToSnake, convertPascalToTags, findLongestName, 
    removeDuplicateTags, removeDuplicateLinks, removeStringsIfPresent, mergeDedupe } from './utility';

dotenv.config();

const suppliers: string[] = (process.env.SUPPLIERS || '').split(',');

/*** Data functions ***/

export const loadHotels = async () => {
    try {
        const enableDownload = (process.env.ENABLE_DOWNLOAD || 'true') === 'true';
        await getSuppliers(enableDownload);
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
