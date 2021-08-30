//imports
const app = require('express')();
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);

//web Server
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

httpServer.listen(3100, function () {
    console.log("Servidor corriendo en el puerto 3100");
});

//Web Socket server
io.on('connection',  (socket) => {
    console.log("Usuario Conectado");

    socket.on("estadoLed", function (estado) {
        io.emit('nuevoEstadoLed', estado);
        client.publish('estadoled', estado);
    });
});


//mqtt client
const mqtt = require('mqtt');

const options = {
    host: 'walnutwizard685.cloud.shiftr.io',
    port: 1883,
    username: 'walnutwizard685',
    password: 'BFtQqKhs4CIftf3F',
    clientId: 'nodejs'
}

let client = mqtt.connect(options);

client.on('connect', function () {
    console.log('Connected');
});

client.on('error', function (error) {
    console.log(error);
});

client.on('message', function (topic, message) {
    console.log('Received message:', topic, message.toString());
    if(topic == 'ultrasonido'){
        io.sockets.emit('ultrasonido', message.toString());
    }
});

client.subscribe('ultrasonido');
