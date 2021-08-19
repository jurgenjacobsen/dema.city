import { Database } from "dsc.db";
import { mongoInfo } from "./utils";

const access = new Database({ ...mongoInfo, collection: 'access' });
const users = new Database({ ...mongoInfo, collection: 'users' });

export { access, users };