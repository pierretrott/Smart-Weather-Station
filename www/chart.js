var socket = io.connect('http://localhost:8080');

socket.on('hourPerHour', function (data) {
  //console.log(data);
  var array = data;
  var hourData = [];

  for (var i = 0; i < 24; i++){
    temps = data[i];
    hourData.push(temps);
  }
  //console.log(hourData);
  var myChart = document.getElementById('myChart').getContext('2d');
  var label = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10'
  , '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

  Chart.defaults.global.defaultFontFamily = 'Lato';
  Chart.defaults.global.defaultFontSize = 14;
  Chart.defaults.global.defaultFontStyle = 200;
  Chart.defaults.global.defaultFontColor = '#fff';
  Chart.defaults.global.responsive = true;
  //Chart.defaults.scale.gridLines.display = false;

  /*-----DISPLAY GRAPH-----*/
  var massPopChart = new Chart(myChart, {
    type:'line', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
    data:{
      labels: label,
      datasets:[{
        label:'Temperature',
        data:hourData,
        borderWidth:0.5,
        borderColor:'#fff',
        hoverBorderWidth:3,
        hoverBorderColor:'#fff'
      }]
    },
    options:{
      maintainAspectRatio: false,
      title:{
        display:true,
        text:'Evolution',
        fontSize:26,
        fontStyle:200,
        fontColor: '#fff'
      },
      legend:{
        display:false,
        position:'right',
        labels:{
          fontColor:'#000'
        }
      },
      layout:{
        padding:{
          left:0,
          right:0,
          bottom:0,
          top:0
        }
      },
      tooltips:{
        enabled:true
      },
      scales:{
        yAxes: [{
          ticks: {
              suggestedMin: 0,
              suggestedMax: 25,
              beginAtZero:true,
              fontColor: '#fff',
              stepSize: 5
          }
        }],
        xAxes: [{
          ticks: {
              beginAtZero:true,
              fontColor: '#fff'
          }
        }]
      },
      elements: {
        point: {
          radius: 5
        },
      }
    }
  });
});
