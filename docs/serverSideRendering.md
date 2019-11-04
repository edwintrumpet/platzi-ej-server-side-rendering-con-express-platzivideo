# Server side rendering

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

