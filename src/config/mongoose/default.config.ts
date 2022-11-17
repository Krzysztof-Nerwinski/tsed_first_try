const { MONGO_USER, MONGO_PASSWORD, DEFAULT_URL, MONGO_DB_NAME } = process.env;

export default {
    id: 'default',
    url: DEFAULT_URL || 'mongodb://localhost:27017/default',
    connectionOptions: {
        dbName: MONGO_DB_NAME,
    },
};
