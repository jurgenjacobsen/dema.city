import { Database } from 'dsc.db';
import { mongoInfo } from './utils';

export type Snowflake = `${bigint}`;
export type Email = `${string}@${string}`;
export interface User {
  id: Snowflake;
  username: string;

  banner: string | null;
  icon: string | null;
  birthday: Date | null;

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
  authenticated: boolean;

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
}

const access = new Database({ ...mongoInfo, collection: 'access' });
const users = new Database({ ...mongoInfo, collection: 'users' });

export { access, users };
