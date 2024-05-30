import mongoose, { mongo } from 'mongoose';
import { Hotel } from '../models/hotel.model';

const LocationSchema = new mongoose.Schema({
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String },
    city: { type: String },
    country: { type: String }
});

const ImageUrlSchema = new mongoose.Schema({
    link: { type: String },
    description: { type: String }
})
const HotelSchema = new mongoose.Schema({
    id: { type: String, required: true },
    destination: { type: String, required: true },
    name: { type: String },
    location: { type: LocationSchema },
    description: { type: String },
    amenities: { type: String },
    images: { type: String },
    booking_conditions: { type: String }
    // amenities: Record<string, string[]>;
    // images: Record<string, ImageUrl[]>;
    // booking_conditions: string[];
});

export const LocationModel = mongoose.model('Location', LocationSchema);
export const ImageUrlModel = mongoose.model('ImageUrl', ImageUrlSchema);
export const HotelModel = mongoose.model('Hotel', HotelSchema); 

// actions
export const getHotels = () => HotelModel.find(); // Retrieve all hotels
export const getHotelsByDestination = (destination: string) => HotelModel.findOne({destination});
export const getHotelById = (id: string) => HotelModel.findOne({id});
export const getHotelsByIds = (ids: string[]) => HotelModel.find({ids});
export const getHotelsByDestinationAndIds = (destination: string, ids: string[]) => HotelModel.find({destination, ids});

export const saveHotels = (hotels: Hotel) => HotelModel.insertMany(hotels);