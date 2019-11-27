import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SensorDataService {
  latestData: any

  constructor(private http: HttpClient) { }

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
    let URL: string = "http://imd.utdallas.edu:3002/sensors";
    return this.http.get(URL);
   }
   getSensorData(sensorID:string){
    let URL: string = "http://imd.utdallas.edu:3002/latestData/?sensor=" + sensorID;
    return this.http.get(URL);
  }

  getHistoricalSensorData(url):string{
    let data;
    let xhr = new XMLHttpRequest();
     xhr.onreadystatechange = function() {
       if (this.readyState === 4 && this.status === 200) {
          data = this.responseText;}
     }
    xhr.open("GET", url, false);
    // xhr.setRequestHeader("Accept", '');
    xhr.send();
    return data; 
  }
  
  getWindData(url:string){
    return this.http.get(url);
  }
}
