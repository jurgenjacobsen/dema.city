import { Server } from "socket.io";
import { ApiAccess } from "../structures/Database";

export const WS = async (io: Server) => {

  io.use(async (socket, next) => {
    let token = socket.handshake.auth.token;
    if(!token) return;
    let data = await ApiAccess.fetch({ 'data.token': token });
    if(!data) return;
    return next();
  });
  
}