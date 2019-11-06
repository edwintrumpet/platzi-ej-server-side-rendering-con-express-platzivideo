# Server side rendering

## Creación de servidor y archivos necesarios

Dentro del directorio `src` creamos el directorio `server` donde almacenaremos los archivos del servidor y el directorio `frontend` donde almacenaremos los archivos de react

instalamos **@babel/register** para hacer un bind en tiempo real de los presets de babel

```shell
npm i @babel/register
```

Creamos el archivo `server/index.js`

```javascript
require('@babel/register')({
    ignore: [/(node_modules)/],
    presets: ['@babel/preset-env', '@babel/preset-react']
})

require('./server.js')

```

Instalamos las dependencias **express** y **dotenv**

```shell
npm i express dotenv
```

Creamos el archivo `server/server.js`

```javascript
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const ENV = process.env.NODE_ENV;
const PORT = process.env.PORT || 3000;

const app = express();

app.get('*', (req, res) => {
  res.status(200).json({ holamundo: true });
});

app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log(`Server on port ${PORT}`);
});

```

Creamos el archivo `.env` en la raíz del proyecto

```shell
PORT=3001
NODE_ENV=development
```

Instalamos **nodemon** como dependencia de desarrollo

```shell
npm i nodemon -D
```

Agregamos el script **start:dev** en el `package.json`

```json
"scripts": {
    "start:dev": "nodemon src/server.index.js --exact babel-node"
}
```

## Configuración del linter

Instalamos **eslint-loader**

```shell
npm i eslint-loader -D
```

Agrego la siguiente regla al archivo `webpack.config.js`

```javascript
module: {
    rules: [
        {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            enforce: 'pre',
            use: {
                loader: 'eslint-loader',
            },
        },
    ],
},
```

Con esto no funcionará nuestra aplicación si el linter detecta algún error, por lo que debemos tener bastante precaución y corregir todos nuestros errores.

## Preparación de archivos CSS

Instalamos las dependencias de desarrollo

```shell
npm i babel-plugin-transform-class-properties react-hot-loader babel-plugin-transform-object-assign -D
```

En el archivo `.babelrc` agregamos la configuración del entorno

```json
"env": {
    "development": {
        "plugins": [
            "babel-plugin-transform-class-properties",
            "react-hot-loader/babel",
            "babel-plugin-tranform-object-assign"
        ]
    }
}
```

Instalamos **autoprefixer** y **postcss-loader** como dependencia de desarrollo

```shell
npm i autoprefixer postcss-loader -D
```

En el archivo `webpack.config.js` importamos *webpack* y *autoprefixer*

```javascript
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
```

En la regla para css agregamos el loader *postcss-loader*

```javascript
module: {
    rules: [
        {
            test: /\.(s*)css$/,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader,
                },
                'css-loader',
                'sass-loader',
                'postcss-loader',
            ],
        },
    ],
},

```

Instalamos el plugin para agregar el autoprefijo a la configuración de css

```javascript
plugins: [
    new webpack.LoaderOptionsPlugin({
        options: {
            postcss: [
                autoprefixer();
            ],
        },
    }),
],
```

Creamos el archivo `postcss.config.js` en la raiz del proyecto

```javascript
module.exports = {
    plugins: {
        'autoprefixer': {},
    },
};
```

## Vendor files

Agregamos el parámetro _optimizations_ en el archivo `webpack.config.js`

```javascript
optimization: {
    splitChunks: {
      chunks: 'async',
      name: true,
      cacheGroups: {
        vendors: {
          name: 'vendors',
          chunks: 'all',
          reuseExistingChunk: true,
          priority: 1,
          filename: 'assets/vendor.js',
          enforce: true,
          test(module, chunks) {
            const name = module.nameForCondition && module.nameForCondition();
            return chunks.some((chunks) => chunks.name !== 'vendor' && /[\\/]node_modules[\\/]/.test(name));
          },
        },
      },
    },
},
```

Agregamos el plugin

```javascript
plugins: [
    new webpack.HotModuleReplacementPlugin(),
],
```

## Integración de Webpack con Express

Instalamos las dependencias

```shell
npm i webpack-dev-middleware webpack-hot-middleware
```

Importamos la webpack en el archivo `server.js`

```javascript
import webpack from 'webpack';
```

Después de declarar la aplicación de express y antes de las rutas usamos el entorno obtenido desde ENV para configurar webpack

```javascript
const app = express();

if (ENV === 'development') {
  console.log('Loading dev config');
  const webpackConfig = require('../../webpack.config');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const compiler = webpack(webpackConfig);
  const serverConfig = {
    contentBase: `http://localhost:${PORT}`,
    port: PORT,
    publicPath: webpackConfig.output.publicPath,
    hot: true,
    historyApiFallback: true,
    stats: { colors: true },
  };
  app.use(webpackDevMiddleware(compiler, serverConfig));
  app.use(webpackHotMiddleware(compiler));
}

app.get('*', (req, res) => {
  res.status(200).json({ holamundo: true });
});
```

## Servir React con Express

En el archivo `webpack.config.js` hacemos algunas modificaciones

```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');

