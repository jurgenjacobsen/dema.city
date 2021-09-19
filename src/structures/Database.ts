import { Database } from "dsc.db";
import dotenv from "dotenv";
import { Pronoun, UserOptions } from "../Managers/UsersManager";

dotenv.config();

export const Mongo = {
  uri: process.env.MONGO_URI as string,
  name: process.env.MONGO_DB as string,
  user: process.env.MONGO_USER as string,
  pass: process.env.MONGO_PASS as string,
};

export const Users = new Database<UserData>({ ...Mongo, collection: "users" });
export const News = new Database<NewsData>({ ...Mongo, collection: "news" });
export const Applications = new Database<ApplicationData>({ ...Mongo, collection: "applications" });
export const ApiAccess = new Database<ApiAccessData>({ ...Mongo, collection: "api_access" });
export const LastFmUsers = new Database<LastFmData>({ ...Mongo, collection: "lastfm_users" });

export type Raindrop = `${bigint}`;

export interface LastFmData {
  session: {
    subscriber: number;
    name: string;
    key: string;
  };
  api_sig: string;
}

export interface ApiAccessData {
  applicationId: Raindrop;
  token: string;
}
export interface ApplicationData {
  id: Raindrop;
  name: string;
  privileged: boolean;
  master: boolean;
  description?: string;
}

export interface NewsData {
  id: Raindrop;
}

export interface UserData {
  id: Raindrop;
  email?: string;
  username?: string;
  twitterId?: Raindrop;
  twitter?: string;
  instagram?: string;
  discordId?: Raindrop;
  website?: string;
  name?: string;
  icon?: string;
  banner?: string;
  birthday?: Date;
  location?: string;
  phone?: number;
  aboutMe?: string;
  pronouns: Pronoun[];

  partner: boolean;
  moderator: boolean;
  developer: boolean;
  verified: boolean;

  badges: Raindrop[];
  follows: Raindrop[];
  followers: Raindrop[];
  posts: Raindrop[];

  options: UserOptions;
}
