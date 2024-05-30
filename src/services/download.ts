import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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
                saveToFile(data, el.split('/').pop()!);
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

const saveToFile = (data: string, fileName: string) => {
    const filePath = path.resolve(__dirname, '..', '..', 'data', `${fileName}.json`);
    fs.writeFile(filePath, JSON.stringify(data), (err) => {
        if (err) {
            console.log(`[error] file: ${err}`);
        }
    });
}

export default getSuppliers;