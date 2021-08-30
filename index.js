//imports
const app = require('express')();
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);
const arduinoDao = require("./ArduinoDao");

arduinoDao.connectMysql();

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

    arduinoDao.consultarEstadoActual("arduino_1",function (data){
        io.emit('nuevoEstadoLed', data.led);
        io.emit('ultrasonido', data.ultrasonido);
    });

    socket.on("estadoLed", function (estado) {
        arduinoDao.actualizarEstadoLed(estado,"arduino_1");
        io.emit('nuevoEstadoLed', estado);
        client.publish('estadoled', estado);
    });
});


//mqtt client
const mqtt = require('mqtt');

//servicio libre por 6 horas: host: 'walnutwizard685.cloud.shiftr.io'
const options = {
    host: 'ec2-54-165-197-111.compute-1.amazonaws.com',
    port: 1883,
    username: 'walnutwizard685',
    password: 'BFtQqKhs4CIftf3F'
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
        let distanciaUltrasonido = message.toString();
        arduinoDao.actualizarValorUltrasonido(distanciaUltrasonido,"arduino_1");
        io.sockets.emit('ultrasonido', distanciaUltrasonido);
    }
});

client.subscribe('ultrasonido');
