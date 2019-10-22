import { Component, OnInit } from '@angular/core';
import { latLng,  tileLayer, marker, icon, polyline, Map, Layer, circle, circleMarker, LeafletEventHandlerFn, Control} from 'leaflet';
import * as $ from 'jquery';
import { getOrCreateTemplateRef } from '@angular/core/src/render3/di';
import { SensorDataService } from '../sensor-data.service';
import {ChartComponent} from '../chart/chart.component';
import GEOTIFF from 'geotiff';
import * as d3 from "d3";
import * as chroma from 'chroma-js';
import VelocityLayer from 'leaflet-velocity';
import 'leaflet-velocity-ts';
declare var L: any;
import WindJSLeaflet from 'wind-js-leaflet';
declare var require: any;
declare function WindMap(map):any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})

export class MapComponent implements OnInit{
  constructor(private sensorDataService: SensorDataService){
  }

  wind_json = require('./wind-gbr.json');

  //holds current sensor data
  sensors:JSON[] =[];
  //Layer array for circle markers
  markers: Layer[] = [];

  //used for differentiating single and double clicks
  ClickTimer: any = 0;
  ClickDelay: number = 200;
  ClickPrevent: Boolean = false;

  streetMaps = tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    detectRetina: true,
    attribution: '&amp;copy; &lt;a href="https://www.openstreetmap.org/copyright"&gt;OpenStreetMap&lt;/a&gt; contributors'
  });
  wMaps = tileLayer('http://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
    detectRetina: true,
    attribution: '&amp;copy; &lt;a href="https://www.openstreetmap.org/copyright"&gt;OpenStreetMap&lt;/a&gt; contributors'
  });

  Esri_WorldStreetMap = tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    detectRetina: true,
	  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
  });

  wind_overlay: any;
  


  //function that runs when the map is loaded and ready to receive layers
  onMapReady(map:Map){
    //changes zoom control position
    map.addControl( L.control.zoom({position:'bottomright'}));
    //disables double click zoom
    map.doubleClickZoom.disable();
    //gets url for sensor data. replace with server call
    let url1 = "https://cors-anywhere.herokuapp.com/http://mintsdata.utdallas.edu:4200/api/001e06305a12/latestData.json";
    let url2 = "https://cors-anywhere.herokuapp.com/http://mintsdata.utdallas.edu:4200/api/001e06323a06/latestData.json";
    this.sensors.push(JSON.parse(this.sensorDataService.getSensorData(url1)));
    this.sensors.push(JSON.parse(this.sensorDataService.getSensorData(url2)));
    console.log(this.sensors);
    //adds marker for each sensor data 
    for(let i = 0; i < this.sensors.length; i++)
    {
        this.addMarker(this.sensors[i]);
    }

    this.wind_overlay =  L.velocityLayer({
      displayValues: true,
      displayOptions: {
        velocityType: 'GBR Wind',
        position: 'topleft',//REQUIRED !
        emptyString: 'No velocity data', //REQUIRED !
        angleConvention: 'bearingCW',
        displayPosition: 'topleft',
        displayEmptyString: 'No velocity data',
        speedUnit: 'm/s'
      },
      data: this.wind_json,
      maxVelocity: 10,
    });

    this.wind_overlay.addTo(map);
    map.addLayer(this.wind_overlay);
  }

  //leaflet map controls for map layers
  layersControl = {
    baseLayers: {
      'Street Maps': this.streetMaps,
      'Wikimedia Maps': this.wMaps,
      'ESRI Maps': this.Esri_WorldStreetMap,
    },
    overlays:{
      'Wind Overlay': this.wind_overlay
    }

  };

  //leaflet options
  options = {
    layers: this.streetMaps,
    zoom: 10,
    center: latLng([ 	32.897480,  -97.040443 ]),
    zoomControl:false
  };

  //This funciton adds circle markers that represents the sensors
  addMarker(sData){
      // for(let i = 0; i < sData["entries"].length; i++)
      // {
        
        //String that gives Real Time information about a Sensor. This is used in the popup modal for the marker
        let PopupString = "<div style='font-size:14px'><div style='text-align:center; font-weight:bold'>" + "Current Sensor Data </div><br>" + 
        "<li>PM1: " + sData["entries"][0]["PM1"] + "</li><br>" +
        "<li>PM2_5: " + sData["entries"][0]["PM2_5"] + "</li><br>" +
        "<li>PM4: " + sData["entries"][0]["PM4"] + "</li><br>" +
        "<li>PM10: " + sData["entries"][0]["PM10"] + "</li><br>" +
        "<li>Temperature: " + sData["entries"][0]["Temperature"] + "</li><br>" +
        "<li>Humidity: " + sData["entries"][0]["Humidity"] + "</li><br>" +
        "<li>DewPoint: " + sData["entries"][0]["DewPoint"] + "</li></div><br>" +
        "<div style='text-align:right; font-size: 11px'>Last Updated: " + sData["entries"][0]["dateTime"] + "</div>" ;

        let newMarker = circleMarker([parseFloat(sData["entries"][0]["Latitude"]), parseFloat(sData["entries"][0]["Longitude"])], {
          radius: 10,
          color: "#35b000",
          fillColor: "#a1ff78",
          fillOpacity: 1
        })
        //handles click events for single and double clicks
        // .on("click", () => {
        //   this.ClickTimer = setTimeout(()=>{
        //     if (!this.ClickPrevent) {
        //       this.doSingleClickAction(this, sData);
        //     }
        //     this.ClickPrevent = false;
        //   }, this.ClickDelay);
        // })
        .on("dblclick", () => {
          clearTimeout(this.ClickTimer);
          this.ClickPrevent = true;
          this.doDoubleClickAction();
        }).bindPopup(PopupString).openPopup();
        this.markers.push(newMarker);
      // }
  }

  //function that opens sidebar and populates it
  OpenSideBar(){
    console.log("OpenSideBar Called!");
    document.getElementById("sDataDetails").style.display="block";
  }

  //function for double click action
  doDoubleClickAction(){
    console.log("click twice");
    this.OpenSideBar();
  }

  //function for single click action
  doSingleClickAction(this, sData){
    console.log("click once");
  }

  //component initialize function
  ngOnInit():void{
  }

  ngAfterViewInit():void{
  }


}
