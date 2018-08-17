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

function date_Formatter(unix){
  var date = new Date(unix);
  var array = {}
  array.year = date.getFullYear().toString();
  array.month = (date.getMonth()+1).toString();
  array.day = date.getDate().toString();
  array.hours = date.getHours();
  array.minutes = date.getMinutes();
  array.seconds = date.getSeconds();
  return array;
}

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
  //Ouverture data.json
  fs.readFile('data.json', 'utf8', function (err, data) {
    //Traitement des erreurs
    if (err) {
        res.send('Error')
        return console.log(err);
    }

    //Traitement fichier vide
    try {
      jsonData = JSON.parse(data);
    } catch (error){
      jsonData = [];
    }

    //Récupération de la date d'aujourd'hui
    today = new Date().getTime();
    date = date_Formatter(today);
    todayFormat = date.year + '-' + date.month + '-' + date.day;
    var todayArray = [];

    //Ouverture archive.json
    fs.readFile('archive.json', 'utf8', function (err, data) {
        //Traitement des erreurs
        if (err) {
            res.send('Error')
            return console.log(err);
        }

        //Traitement fichier vide
        try {
          jsonArchive = JSON.parse(data);
        } catch (error){
          jsonArchive = {};
        }

        //Traitement des données
        for (key in jsonData){
          //transformation de la date en format compréhensible
          date = date_Formatter(jsonData[key].added_time);
          dateFormat = date.year + '-' + date.month + '-' + date.day;

          if (dateFormat != todayFormat){//Données pas d'aujourd'hui
            temp = jsonData[key].temperature;

            if (jsonArchive[dateFormat] == undefined){//La date n'est pas présente dans l'archive
              jsonArchive[dateFormat] = {"min":temp,"max":temp};

            } else {//la date est présente dans l'archive
              if (temp < jsonArchive[dateFormat].min){
                jsonArchive[dateFormat].min = temp

              } else if (temp > jsonArchive[dateFormat].max){
                jsonArchive[dateFormat].max = temp
              }
            }
          } else {//Données d'aujourd'hui
            todayArray.push(jsonData[key]);
          }
        }

        //Creating a dictionnary of the hour per hour data
        var hourDict = {}
        for (key in todayArray){
          hour = date_Formatter(todayArray[key].added_time).hours;
          hourDict[hour] = todayArray[key].temperature;
        }

        //Writing old data to archive.json
        fs.writeFile("archive.json", JSON.stringify(jsonArchive), function (err) {
            if (err) {
                res.send('Error')
                return console.log(err);
            }
        });

        //Writing today's data to data.json
        fs.writeFile("data.json", JSON.stringify(todayArray), function (err) {
            if (err) {
                res.send('Error')
                return console.log(err);
            }
        });

        //Sending data to client
        io.sockets.emit('hourPerHour', hourDict);
        //res.send('Hour per hour sent')
        console.log("Hour per hour sent");

        io.sockets.emit('jsonArchive', jsonArchive);
        //res.send('All data sent: hour per hour and archive')
        console.log("Archive sent");
    });
  });

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
        try {
          allData = JSON.parse(data);
          lastData = allData[0];
        } catch (error){
          jsonData = [];
        }

    });
}

app.listen(3000, function () {
    console.log('Server HTTP : OK');
    returnData();
})

server.listen(8080);
