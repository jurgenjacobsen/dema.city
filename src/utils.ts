import colors from 'colors';
import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import marked from 'marked';

dotenv.config();

export const mongoInfo = {
  mongoURL: process.env.MONGO as string,
  mongoPass: process.env.MONGO_PASS as string,
  mongoUser: process.env.MONGO_USER as string,
};

export function print(value: string | number) {
  let d = new Date();
  let m = d.getMonth() + 1;
  let dd = d.getDate();
  let h = d.getHours();
  let min = d.getMinutes();
  return console.log(`${colors.gray(`[${dd > 9 ? dd : `0${dd}`}/${m > 9 ? m : `0${m}`}/${d.getFullYear()}@${h > 9 ? h : `0${h}`}:${min > 9 ? min : `0${min}`}]`)} ${value}`);
}

export const vhost = (hostname: string, app: any) => (req: Request, res: Response, next: NextFunction) => {
  const host = req.hostname;
  if (host === hostname) {
    return app(req, res, next);
  } else {
    next();
  }
};

export function token(length: number) {
  var a = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
  var b = [];
  for (var i = 0; i < length; i++) {
    var j = (Math.random() * (a.length - 1)).toFixed(0);
    b[i] = a[j as any];
  }
  return b.join('');
}

export function markdownTemplate(title: string, path: string, stringFile: string): string {
  return `
  <html>
    <head>
        <title>${title}</title>
        <meta name="theme-color" content="#1c1c1c">
        <meta property=”og:type” content=”website”/>
        <meta property="og:title" content="${title}">
        <meta property="og:url" content="https://dema.city/${path}">
        <meta property="og:description" content="Welcome to Dema City, a multiporpose plataform.">
        <meta property="og:image" content="/images/DemaLogo.png">

        <link rel="shortcut icon" href="/assets/images/favicon.ico"/>
        <link rel="icon" href="/assets/images/favicon.ico" type="image/x-icon">
        <style>
          @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900;&display=swap");

          * {
            font-family: 'Poppins', sans-serif;
          }

          body {
            background: #1c1c1c;
            color: #FFF;
            margin: 0;
            padding: 0;
            font-family: 'Poppins', sans-serif;
          }

          h1:first-child {
            text-align: center;
          }

          p:first-child {
            text-align: center;
          }

          .container {
            width: 100%;
            padding-right: 15px;
            padding-left: 15px;
            padding-top: 30px;
            margin-right: auto;
            margin-left: auto;
          }

          @media (min-width: 576px) {
            .container {
                max-width: 540px
            }
          }
          
          @media (min-width: 768px) {
              .container {
                  max-width: 720px;
              }
          }
          
          @media (min-width: 992px) {
              .container {
                  max-width: 960px;
              }
          }
          
          @media (min-width: 1200px) {
              .container {
                  max-width: 1140px;
              }
          }

					a {
						text-decoration: none;
						color: #8855ff;
					}
					h1, h2, h3 {
						font-weight: 100;
					}
					hr {
						border: 1px solid #2C2F33;
					}
				</style>
    </head>
    <body>
      <div class="container">
        <div class="container">
          ${marked(stringFile)}
        </div>
      </div>
    </body>
  </html>
  `;
}
