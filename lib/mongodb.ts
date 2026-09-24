import { MongoClient, ServerApiVersion } from "mongodb";

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
};

let clientPromise: Promise<MongoClient> | undefined;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri, options).connect();
    }
    return global._mongoClientPromise;
  }

  if (!clientPromise) {
    const connectionAttempt = new MongoClient(uri, options).connect();
    clientPromise = connectionAttempt;

    // Do not leave a rejected connection promise unhandled when MongoDB is
    // unavailable during startup. The next request can retry the connection.
    void connectionAttempt.catch(() => {
      if (clientPromise === connectionAttempt) {
        clientPromise = undefined;
      }
    });
  }

  return clientPromise;
}
