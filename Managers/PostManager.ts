import Collection from "@discordjs/collection";
import { Database } from "dsc.db";

import { EventEmitter } from "events";
import { Rain, Raindrop } from '../Utils/Blog/RaindropGen';
import { MongoData } from '../';

export class PostManager extends EventEmitter {
  public cache = new Collection<string, Post>();
  public database = new Database<Post>({
    ...MongoData,
    collection: 'posts'
  })
  constructor() {
    super();

    this.database.list().then((list) => {
      list?.forEach((post) => {
        return this.cache.set(post.data.id, post.data);
      });
    });
  }

  public publish(data: {
    category: string,
    author: string,
    title: string,
    description?: string,
    text: string,
  }): Promise<Post> {
    return new Promise(async (resolve, reject) => {
      let id = Rain();

      let post: Post = {
        id: id,
        date: new Date(),
        ...data,
      };

      await this.database.set(post.id, post).then((r) => r.data).catch((err) => {
        return reject(err);
      });

      this.cache.set(post.id, post);

      return resolve(post);
    })
  }

  public edit(id: string, data: {
    category: string,
    author: string,
    title: string,
    description?: string,
    text: string,
  }): Promise<Post> {
    return new Promise(async (resolve, reject) => {
      let post: Post = {
        id: id as Raindrop,
        date: new Date(),
        ...data,
      };

      await this.database.set(post.id, post).then((r) => r.data).catch((err) => {
        return reject(err);
      });

      this.cache.set(post.id, post);

      return resolve(post);
    })
  }
}

export interface Post {
  id: Raindrop;
  date: Date;
  title: string;
  author: string;
  category: string;
  description?: string;
  text: string;
  banner?: string;
}