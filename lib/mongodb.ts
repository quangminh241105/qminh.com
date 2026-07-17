import { MongoClient, type Db } from "mongodb";

const dbName = process.env.MONGODB_DB ?? "portfolio";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function connect(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Promise.reject(new Error("MONGODB_URI is not set"));
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  return client.connect();
}

// In dev, Next.js reloads modules on every HMR pass, so the promise is
// cached on `global` to keep re-using the same connection across reloads.
let clientPromise: Promise<MongoClient> | undefined;

export function getMongoClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = connect();
    }
    return global._mongoClientPromise;
  }
  if (!clientPromise) {
    clientPromise = connect();
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}
