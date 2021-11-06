import express, { NextFunction, Request, Response } from "express";

import { SubServer } from "../../Utils/Servers/SubServer";
import { encrypt } from "../../Utils/Servers/Encryption";
import { Blog, Users } from "../../index";
import { NowPlaying, WeeklyChart } from "../../Utils/Users/LastFMData";
import bodyParser from "body-parser";
import path from "path";
import _ from "lodash";
import { readFileSync } from "fs";
import Weather from "weather-js";

const app = express();
export const server = new SubServer({
  hostname: "dema.city",
  app: app,
  www: true,
  status: "MAINTENANCE",
});



app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.render('Dema/home', {
    data: data(req),
  });
});

app.get("/posts", (req, res) => {
  return res.render('Dema/Blog/Posts', {
    data: data(req),
    blog: Blog,
  });
});

app.get("/view/:id", async (req, res) => {
  return await Blog.database.fetch(req.params.id).then((post) => {
    if(!post?.data) return res.redirect('/posts');
    return res.render('Dema/Blog/View', {
      data: data(req),
      post: post?.data,
    })
  }).catch((err) => {
    return res.redirect('/posts');
  })
});

/**
 * Página para publicar um post
 */
app.get("/blog/publish", auth, (req, res) => {
  return res.render('Dema/Blog/Publish', {
    data: data(req),
  });
});


/**
 * Faz um post
 */
app.post("/blog/publish", auth, (req, res) => {
  return Blog.publish(req.body).then((post) => {
    return res.redirect(`/view/${post.id}?key=${req.query.key}`)
  });
});


/**
 * Página para editar um post
 */
app.get("/blog/edit/:id", auth, async (req, res) => {
  return await Blog.database.fetch(req.params.id).then((post) => {
    if(!post?.data) return res.redirect('/posts');
    return res.render('Dema/Blog/Publish', {
      data: data(req),
      post: post?.data,
    })
  }).catch((err) => {
    return res.redirect('/posts');
  })
});


/**
 * Edita o post
 */
app.post("/blog/edit/:id", auth, (req, res) => {
  return Blog.edit(req.params.id, req.body).then((post) => {
    return res.redirect(`/view/${post.id}?key=${req.query.key}`);
  });
});

/**
 * Ver o perfil de um usuário
 */
app.get("/user/:query", async (req, res) => {

  let list = await Users.database.list();
  let user: any;
  let auth = false;

  if(req.params.query !== 'random') {
    let raw = await Users.database.fetch({
      'data.username': req.params.query
    }) ?? await Users.database.fetch({
      'data.id': req.params.query,
    });
  
    if(!raw?.data) return res.redirect('/');
  
    user = raw.data;
    if(req.query.pass) {
      let encryptedPass = encrypt(req.query.pass as string);
      auth = user.pass === encryptedPass;
    }

  } else {
    let raw = _.sample(list);

    if(!raw?.data) return res.redirect('/');
    
    user = raw.data;
  }

  let weather;
  if(user?.location) {
    weather = await new Promise(async (resolve) => {
      await Weather.find({
        search: user.location, degreeType: 'C',
      }, (err: Error, data: any) => {
        if(err) return resolve(undefined);
        return resolve(data[0]?.current);
      });
    });
  }

  let weatherIcon = function(): string | undefined {
    let icon: {[key: string]: string} = {
      'Partly Sunny': '🌥️',
      'Sunny': '☀️',
      'Mostly Sunny': '⛅',
      'Clody': '☁️',
      'Rain': '🌧️',
      'Mostly Cloudy': '☁️',
      'Mostly Clear': '☀️',
      'Rain Showers': '🌧️',
      'Light Rain': '🌦️',
      'Clear': '☀️'
    };
    return icon[(weather as any)?.skytext as string] ?? '';
  }();

  return res.render('Dema/Users/View', {
    data: data(req),
    user: user,
    weather: weather,
    weatherIcon: weatherIcon,
    users: list?.map((data) => data.data),
    auth: auth,
    lastfm: {
      np: await NowPlaying(user.fmusername),
      wac: await WeeklyChart(user.fmusername),
    }
  });

});



app.get("*", (req, res) => {

  let links = JSON.parse(readFileSync(path.resolve('./Utils/Data/links.json')) as any) as Array<{path: string, redirect: string}>;
  let link = links.find((l) => l.path === req.path);
  if(link) {
    return res.redirect(link.redirect);
  }

});


function auth(req: Request, res: Response, next: NextFunction) {
  if(req.query.key !== process.env.KEY) return res.redirect('/posts');
  return next();
}

function data(req: Request) {
  return {
    req: req,
    cdn: req.hostname.includes('localhost') ? `http://cdn.localhost:${process.env.PORT}` : 'https://cdn.dema.city',
    electron: req.headers['user-agent']?.toLowerCase().includes('electron'),
    authenticated: (req.query.key === process.env.KEY),
  }
}