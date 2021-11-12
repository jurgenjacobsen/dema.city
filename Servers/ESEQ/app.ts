import { SubServer } from "../../Utils/Servers/SubServer";
import express, { Request } from "express";
import path from 'path';
import { readFileSync } from "fs";

const app = express();
export const server = new SubServer({
  hostname: "eseq.dema.city",
  app: app,
  www: false,
  status: "ONLINE",
});

let DATA = () => {

  let subjects = JSON.parse(readFileSync(path.resolve('./Utils/Data/eseq-subjects.json')) as any) as Array<{
    id: string,
    name: string,
    date: Date,
  }>;

  let students = JSON.parse(readFileSync(path.resolve('./Utils/Data/eseq-students.json')) as any) as Array<{
    name: string,
    id: string,
  }>;

  let projects = JSON.parse(readFileSync(path.resolve('./Utils/Data/eseq-projects.json')) as any) as Array<{
    title: string,
    id: string,
    students: string[],
    subject: string,
  }>;

  return {
    subjects: subjects,
    students: students,
    projects: projects,
  }
};

app.get("/", (req, res) => {

  return res.render("ESEQ/home", {
    data: data(req),
    DATA: DATA(),
  });

});

app.get("/subject/:id", (req, res) => {
  let subject = DATA().subjects.find((subject) => subject.id === req.params.id);
  if(!subject) return res.redirect("/");

  return res.render(`ESEQ/subject`, { 
    subject: subject,
    data: data(req),
    DATA: DATA(),
  });
});

app.get("/project/:id", (req, res) => {
  let project = DATA().projects.find((project) => project.id === req.params.id);
  if(!project) return res.redirect("/");

  return res.render(`ESEQ/project`, { 
    project: project,
    data: data(req),
    DATA: DATA(),
  });
})

function data(req: Request) {
  return {
    req: req,
    cdn: req.hostname.includes('localhost') ? `http://cdn.localhost:${process.env.PORT}` : 'https://cdn.dema.city',
    electron: req.headers['user-agent']?.toLowerCase().includes('electron'),
    authenticated: (req.query.key === process.env.KEY),
  }
}