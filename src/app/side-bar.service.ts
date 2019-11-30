import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SideBarService {
  private sensorID: string;
  constructor() { }
  public getSensorID(): string {
    return this.sensorID;
  }

  public setSensorID(sID: string): void {
    this.sensorID = sID;
  }
}
