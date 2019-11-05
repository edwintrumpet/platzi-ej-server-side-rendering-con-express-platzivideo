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
