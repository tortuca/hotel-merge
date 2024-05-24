import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300, checkperiod: 360 });

export default cache;