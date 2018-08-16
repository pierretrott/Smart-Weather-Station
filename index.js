const express = require('express')
const app = express();

var fs = require('fs')
var http = require('http');
var path    = require("path");
var bodyParser = require('body-parser');

var server = http.createServer(function(req, res) {
    fs.readFile('/', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
      });
  });

var lastData = null;
var allData = null;

var io = require('socket.io').listen(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//SENDING UPDATEDATA TO THE CLIENT
io.sockets.on('connection', function (socket) {
    socket.emit('updateData', lastData);
});

//SENDING HTML PAGE TO THE CLIENT
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/www/index.html'));
});

//SENDING ALLDATA TO THE CLIENT
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
