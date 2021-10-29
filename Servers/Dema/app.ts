import express, { Request } from "express";

import { SubServer } from "../../Utils/Servers/SubServer";
import { Blog } from "../../index";
import bodyParser from "body-parser";

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
app.get("/blog/publish", (req, res) => {
  if(req.query.key !== process.env.KEY) return res.redirect('/posts');
  return res.render('Dema/Blog/Publish', {
    data: data(req),
  });
});


/**
 * Faz um post
 */
app.post("/blog/publish", (req, res) => {
  if(req.query.key !== process.env.KEY) return res.redirect('/posts');
  return Blog.publish(req.body).then((post) => {
    return res.redirect(`/view/${post.id}`)
  });
});


/**
 * Página para editar um post
 */
 app.get("/blog/edit/:id", (req, res) => {

});


/**
 * Edita o post
 */
app.post("/blog/edit/:id", (req, res) => {
  return Blog.edit()
});

function data(req: Request) {
  return {
    req: req,
    cdn: req.hostname.includes('localhost') ? `http://cdn.localhost:${process.env.PORT}` : 'https://cdn.dema.city',
    electron: req.headers.origin?.toLowerCase().includes('electron'),
  }
}