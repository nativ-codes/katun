import {randomUUID} from 'crypto';

const createId = (_prefix?: string) => randomUUID();

export default createId;
