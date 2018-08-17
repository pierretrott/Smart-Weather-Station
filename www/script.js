var socket = io.connect('http://localhost:8080');

socket.on('updateData', function (data) {
    var temperature = document.getElementById('temperature');
    var pressure = document.getElementById('pressure');
    var altitude = document.getElementById('altitude');
    var added_time = document.getElementById('added_time');

    temperature.innerHTML = data.temperature;
    pressure.innerHTML = data.pressure;
    altitude.innerHTML = data.altitude;

    console.log(data);

    var date = new Date(data.added_time);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    added_time.innerHTML = date.getDate() + ' ' + getMonth(date.getMonth()) + ' ' + date.getFullYear() + ' à ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
});

function getMonth(number) {
    var months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months[number];
}
