import NodeCache from 'node-cache';

const store = new NodeCache({ stdTTL: 15 * 60 });

export default store;
