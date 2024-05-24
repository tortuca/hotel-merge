import { convertSnakeToPascal, convertSnakeToTags, findLongestName, getHotels, removeDuplicates, removeStringsIfPresent } from "../src/services/merge";

describe('Get hotels', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseStatus: jest.Mock;
    let responseSend: jest.Mock;
    
    it('responds with 200', async () => {
        let response = await getHotels(false, 0, ['']);
        expect(response).toBeDefined();
    });
});


describe('Remove duplicates and strings if present ', () => {
    it('Pool, Pool, Breakfast, Gym', () => {
        let conv = removeDuplicates(['Pool', 'Pool', 'Breakfast', 'Gym']);
        expect(conv.length).toEqual(3);
        expect(conv).toEqual(['Pool', 'Breakfast', 'Gym']);
    });
    it('Wi fi to wifi, pool', () => {
        let conv = removeStringsIfPresent(['wifi', 'bathtub', 'business center'], ['wi fi', 'bathtub', 'pool']);
        expect(conv.length).toEqual(1);
        expect(conv).toEqual(['business center']);
    });

    it('Aircon to air con, bar', () => {
        let conv = removeStringsIfPresent(['air con', 'gym', 'pool'], ['wifi', 'aircon', 'bar']);
        expect(conv.length).toEqual(2);
        expect(conv).toEqual(['gym', 'pool']);
    });
});

describe('Find longest name', () => {
    it('Longest BBBBBBBB', () => {
        let conv = findLongestName(['AA', 'BBBBBB', 'CCCC']);
        expect(conv).toEqual('BBBBBB');
    });
})

describe('Convert fields', () => {
    it('DestinationId to destination_id', () => {
        let conv = convertSnakeToPascal('DestinationId');
        expect(conv).toEqual('destination_id');
    });
    it('Name to name', () => {
        let conv = convertSnakeToPascal('Name');
        expect(conv).toEqual('name');
    });

    it(' BusinessCenter to business center', () => {
        let conv = convertSnakeToTags(' BusinessCenter');
        expect(conv).toEqual('business center');
    });
});