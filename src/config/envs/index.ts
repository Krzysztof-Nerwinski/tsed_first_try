import dotenv from 'dotenv';

export const isProduction = process.env.NODE_ENV === 'production';

const envSuffix = isProduction ? 'prod' : 'local';

export const envs = {
    ...process.env,
    ...dotenv.config({ path: `.env.${envSuffix}` }).parsed,
};
