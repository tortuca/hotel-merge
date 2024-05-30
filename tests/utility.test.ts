import { removeDuplicateTags, removeStringsIfPresent, findLongestName, 
    convertPascalToSnake, convertPascalToTags } from '../src/services/utility';

describe('Remove duplicates and strings if present ', () => {
    it('Pool, Pool, Breakfast, Gym', () => {
        let conv = removeDuplicateTags(['Pool', 'Pool', 'Breakfast', 'Gym']);
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

describe('Convert PascalCase to snake_case', () => {
    it('DestinationId to destination_id', () => {
        let conv = convertPascalToSnake('DestinationId');
        expect(conv).toEqual('destination_id');
    });
    it('Name to name', () => {
        let conv = convertPascalToSnake('Name');
        expect(conv).toEqual('name');
    });

    it(' BusinessCenter to business center', () => {
        let conv = convertPascalToTags(' BusinessCenter');
        expect(conv).toEqual('business center');
    });
});