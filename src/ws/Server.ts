import { Server } from "socket.io";
import { ApiAccess } from "../Structures/Database";

export const WS = async (io: Server): Promise<void> => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return;
    const data = await ApiAccess.fetch({ "data.token": token });
    if (!data) return;
    return next();
  });
};
