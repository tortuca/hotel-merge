import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String },
    city: { type: String },
    country: { type: String }
}, { _id : false });

const ImageUrlSchema = new mongoose.Schema({
    link: { type: String },
    description: { type: String }
}, { _id : false })

const AmenitiesSchema = new mongoose.Schema({
    room: [{ type: String }],
    general: [{ type: String }]
}, { _id : false })

const ImagesSchema = new mongoose.Schema({
    site: [{ type: ImageUrlSchema }],
    rooms: [{ type: ImageUrlSchema }],
    amenities: [{ type: ImageUrlSchema }]
}, { _id : false })

const HotelSchema = new mongoose.Schema({
    id: { type: String, required: true },
    destination: { type: Number, required: true },
    name: { type: String },
    location: { type: LocationSchema },
    description: { type: String },
    amenities: { type: AmenitiesSchema },
    images: { type: ImagesSchema },
    booking_conditions: { type: Array }
});

export const LocationModel = mongoose.model('Location', LocationSchema);
export const ImageUrlModel = mongoose.model('ImageUrl', ImageUrlSchema);
export const HotelModel = mongoose.model('Hotel', HotelSchema); 