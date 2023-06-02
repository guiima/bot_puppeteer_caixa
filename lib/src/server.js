const express = require('express');
const routes = require('./routes');
const app = express();

app.use(express.json());
app.use(routes);


const server = app.listen(3000, () => {
    console.log('listening on port 3000');
});

server.timeout = 300000; // 5 minutos em milissegundos