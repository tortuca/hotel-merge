import express from 'express';
import bodyParser from 'body-parser';
import router from '../src/routes/api';
import request from 'supertest';

const app = express();
app.use(bodyParser.json());
app.use(router);

// jest.mock('../../services/merge');

afterEach(() => {
    jest.clearAllMocks();
})

describe('test', () => {
    let expectedMessage = 'test';
    it('should test merge with 200', async () => {
        const response = await request(app).get('/test').send();
        expect(response.status).toBe(200);
        expect(response.text).toBe(expectedMessage);
    });
});


// describe('Hotel Query', () => {
//     it('Get destination=5432', async () => {
//         const response = await request(app).get('/query/destination=5432').send();
//         expect(response.status).toBe(200);
//         expect(response.body).toBeDefined();
//     });

//     it('Get destination=1122', async () => {
//         const response = await request(app).get('/query/destination=5432').send();
//         expect(response.status).toBe(200);
//         expect(response.body).toBeDefined();
//     });

//     it('Get hotel=SjyX', async () => {
//         const response = await request(app).get('/query/hotels=SjyX').send();
//         expect(response.status).toBe(200);
//         expect(response.body).toBeDefined();
//     });
//     it('Get hotel=f8c9', async () => {
//         const response = await request(app).get('/query/hotels=f8c9').send();
//         expect(response.status).toBe(200);
//         expect(response.body).toBeDefined();
//     });
//     it('Get hotel=SjyX,f8c9', async () => {
//         const response = await request(app).get('/query/hotels=f8c9&hotels=SjyX').send();
//         expect(response.status).toBe(200);
//         expect(response.body).toBeDefined();
//     });
// });