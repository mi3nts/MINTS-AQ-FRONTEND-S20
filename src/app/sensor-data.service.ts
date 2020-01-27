import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

//THIS SERVICE GETS SENSOR DATA FROM THE DATABASE AND RETURNS IT AN ANGULAR COMPONENT
export class SensorDataService {
  latestData: any

  constructor(private http: HttpClient) { }

  //NO LONGER IS BEING USED
  //HOWEVER IT IS USED FOR CONVERTING CSV TO JSON
  csvJSON(csv):string{

    var lines=csv.split("\n");
  
    var result = [];
  
    var headers=lines[0].split(",");
  
    for(var i=1;i<lines.length;i++){
  
        var obj = {};
        var currentline=lines[i].split(",");
  
        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }
  
        result.push(obj);
  
    }
    //return result; //JavaScript object
    return JSON.stringify(result); //JSON
  }

  getSensorIDs(){
    let URL: string = "http://localhost:3000/sensors";
    return this.http.get(URL);
  }

  getRealTimeSensorData(sensorID:string){
    let URL: string = "http://localhost:3000/latestData/?sensor=" + sensorID;
    return this.http.get(URL);
  }

  getHistoricalSensorData(sensorID:string){
    let URL: string = "http://localhost:3000/aggregationData/?sensor=" + sensorID;
    return this.http.get(URL);
  }

  // getHistoricalSensorData(url):string{
  //   let data;
  //   let xhr = new XMLHttpRequest();
  //    xhr.onreadystatechange = function() {
  //      if (this.readyState === 4 && this.status === 200) {
  //         data = this.responseText;}
  //    }
  //   xhr.open("GET", url, false);
  //   // xhr.setRequestHeader("Accept", '');
  //   xhr.send();
  //   return data; 
  // }
  
  getWindData(){
    let url: string = "http://mintsdata.utdallas.edu:3000/data/latest";
    return this.http.get(url);
  }
}
