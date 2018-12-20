const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const W3CWebSocket = require('websocket').w3cwebsocket;

const client = new W3CWebSocket('ws://localhost:8080');
let data = [];

client.onerror = function() {
    console.log('Connection Error');
};

client.onopen = function() {
    console.log('WebSocket Client Connected');
};

client.onclose = function() {
    console.log('echo-protocol Client Closed');
};

client.onmessage = function(e) {
    data = e.data;
};

app.use(bodyParser.json());

app.get('/info', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data));
});

app.post('/mode', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    console.log(req.body);

    client.send(JSON.stringify(req.body));
    res.send("OK");
});

app.listen(3001, () =>
    console.log('Express server is running on localhost:3001')
);

