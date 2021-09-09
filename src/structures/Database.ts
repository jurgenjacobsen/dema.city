import { Database } from "dsc.db";
import dotenv from 'dotenv';

dotenv.config();

export const Mongo = {
  uri: process.env.MONGO_URI as string,
  name: process.env.MONGO_DB as string,
  user: process.env.MONGO_USER as string,
  pass: process.env.MONGO_PASS as string,
};

export const Users = new Database<UserData>({ ...Mongo, collection: "users" });
export const News = new Database<NewsData>({ ...Mongo, collection: "news" });
export const Applications = new Database<ApplicationData>({ ...Mongo, collection: 'applications' });
export const ApiAccess = new Database<ApiAccessData>({ ...Mongo, collection: 'api_access' });

export type Raindrop = `${bigint}`;

export interface ApiAccessData {
  id: Raindrop;
  token: string;
}

export interface ApplicationData {
  id: Raindrop;
  name: string;
  description?: string;
}

export interface UserData {
  id: Raindrop;
}

export interface NewsData {
  id: Raindrop;
}