var fs = require('fs')
fs.readFile('Identity.json', 'utf8', function (err, data) {
    if (err) {
        res.send('Error')
        return console.log(err);
    }
    console.log(data);
  })
