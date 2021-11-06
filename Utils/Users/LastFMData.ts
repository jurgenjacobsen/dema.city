import axios from "axios";

export function LastFMRequest(method: string, data: {user?: string, track?: string, limit?: string | number, album?: string}): Promise<any | undefined> {
  return new Promise(async (resolve) => {
    try {
      let res = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=${method}${data.user ? `&user=${data?.user}` : ''}${data.track ? `&track=${data.track}` : ''}${data.limit ? `&limit=${data.limit}` : ''}${data.album ? `&album=${data.album}` : ''}&api_key=${process.env.LAST_FM}&format=json`).catch((err) => {
      });
      if(res?.data) return resolve(res.data);
      else resolve(undefined);
    } catch(err) {
      return resolve(undefined);
    }
  });
}

export async function NowPlaying(username: string) {
  let data = await LastFMRequest('user.getRecentTracks', {user: username});
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

export async function WeeklyChart(username: string) {
  let data = await LastFMRequest('user.getWeeklyAlbumChart', {user: username, limit: 9});
  if(!data?.weeklyalbumchart?.album) return undefined;
  let albums: Array<{
    name: string,
    artist: string,
    url: string,
    mbid: string,
    imageURL: string,
    playcount: number,
    rank: number,
  }> = [];

  await new Promise((resolve) => {
    data.weeklyalbumchart.album.forEach(async (album: any, index: number, array: Array<any>) => {
      let a = await AlbumSearch(album.name) as any;
      if(a) albums.push({
        name: a.name,
        artist: a.artist,
        url: a.url,
        imageURL: a.image?.[3]?.['#text'],
        mbid: a.mbid,
        playcount: Number(album.playcount),
        rank: Number(album['@attr'].rank),
      });
      await wait(50);
      if(index === array.length-1) resolve(undefined);
    });
  });
  return albums.sort((a, b) => a.rank - b.rank);
}

export async function TrackSearch(track: string) {
  
}

export async function AlbumSearch(album: string, limit = 1) {
  let data = await LastFMRequest('album.search', {album: encodeURIComponent(album), limit: limit});
  if(!data?.results?.albummatches?.album) return undefined;
  return data?.results?.albummatches?.album[0];
}

async function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined);
    }, ms);
  })
}