import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

//THIS SERVICE IS FOR PASSING INFORMAITON BETWEEN THE MAP MARKERS, TO THE CHART INSIDE THE SIDEBAR
export class SideBarService {
  private sensorID: string;
  constructor() { }

  //RETRIEVE THE CURRENT SENSORID
  public getSensorID(): string {
    return this.sensorID;
  }

  //SET THE CURRENT SENSORID
  public setSensorID(sID: string): void {
    this.sensorID = sID;
  }
}
