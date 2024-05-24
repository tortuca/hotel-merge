import { convertSnakeToPascal, convertSnakeToTags, getSuppliers } from "../src/services/merge";

describe('Get suppliers', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseStatus: jest.Mock;
    let responseSend: jest.Mock;
    
    it('responds with 200', async () => {
        let response = await getSuppliers();
        // expect(response).(200);
    });
});

describe('Convert fields', () => {
    it('DestinationId to destination_id', () => {
        let conv = convertSnakeToPascal('DestinationId');
        expect(conv).toEqual('destination_id');
    })
    it('Name to name', () => {
        let conv = convertSnakeToPascal('Name');
        expect(conv).toEqual('name');
    })

    it(' BusinessCenter to business center', () => {
        let conv = convertSnakeToTags(' BusinessCenter');
        expect(conv).toEqual('business center');
    })
});