import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import {HttpClientModule} from '@angular/common/http';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { ChartComponent } from './chart/chart.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    ChartComponent    
  ],
  imports: [
    BrowserModule,
    LeafletModule,
    HttpClientModule,
  ],
  bootstrap: [AppComponent]

})
export class AppModule { }
