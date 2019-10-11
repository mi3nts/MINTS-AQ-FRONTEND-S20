import { Component, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SensorDataService } from '../sensor-data.service';
import { ChartDataSets, ChartOptions, ChartData } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  constructor(private sensorDataService: SensorDataService) { }
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{}],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
        },
        {
          id: 'y-axis-1',
          position: 'right',
          gridLines: {
            color: 'rgba(255,0,0,0.3)',
          },
          ticks: {
            fontColor: 'red',
          }
        }
      ]
    },
    annotation: {
      annotations: [
        {
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: 'March',
          borderColor: 'orange',
          borderWidth: 2,
          label: {
            enabled: true,
            fontColor: 'orange',
            content: 'LineAnno'
          }
        },
      ],
    },
  };
  public lineChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // red
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'red',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';

  HistoricalSensorData: any = [];
  ChartJSObject;

  LineChartConfig = {
    legend: {
      display: false
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [
        {
          display: false,
        },
      ],
      yAxes: [
        {
          display: false,
        },
      ],
    }
  };

  PM2_5chartData = [
    { data: [], label: '30-Aug-2019' }
  ];

  PM1chartData = [
    { data: [], label: '30-Aug-2019' }
  ];

  chartLabels = ["00:00:00", " 03:00:00", 
  "06:00:00", "09:00:00", 
  "12:00:00", "15:00:00", 
  "18:00:00", "23:59:59"];



  ngOnInit() {
    let url3 = "https://cors-anywhere.herokuapp.com/http://mintsdata.utdallas.edu:4200/api/001e06305a12/2019/08/30/MINTS_001e06305a12_calibrated_UTC_2019_08_30.csv";
    this.HistoricalSensorData = JSON.parse(this.sensorDataService.csvJSON(this.sensorDataService.getHistoricalSensorData(url3)));
    //console.log(this.graphData);
    this.ParseHistoricalData();
  }

  ParseHistoricalData(){

    let PM2_5data: Number[] = [];
    let PM1data: Number[] = [];
    for(let i=0; i < this.HistoricalSensorData.length; i++ )
    {
      PM2_5data.push(parseFloat(this.HistoricalSensorData[i]["PM2_5"]));
      PM1data.push(parseFloat(this.HistoricalSensorData[i]["PM1"]));
    }
    this.InitializeGraph(PM2_5data, PM1data);
  }

  InitializeGraph(PM2_5data, PM1data ){
    this.PM2_5chartData[0].data = PM2_5data;
    this.PM1chartData[0].data = PM1data;
  }
  
  // createChart(){
  //   var chart = new Chart('chart', {
  //     type: 'horizontalBar',
  //     data: {
  //       labels: ['A', 'B', 'C'],
  //       datasets: [
  //         {
  //           data: [10, 20, 30]
  //         }
  //       ]
  //     }
  //   });
  // }

}
