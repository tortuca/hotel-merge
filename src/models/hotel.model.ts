export interface Hotel {
    id: string;
    destination: number;
    name: string;
    location: Location;
    description: string;
    amenities: Record<string, string[]>;
    images: Record<string, ImageUrl[]>;
    booking_conditions: string[];
}

export interface ImageUrl {
    link: string;
    description: string;
}

export interface Location {
    lat: number;
    lng: number;
    address: string;
    city: string;
    country: string;
}