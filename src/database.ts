import { Database } from 'dsc.db';
import { mongoInfo } from './utils';

export type Snowflake = `${bigint}`;
export type Email = `${string}@${string}`;
export interface User {
  id: Snowflake;
  username: string;

  name: string | null;
  banner: string | null;
  icon: string | null;
  birthday: Date | null;
  aboutme: string | null;
  location: string | null;

  phoneNumber: number | null;
  discordId: Snowflake | null;
  instagram: string | null;
  twitter: string | null;
  website: string | null;
  email: Email;

  staff: boolean;
  verified: boolean;
  partner: boolean;
  developer: boolean;

  badges: Snowflake[];
  likes: Snowflake[];
  posts: Snowflake[];
  followers: Snowflake[];
  follows: Snowflake[];
  notifications: {
    red: Snowflake[];
    unreads: Snowflake[];
  };

  options: {
    devUpdates: boolean;
    emailNotifications: boolean;
    private: boolean;
  };
};

export interface Application {
  id: Snowflake;
  username: string;

  name: string | null;
  banner: string | null;
  icon: string | null;
  birthday: Date | null;
  aboutme: string | null;
  location: string | null;

  verified: boolean;
  system: boolean;

  likes: Snowflake[];
  posts: Snowflake[];
  followers: Snowflake[];
  follows: Snowflake[];
};

const access = new Database({ ...mongoInfo, collection: 'access' });
const users = new Database({ ...mongoInfo, collection: 'users' });
const applications = new Database({ ...mongoInfo, collection: 'applications' });

export { access, users, applications };