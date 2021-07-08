//  npm install mqtt --save
/*
  Este programa se conecta mediante ws y mqtt al brocker 
  durante unos segundos y luego se decoencta 
*/

const options = {
    connecTimeout: 4000,
    clientId:'from node',
    username: 'emqx', // solo necesario cuando hacemos ACL con MySQL
    password: '1234', 
    keepalive:60,
    clean:true
};


function myFunc(arg) {
    console.log(`Log: ${arg}`);
    client.end();
  }
  
  

const { time } = require('console');
var mqtt = require('mqtt')
var host = "ws://localhost:8093/mqtt" 
var host_mosquito = 'mqtt://test.mosquitto.org'

var client  = mqtt.connect(host,options)

client.on('connect', function () {
  
  client.subscribe('cerd',{qos:0}, function (err) { // qos calidad del servicio 
    if (!err) {
      client.publish('cerd', 'Message mqtt from node.js')
    }
  })
})



client.on('message', function (topic, message) {
  // message is Buffer
  console.log("topico",topic);
  console.log(message.toString())
  setTimeout(myFunc, 15000, 'Terminarndo conexion con brocker',client);
  
})