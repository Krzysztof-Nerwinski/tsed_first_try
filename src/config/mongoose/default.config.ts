
const { MONGO_USER, MONGO_PASSWORD, MONGO_DB_NAME, DEFAULT_URL } = process.env;

export default {
  id: MONGO_DB_NAME || "default",
  url: DEFAULT_URL || "mongodb://localhost:27017/default",
  connectionOptions: {
    user: MONGO_USER,
    pass: MONGO_PASSWORD,
  }
};
