import express from 'express';
import bodyParser from 'body-parser';
import router from '../src/routes/api';
import request from 'supertest';
import mongoose from 'mongoose';

import HotelService from '../src/modules/hotels/hotels.service';

const app = express();
app.use(bodyParser.json());
app.use(router);
    
const hotelService = new HotelService();

beforeAll(async () => {
    const MONGO_URL = process.env.MONGO_URL || '';
    await mongoose.connect(MONGO_URL);
    mongoose.connection.on('error', (error: Error) => console.log(error));

    jest.setTimeout(10000);
})

afterEach(() => {
    jest.clearAllMocks();
})

afterAll(async () => {
    await mongoose.disconnect();
})

describe('Health', () => {
    it('health', async () => {
        const response = await request(app).get('/health').send();
        expect(response.status).toBe(200);
        expect(response.text).toBe('OK');
    });
});

describe('Hotel Query', () => {
    const hotels = hotelService.hotelRepository;
    it('Get destination=5432', async () => {
        hotels.findHotelsByDestination = jest.fn().mockReturnValue([
            {
              id: 'abc2',
              destination: 5432,
              name: 'test',
            },
            {
              id: 'xyz3',
              destination: 5432,
              name: 'test2',
            }
        ]);

        const response = await request(app).get('/query?destination=5432').send();
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.length).toEqual(2);
    });

    it('Get destination=1122', async () => {
        const response = await request(app).get('/query?destination=1122').send();
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.length).toEqual(1);
    });

    it('Get hotel=SjyX', async () => {
        const response = await request(app).get('/query?hotels=SjyX').send();
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.length).toEqual(1);
    });

    it('Get hotel=f8c9', async () => {
        const response = await request(app).get('/query?hotels=f8c9').send();
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.length).toEqual(1);
    });

    it('Get hotel=SjyX,f8c9', async () => {
        const response = await request(app).get('/query?hotels=f8c9&hotels=SjyX').send();
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.length).toEqual(2);
    });

    it('Get hotel=f8c9,SjyX,iJhz', async () => {
        const response = await request(app).get('/query?hotels=f8c9,SjyX,iJhz').send();
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.length).toEqual(3);
    });

    it('Get destination=5432&hotels=f8c9,SjyX,iJhz', async () => {
        const response = await request(app).get('/query?destination=5432&hotels=f8c9,SjyX,iJhz').send();
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.length).toEqual(2);
    });
});