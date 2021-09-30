import { SubServer } from "../Structures/Hosts";
import { readFileSync } from "fs";
import { DiscordAuthentication, isAuthenticated, LastFmAuthentication, TwitterAuthenication } from "../Structures/Auth";

import express from "express";
import path from "path";
import passport from "passport";
import session from "express-session";
import flash from "connect-flash";
import { LiveUsersElectron } from "../MainServer";

const app = express();

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj as Express.User));

passport.use(TwitterAuthenication);
passport.use(DiscordAuthentication);

app.use(session({ secret: process.env.SESSION_SECRET as string, resave: false, saveUninitialized: false }));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.get("/login/twitter", passport.authenticate("twitter"));
app.get("/login/discord", passport.authenticate("discord"));

app.get("/login/lastfm", (req, res) => {
  return res.redirect(`http://www.last.fm/api/auth/?api_key=${process.env.LAST_FM_KEY}&cb=https://dema.city/auth/lastfm`);
});

app.get("/auth/lastfm", LastFmAuthentication("/"));

app.get(
  "/auth/twitter",
  passport.authenticate("twitter", {
    successRedirect: "/me",
    failureRedirect: "/login",
  })
);

app.use(
  "/auth/discord",
  passport.authenticate("discord", {
    successRedirect: "/me",
    failureRedirect: "/login",
  })
);

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/login", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/me");
  res.render("main/Sign", {
    user: req.user,
    err: req.flash(),
    electron: LiveUsersElectron.get(req.ip),
  });
});

app.get("/signup", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/me");
  res.render("main/Sign", {
    user: req.user,
    err: req.flash(),
    electron: LiveUsersElectron.get(req.ip),
  });
});

app.get("/", (req, res) => {
  res.render("main/Home", {
    user: req.user,
    electron: LiveUsersElectron.get(req.ip),
  });
});

app.get("/me", isAuthenticated, async (req, res) => {
  res.render("main/Me", {
    user: req.user,
    electron: LiveUsersElectron.get(req.ip),
  });
});

app.get("*", (req, res) => {
  const raw_links = readFileSync(path.resolve(__dirname, "../../data/") + "/links.json").toString();
  const links = JSON.parse(raw_links);

  const redir = links[req.path];
  if (redir) return res.redirect(redir);

  const raw_trees = readFileSync(path.resolve(__dirname, "../../data/") + "/trees.json").toString();
  const trees = JSON.parse(raw_trees);

  const tree = trees[req.path];
  if (tree)
    return res.render("main/Tree", {
      tree: tree,
        user: req.user,
    });

  return res.redirect("/404");
});

export const server = new SubServer({
  hostname: "dema.city",
  server: app,
  www: true,
  status: "CONSTRUCTION",
});
