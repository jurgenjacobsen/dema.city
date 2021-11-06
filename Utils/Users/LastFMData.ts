import axios from "axios";

export function LastFMRequest(method: string, user?: string): Promise<any | undefined> {
  return new Promise(async (resolve) => {
    let res = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=${method}&user=${user}&api_key=${process.env.LAST_FM}&format=json`);
    if(res.data) return resolve(res.data);
    else resolve(undefined);
  });
}

export async function NowPlaying(username: string) {
  let data = await LastFMRequest('user.getRecentTracks', username);
  if(!data || !data.recenttracks?.track) return undefined;
  let nowplaying = data.recenttracks.track[0];
  if(!nowplaying) return undefined;

  let song = {
    artist: nowplaying?.artist?.['#text'],
    imageURL: nowplaying?.image[3]?.['#text'],
    mbid: nowplaying?.mbid,
    album: nowplaying?.album?.['#text'],
    title: nowplaying?.name,
    url: nowplaying?.url,
    lastSeen: nowplaying?.date?.['#text'] ? new Date(nowplaying?.date?.['#text']) : undefined,
  };

  return song ? 
  (song.lastSeen instanceof Date ? (new Date().getTime() - song.lastSeen.getTime() >= (10 * 60 * 1000) ? undefined : song) : song) 
  : undefined;
}