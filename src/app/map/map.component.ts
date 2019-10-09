import { Component, OnInit } from '@angular/core';
import { latLng,  tileLayer, marker, icon, polyline, Map, Layer, circle, circleMarker} from 'leaflet';
import { velocityLayer } from 'leaflet-velocity'
import * as $ from 'jquery';
import { getOrCreateTemplateRef } from '@angular/core/src/render3/di';
import { SensorDataService } from '../sensor-data.service';
import * as L from 'leaflet';
import {ChartComponent} from '../chart/chart.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})

export class MapComponent implements OnInit{
  constructor(private sensorDataService: SensorDataService){
  }
  sensors:JSON[] =[];
  sensorData:JSON;
  markers: Layer[] = [];
  
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
  
  onMapReady(map:Map){
    map.addControl( L.control.zoom({position:'bottomright'}));
    let url1 = "https://cors-anywhere.herokuapp.com/http://mintsdata.utdallas.edu:4200/api/001e06305a12/latestData.json";
    let url2 = "https://cors-anywhere.herokuapp.com/http://mintsdata.utdallas.edu:4200/api/001e06323a06/latestData.json"
    
    this.sensors.push(JSON.parse(this.sensorDataService.getSensorData(url1)));
    this.sensors.push(JSON.parse(this.sensorDataService.getSensorData(url2)));
    console.log(this.sensors);
    for(let i = 0; i < this.sensors.length; i++)
    {
        this.addMarker(this.sensors[i]);
    }
  }

  layersControl = {
    baseLayers: {
      'Street Maps': this.streetMaps,
      'Wikimedia Maps': this.wMaps,
      'ESRI Maps': this.Esri_WorldStreetMap
    },

  };

  options = {
    layers: this.streetMaps,
    zoom: 10,
    center: latLng([ 	32.897480,  -97.040443 ]),
    zoomControl:false
  };

  addMarker(sData){
      // for(let i = 0; i < sData["entries"].length; i++)
      // {
        // let newMarker = circle([parseFloat(sData["entries"][0]["Latitude"]), parseFloat(sData["entries"][0]["Longitude"])],{
        //   icon: icon({
        //     iconSize:[25, 41],
        //     iconAnchor:[13,41],
        //     iconUrl: 'leaflet/marker-icon.png'
        //   })
        // } );
        let newMarker = circleMarker([parseFloat(sData["entries"][0]["Latitude"]), parseFloat(sData["entries"][0]["Longitude"])], {
          radius: 10,
          color: "#ff0000",
          fillColor: "#ff8080",
          fillOpacity: 1
        });
        this.markers.push(newMarker);
      // }

  }

  ngOnInit():void{
    $.getJSON("wind-gbr.json", function(data) {
      var velocity_layer = velocityLayer({
        displayValues: true,
        displayOptions: {
          velocityType: "GBR Wind",
          displayPosition: "bottomleft",
          displayEmptyString: "No wind data"
        },
        data: data,
        maxVelocity: 10
      });
      //TODO: ADD OVERLAY. Doen't work. Try [leafletLayersControlOptions]
      this.layersControl.addOverlay(velocity_layer, "Wind Velocity Layer")
    });

  }

  ngAfterViewInit():void{
  }


}
