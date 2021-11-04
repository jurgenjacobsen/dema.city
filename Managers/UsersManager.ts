import Collection from "@discordjs/collection";
import { Database } from "dsc.db";
import { MongoData } from "../";

export class UsersManager {
  public database = new Database({
    ...MongoData,
    collection: 'users'
  })
  public cache = new Collection<string, User>();
  constructor() {

  }
}

export interface User {

}