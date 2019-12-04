import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import {HttpClientModule} from '@angular/common/http';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav'

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { ChartComponent } from './chart/chart.component';
import { ChartsModule } from 'ng2-charts';
import { SideBarComponent } from './side-bar/side-bar.component';
import { HeaderBarComponent } from './header-bar/header-bar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Ng2LoadingSpinnerModule } from 'ng2-loading-spinner';

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
    ChartsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    Ng2LoadingSpinnerModule.forRoot({
      backdropColor  : 'rgba(255, 255, 255)',
      spinnerColor   : '#673ab7',
      spinnerSize    : 'xl',
      animationType  : 'scalingBars'
    })
  ],
  bootstrap: [AppComponent]

})
export class AppModule { }
