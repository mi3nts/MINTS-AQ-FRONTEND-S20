import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import {HttpClientModule} from '@angular/common/http';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { ChartComponent } from './chart/chart.component';
import { ChartsModule } from 'ng2-charts';
import { SideBarComponent } from './side-bar/side-bar.component';
import { HeaderBarComponent } from './header-bar/header-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    ChartComponent,
    SideBarComponent,
    HeaderBarComponent
  ],
  imports: [
    BrowserModule,
    LeafletModule,
    HttpClientModule,
    ChartsModule
  ],
  bootstrap: [AppComponent]

})
export class AppModule { }
