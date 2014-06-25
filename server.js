var express = require("express"),
    mysql = require("mysql"),
    fs = require("fs"),
    io = require("socket.io"),
    app = express(),
    http = require("http"),
    server = http.createServer(app);
    
//get data from config.json
var config = JSON.parse(fs.readFileSync(__dirname + "/config.json")),
    host = config.host,
    port = config.port
    DB_HOST = config.DB_HOST,
    DB_USER = config.DB_USER,
    DB_PASS = config.DB_PASS,
    DB_NAME = config.DB_NAME;
    
//declar connection mysql
var connection = mysql.createConnection(
    {
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME
    }
);

connection.connect();

//create listen url
server.listen(port, host, function(){
    console.log("Listen on " + host + ":" + port);
});

var client = io.listen(server).sockets;

client.on("connection", function(socket){
    connection.query("SELECT * FROM users", function(err, row, fields){
        if (err) throw err;
        socket.emit("list", row);
    });
    
    socket.on("insert", function(data){
        connection.query("INSERT INTO users VALUES('','" + data + "', '')", function(err, row, fields){
            connection.query("SELECT * FROM users", function(err, row, fields){
                if (err) throw err;
                client.emit("list", row);
            });
        });
    });
});