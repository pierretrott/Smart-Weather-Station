/*
To require a module in Node.js:
const config = require('/path/to/file');
*/

/*      EXPRESS.JS
Express est une infrastructure d'applications Web Node.js
minimaliste et flexible qui fournit un ensemble de fonctionnalités
robuste pour les applications Web et mobiles.

Pour créer une application Express
var express = require("express");
var app = express();
*/
const express = require('express')
const app = express();

/*      FILE SYSTEM
https://nodejs.org/api/fs.html
Allows you to work with the file system on your computer
*/
var fs = require('fs')

/*      HTTP
https://nodejs.org/api/http.html
Allows Node.js to transfer data over the Hyper Text Transfer Protocol
*/
var http = require('http');

/*      Path
https://nodejs.org/api/path.html
Provides a way of working with directories and file paths
*/
var path    = require("path");

/*      BodyParser
https://www.npmjs.com/package/body-parser
*/
var bodyParser = require('body-parser');

/*      Create an HTTP server
The HTTP module can create an HTTP server that listens
to server ports and gives a response back to the client.
Create a server object
- req: request from the client
- res: response from the server
*/
var server = http.createServer(function(req, res) {
    fs.readFile('/', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
      });
  });

var lastData = null; //null absence of any value
var allData = null;

/*      Socket.io
https://www.npmjs.com/package/socket.io
https://openclassrooms.com/fr/courses/1056721-des-applications-ultra-rapides-avec-node-js/1057825-socket-io-passez-au-temps-reel
Enables real-time bidirectional event-based communication.
Example: chat
*/
// Chargement de socket.io
var io = require('socket.io').listen(server);

//https://github.com/expressjs/body-parser/blob/master/README.md
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/*
io.sockets.on(eventName, function(msg){

});
*/
io.sockets.on('connection', function (socket) {
    socket.emit('updateData', lastData); // sending to the client
});

app.get('/', function (req, res) {
  // __dirname : directory name of the current module = path.dirname()
  res.sendFile(path.join(__dirname + '/www/index.html'));
});

app.get('/last', function (req, res) {
    res.send(allData);
});

app.post('/send', function (req, res) {
    var jsonData = null;

    if (req.headers['x-access-token'] != '3uWmd7S3MM7mlCRya5GHseczq9cqFRJNBuUOtZWKeoOEo5GkJ1itVSbQ38LQhKXXmpr6UAfI8VqGlhsi76la7KWFfpuYfzYLTXgV') {
        res.send('Error Authenticating')
        return console.log('Error Authenticating');
    }

    console.log('Receive data');

    if (!(req.headers['pressure'] && req.headers['temperature'] && req.headers['altitude'])) {
        res.send('Error')
        return console.log('Error');
    }

    fs.readFile('data.json', 'utf8', function (err, data) {
        if (err) {
            res.send('Error')
            return console.log(err);
        }

        lastData = {
            'pressure': req.headers['pressure'],
            'temperature': req.headers['temperature'],
            'altitude': req.headers['altitude'],
            'added_time': new Date().getTime()
        };

        try {
            jsonData = JSON.parse(data);
            jsonData.unshift(lastData);
        } catch(error) {
            jsonData =  [lastData];
        }

        fs.writeFile("data.json", JSON.stringify(jsonData), function (err) {
            if (err) {
                res.send('Error')
                return console.log(err);
            }

            io.sockets.emit('updateData', lastData);
            res.send('Saved')
            console.log("Data saved!");
        });
    });
})

function returnData() {
    fs.readFile('data.json', 'utf8', function (err, data) {
        if (err) {
            console.log(err);
            return false;
        }
        allData = JSON.parse(data);
        lastData = allData[0];
    });
}

app.listen(3000, function () {
    console.log('Server HTTP : OK');
    returnData();
})

server.listen(8080);
