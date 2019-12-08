//ANGULAR REQUIRED LIBRARIES
import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

//LEAFLET REQUIRED MODULES
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

//HTTP CLIENT USED FOR GET AND POST CALLS TO BACKEND
import {HttpClientModule} from '@angular/common/http';

//ALL OF THESE MODULES ARE FOR ANGULAR MATERIAL COMPONENTS
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatDialogModule} from '@angular/material/dialog';

//MAIN APP COMPONENT
import { AppComponent } from './app.component';
//USER CREATED MAP COMPONENT
import { MapComponent } from './map/map.component';
//USER CREATED CHART COMPONENT
import { ChartComponent } from './chart/chart.component';
//NG2 CHART JS MODULE FOR CHART COMPONENT
import { ChartsModule } from 'ng2-charts';
//USER CREATED SIDEBAR COMPONENT
import { SideBarComponent } from './side-bar/side-bar.component';
//USER CREATED HEADER BAR COMPONENT
import { HeaderBarComponent } from './header-bar/header-bar.component';
//ANGULAR ANIMATIONS MODULE
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//ANGULAR LOADING SPINNER MODULE
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
    MatDialogModule,
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
