export interface IHotel {
    id: string;
    destination: number;
    name: string;
    location: ILocation;
    description: string;
    amenities: Record<string, string[]>;
    images: Record<string, IImageUrl[]>;
    booking_conditions: string[];
}

export interface IImageUrl {
    link: string;
    description: string;
}

export interface ILocation {
    lat: number;
    lng: number;
    address: string;
    city: string;
    country: string;
}