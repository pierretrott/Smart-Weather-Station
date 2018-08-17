var fs = require('fs')
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

//Ouverture data.json
fs.readFile('data.json', 'utf8', function (err, data) {
  //Traitement des erreurs
  if (err) {
      //res.send('Error')
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
          //res.send('Error')
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

      //Sending hour per hour data to client for visualisation
      /*io.sockets.emit('hourPerHour', hourDict);
      res.send('Hour per hour sent')
      console.log("Hour per hour sent");*/
      //Writing old data to archive.json
      fs.writeFile("archive.json", JSON.stringify(jsonArchive), function (err) {
          if (err) {
              //res.send('Error')
              return console.log(err);
          }
      });

      //Writing today's data to data.json
      fs.writeFile("data.json", JSON.stringify(todayArray), function (err) {
          if (err) {
              //res.send('Error')
              return console.log(err);
          }
        });
  });
});
