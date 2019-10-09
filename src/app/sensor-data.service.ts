import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SensorDataService {

  constructor() { }

   getSensorData(url):string{
    let data;
    let xhr = new XMLHttpRequest();
     xhr.onreadystatechange = function() {
       if (this.readyState === 4 && this.status === 200) {
          data = this.responseText;}
     }
    xhr.open("GET", url, false);
    xhr.setRequestHeader("Accept", 'application/json');
    xhr.send();
    return data;
  }
}

