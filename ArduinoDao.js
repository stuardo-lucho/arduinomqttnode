const mysql = require('mysql2');

let conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'arduinos'
});

exports.connectMysql = function connectMysql(){
    conn.connect(function(err){
        if(err) throw err;
        console.log("Conexión exitosa a base de datos");
    });
}

exports.actualizarEstadoLed = function actualizarEstadoLed(estado, arduinoId) {
    let query = "UPDATE estado SET led = ? WHERE arduino_id = ?";
    let params = [estado,arduinoId]; //si hubieran mas arduinos, aca se cambiaría en función del login
    conn.query(query,params,function (err,rest){
        if (err) throw err;
        console.log("actualizacion exitosa");
    })
}

exports.actualizarValorUltrasonido = function actualizarValorUltrasonido(valor, arduinoId) {
    let query = "UPDATE estado SET ultrasonido = ? WHERE arduino_id = ?";
    let params = [valor,arduinoId];
    conn.query(query,params,function (err,rest){
        if (err) throw err;
        console.log("actualizacion exitosa");
    })
}

exports.consultarEstadoActual = function consultarEstadoActual(arduinoId,callback){
    let query = "SELECT * FROM estado WHERE arduino_id = ?"
    let params = [arduinoId];
    conn.query(query,params,function (err,result){
        let data = {
            ultrasonido : result[0].ultrasonido,
            led : result[0].led
        };
        return callback(data);
    });

}