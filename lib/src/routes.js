const express = require('express');
const { getImoveis, getDatesOfSale } = require('./main');

const routes = express.Router();


routes.post('/imoveis', async (req, res) => {
    const { desconto } = req.body;
    const result = await getImoveis(desconto);
    res.send(result);
});

routes.get('/datas', async (req, res) => {
    const result = await getDatesOfSale();
    res.send(result);
});

module.exports = routes;