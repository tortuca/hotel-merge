import { convertPascalToSnake, convertPascalToTags } from './stringOperators';

export const transformPaperflies = (input: any) => {
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

export const transformAcme = (input: any) => {
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

export const transformPatagonia = (input: any) => {
    input.description = input.info;
    delete input.input;

    input = transformAmenities(input);
    input = transformImages(input);
    return input;
}

export const transformAmenities = (input: any) => {
    const amenities = input?.amenities;
    if (!amenities) return input;

    Object.values(amenities).forEach((name, index) => {
        input.amenities[index] = convertPascalToTags(name as string);
    });
    return input;
}

export const transformImages = (input: any) => {
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
