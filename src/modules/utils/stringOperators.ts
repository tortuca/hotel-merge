/*** Utility functions ***/

export const mergeDedupe = (arr: any) => {
    let set = [...new Set([].concat(...arr))];
    return set.filter(x => x != undefined);
}

export const removeDuplicateTags = (arr: string[]) => {
    const seen = new Set();
    const unique : string[] = [];

    for (const str of arr) {
        const normalizedStr = str.replace(/\s+/g, '');
        if (!seen.has(normalizedStr)) {
            seen.add(normalizedStr);
            unique.push(str);
        }
    }
    return unique;
}

export const removeDuplicateLinks = (arr: { link: string, description: string }[]) => {
    const seen = new Set<string>();
    return arr.filter(a => {
    if (seen.has(a.link)) {
        return false;
    } else {
        seen.add(a.link);
        return true;
    }
    });
}

export const removeStringsIfPresent = (arr1: string[], arr2: string[]) => {
    const remove = new Set(arr2.map(str => str.replace(/\s+/g, '')));
    return arr1.filter(str => !remove.has(str.replace(/\s+/g, '')));
}

export const findLongestName = (arr: string[]) => {
    return arr.filter(x => x != undefined).reduce((a, b) => a.length < b.length ? b : a, "");
}

export const convertPascalToSnake = (input: string) => {
    return input.split(/\.?(?=[A-Z])/).join('_').toLowerCase().trim();
}

export const convertPascalToTags = (input: string) => {
    return input.split(/\.?(?=[A-Z])/).join(' ').toLowerCase().trim();
}