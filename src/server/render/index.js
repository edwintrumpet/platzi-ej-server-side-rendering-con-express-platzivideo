import dotenv from 'dotenv';
import getManifest from '../getManifest';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const files = getManifest();

const render = (html, preloadedState) => {
  return (`
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Platzivideo</title>
      ${isProd ?
      `<link rel='stylesheet' href="${files['main.css']}" type='text/css' />` :
      '<link rel=\'stylesheet\' href=\'assets/app.css\' type=\'text/css\' />'
    }
  </head>
  <body>
      <div id="root">${html}</div>
      <script>
          // WARNING: See the following for security issues around embedding JSON in HTML:
          // http://redux.js.org/recipes/ServerRendering.html#security-considerations
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(
      /</g,
      '\\u003c',
    )}
        </script>
        ${isProd ?
      `<script src="${files['main.js']}" type="text/javascript"></script>
          <script src="${files['vendors.js']}" type="text/javascript"></script>` :
      `<script src="assets/app.js" type="text/javascript"></script>
          <script src="assets/vendor.js" type="text/javascript"></script>`
    }
  </body>
  </html>
  `);
};

export default render;