module.exports = {
  entry: './src/frontend/index.js',
  mode: 'development',
  output: {
    path: '/',
    filename: 'assets/app.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  optimization: {
    splitChunks: {
      chunks: 'async',
      name: true,
      cacheGroups: {
        vendors: {
          name: 'vendors',
          chunks: 'all',
          reuseExistingChunk: true,
          priority: 1,
          filename: 'assets/vendor.js',
          enforce: true,
          test(module, chunks) {
            const name = module.nameForCondition && module.nameForCondition();
            return chunks.some((chunks) => chunks.name !== 'vendor' && /[\\/]node_modules[\\/]/.test(name));
          },
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        enforce: 'pre',
        use: {
          loader: 'eslint-loader',
        },
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(s*)css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
          'sass-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|gif|jpg)$/,
        use: [
          {
            'loader': 'file-loader',
            options: {
              name: 'assets/[hash].[ext]',
            },
          },
        ],
      },
    ],
  },
  devServer: {
    historyApiFallback: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [
          autoprefixer(),
        ],
      },
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/app.css',
    }),
  ],
};

```

En la ruta de Express enviamos un string con el html a renderizar

```javascript
app.get('*', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Platzivideo</title>
      <link rel="stylesheet" href="assets/app.css" type="text/css"></link>
  </head>
  <body>
      <noscript>This application requires javascript to work!</noscript>
      <div id="root"></div>
      <script src="assets/app.js" type="text/javascript"></script>
      <script src="assets/vendor.js" type="text/javascript"></script>
  </body>
  </html>
  `);
});
```

## Agregar variables de Sass desde Webpack

En el archivo `webpack.config.js` modificamos la regla que tenemos para los estilos.

```javascript
module: {
  rules: [
    {
      test: /\.(s*)css$/,
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
        },
        'css-loader',
        'postcss-loader',
        {
          loader: 'sass-loader',
          options: {
            prependData: `
            @import "${path.resolve(__dirname, 'src/frontend/assets/styles/Vars.scss')}";
            @import "${path.resolve(__dirname, 'src/frontend/assets/styles/Media.scss')}";
            @import "${path.resolve(__dirname, 'src/frontend/assets/styles/Base.scss')}";
            `,
          },
        },
      ],
    },
  ]
}
```

Y removemos desde los archivos las importaciones directas

## Aplicando history y creando rutas para el servidor

Instalamos dependencias

```shell
npm i history react-router
```

En el archivo `frontend/index.js` importamos las dependencias y encapsulamos nuestra aplicación

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';
import { Router } from 'react-router';
import { createBrowserHistory } from 'history';
import reducer from './reducers';
import App from './routes/App';

const initialState = {...
};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, initialState, composeEnhancers());
const history = createBrowserHistory();

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root'),
);

```

Creamos el archivo `frontend/routes/serverRoutes.js` donde ponemos las rutas del servidor

```javascript
import Home from '../containers/Home';
import Login from '../containers/Login';
import Register from '../containers/Register';
import NotFound from '../containers/NotFound';

const serverRoutes = [
  {
    path: '/',
    component: Home,
    exact: true,
  },
  {
    path: '/login',
    component: Login,
    exact: true,
  },
  {
    path: '/register',
    component: Register,
    exact: true,
  },
  {
    name: 'NotFound',
    component: NotFound,
  },
];

export default serverRoutes;

```
## Server side rendering

Instalamos **react-router-config**

```shell
npm i react-router-config
```

Creamos en archivo `server/routes/main.js`

```javascript
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { StaticRouter } from 'react-router';
import { renderRoutes } from 'react-router-config';
import Routes from '../../frontend/routes/serverRoutes';
import Layout from '../../frontend/components/Layout';
import reducer from '../../frontend/reducers';
import initialState from '../../frontend/initialState';
import render from '../render';

const main = (req, res, next) => {
  try {
    const store = createStore(reducer, initialState);
    const html = renderToString(
      <Provider store={store}>
        <StaticRouter location={req.url} context={{}}>
          <Layout>
            {renderRoutes(Routes)}
          </Layout>
        </StaticRouter>
      </Provider>,
    );
    res.send(render(html));
  } catch (err) {
    next(err);
  }
};

export default main;

```

Creamos el archivo `server/render/index.js`

```javascript
const render = (html) => {
  return (`
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Platzivideo</title>
      <link rel="stylesheet" href="assets/app.css" type="text/css"></link>
  </head>
  <body>
      <noscript>This application requires javascript to work!</noscript>
      <div id="root">${html}</div>
      <script src="assets/app.js" type="text/javascript"></script>
      <script src="assets/vendor.js" type="text/javascript"></script>
  </body>
  </html>
  `);
};

export default render;

```

Y en el archivo `server.js` importamos el archivo `server/routes/main.js` y lo usamos en la ruta en cambio del template que teníamos.

```javascript
import main from './routes/main';
```

```javascript
app.get('*', main);
```

Instalamos la dependencia **ignore-styles**

```shell
npm i ignore-styles
```

La importamos en el archivo `server/index.js`

```javascript
require('ignore-styles');
```
