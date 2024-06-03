import mongoose from 'mongoose';
import dotenv from 'dotenv';

import SupplierRepository from '../suppliers/suppliers.repository';
import HotelRepository from '../hotels/hotels.repository';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || '';

const supplierRepository: SupplierRepository = new SupplierRepository();
const hotelRepository: HotelRepository = new HotelRepository();

export const connectDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        mongoose.connection.once('open', () => {
            console.log('[db]: connected to MongoDB');
        });
    } catch (error) {
        console.error('[db]: connection error', error);
    }
};

export const initializeDatabase = async () => {
    await connectDatabase();
    await hotelRepository.initHotelDb();
    await supplierRepository.initSupplierDb();
}

export default connectDatabase;