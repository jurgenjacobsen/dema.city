import { Collection } from "discord.js";
import { Raindrop, UserData, Users } from "../Structures/Database";
import { Rain, wait } from "../Structures/MainUtil";
import { createAvatar } from "@dicebear/avatars";
import { writeFileSync } from "fs";
import * as style from "@dicebear/micah";
import path from "path";
import md5 from "md5";

export type Email = `${string}@${string}`;
export type Pronoun = string;

export interface UserOptions {
  accountPrivate: boolean;
  discordNotifications: boolean;
}

export type UsersCollection = Collection<Raindrop, User>;

export class User {
  public id: Raindrop;
  public email?: string;
  public username?: string;
  public twitterId?: Raindrop;
  public twitter?: string;
  public instagram?: string;
  public discordId?: Raindrop;
  public website?: string;
  public name?: string;
  public icon?: string;
  public banner?: string;
  public birthday?: Date;
  public location?: string;
  public phone?: number;
  public aboutMe?: string;
  public pronouns: Pronoun[];

  public partner: boolean;
  public moderator: boolean;
  public developer: boolean;
  public verified: boolean;

  public badges: Raindrop[];
  public follows: Raindrop[];
  public followers: Raindrop[];
  public posts: Raindrop[];

  public options: UserOptions;

  public manager: UsersManager;
  constructor(manager: UsersManager, raw: any) {
    this.id = raw.id;
    this.email = raw.email;
    this.username = raw.username;
    this.twitterId = raw.twitterId;
    this.twitter = raw.twitter;
    this.instagram = raw.instagram;
    this.discordId = raw.discordId;
    this.website = raw.website;
    this.name = raw.name;
    this.icon = raw.icon;
    this.banner = raw.banner;
    this.birthday = raw.birthday;
    this.location = raw.location;
    this.phone = raw.phone;
    this.aboutMe = raw.aboutMe;
    this.pronouns = raw.pronouns;

    this.partner = raw.partner;
    this.moderator = raw.moderator;
    this.developer = raw.developer;
    this.verified = raw.verified;

    this.badges = raw.badges;
    this.follows = raw.follows;
    this.followers = raw.followers;
    this.posts = raw.posts;

    this.options = raw.options;

    this.manager = manager;
  }
}

export class UsersManager {
  public cache: UsersCollection;
  constructor() {
    this.cache = new Collection();

    this.__init__();
    setTimeout(() => {
      this.__init__();
    }, 5 * 1000);
  }

  public async __init__() {
    await wait(5000);
    const users = await Users.list().then((u) => u?.map((_u) => _u.data));
    users?.forEach((raw) => {
      if (!raw) return;
      const user = new User(this, raw);
      return this.cache.set(user.id, user);
    });
  }

  public fetch(query: Raindrop | any): Promise<User | undefined> {
    return new Promise(async (resolve) => {
      const raw = await Users.fetch(query).then((r) => r?.data);
      if (!raw) return resolve(undefined);
      return resolve(new User(this, raw));
    });
  }

  public raw(query: Raindrop | any): Promise<UserData | undefined> {
    return new Promise(async (resolve) => {
      const raw = await Users.fetch(query).then((r) => r?.data);
      if (!raw) return resolve(undefined);
      return resolve(raw);
    });
  }

  public create(data: { email: Email; twitterId?: Raindrop; discordId?: Raindrop }): Promise<User> {
    return new Promise(async (resolve) => {
      const alreadyExists = this.cache.find((u) => u.email === data.email || u.twitterId === data.twitterId || u.discordId === data.discordId);
      if (alreadyExists) return resolve(alreadyExists);

      const id = Rain();
      const icon = createAvatar(style, { seed: id });
      const iconNameFile = md5(id);

      writeFileSync(`${path.resolve(__dirname, "../../assets/icons")}/${iconNameFile}.svg`, icon);

      const username = iconNameFile.slice(0, 8).trim().toLowerCase();

      const raw = await Users.set(id, {
        id: id,
        email: data.email,
        username: username,
        twitterId: data.twitterId,
        twitter: undefined,
        instagram: undefined,
        discordId: data.discordId,
        website: undefined,
        name: undefined,
        icon: `https://cdn.dema.city/icons/${iconNameFile}.svg`,
        banner: undefined,
        birthday: undefined,
        location: undefined,
        phone: undefined,
        aboutMe: undefined,
        pronouns: [],
        partner: false,
        moderator: false,
        developer: false,
        verified: false,
        badges: [],
        follows: [],
        followers: [],
        posts: [],
      }).then((u) => u.data);

      return resolve(new User(this, raw));
    });
  }
}

export const users = new UsersManager();
