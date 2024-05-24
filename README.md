# Supplier Merge

## Assumptions
1. There are three suppliers: ACME, Patagonia and Paperflies, additional supplier may require new cleaning techniques.
2. Each supplier's existing fields will not change, additional fields may be added.

## Solution

Make sure all the fields have the same name and format.

### Merging


### Cleaning
- Inconsistencies: Different fields, inconsistent capitalization
- Redundant data: Data that's duplicated

Techniques:
1. Modify data: Iterate through and standardise data
2. Remove data: Filter out unused and irrelevant fields
3. Aggregate data: Merge and summarise data, and thereby optimise access

### Performance
 - Data procurement: we should ensure reading in parallel where possible.
 - Data delivery: possible cache for popular destinations?

## Specifications

1. Merge hotel data of different suppliers
2. Parse and clean dirty data
3. Rules to filter data
4. API endpoint that allows us to query the hotels data with some simple filtering

```
GET /rooms
destination: int 
hotels: string[]
```

## Running the app

### Test

```
npm test
```


### Development with `nodemon`

```
npm run dev
```

### Build

```
npm run Build
```

### Start

```
npm start
```