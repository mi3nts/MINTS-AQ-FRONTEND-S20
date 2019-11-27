import { Component, OnInit } from '@angular/core';
import { latLng,  tileLayer, marker, icon, polyline, Map, Layer, circle, circleMarker, LeafletEventHandlerFn, Control, LayerGroup} from 'leaflet';
import { SensorDataService } from '../sensor-data.service';
import 'leaflet-velocity-ts';
import { ViewChild } from '@angular/core';
declare var L: any;
declare var require: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})

export class MapComponent implements OnInit{
  constructor(private sensorDataService: SensorDataService){
  }

  wind_json = require('./wind-gbr.json');
  wind_latest: any;
  //holds current sensor data
  sensors:object[] = [];
  sensorIDs:any;
  //Layer array for circle markers
  markers: Layer[] = [];

  //used for differentiating single and double clicks
  ClickTimer: any = 0;
  ClickDelay: number = 200;
  ClickPrevent: Boolean = false;

  //White street map
  streetMaps = tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //detectRetina: true,
    attribution: '&amp;copy; &lt;a href="https://www.openstreetmap.org/copyright"&gt;OpenStreetMap&lt;/a&gt; contributors'
  });

  //Satellite image map
  Esri_WorldImagery = tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  //Dark theme
  DarkMap = L.tileLayer(
    "http://{s}.sm.mapstack.stamen.com/" +
    "(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/" +
    "{z}/{x}/{y}.png",
    {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, ' +
        'NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    }
  );


  wind_overlay: any;
  layerGrp: LayerGroup;
  imageUrl:any;

  //function that runs when the map is loaded and ready to receive layers
  onMapReady(map:Map){
    this.AddWindOverlay(map);
    this.layersControl = {
      baseLayers: {
        'Street Maps': this.streetMaps,
        'Satellite': this.Esri_WorldImagery,
        'Dark Mode': this.DarkMap
      },
      overlays:{
          "Wind Overlay": this.wind_overlay,
      }
    };

    //changes zoom control position
    map.addControl( L.control.zoom({position:'bottomright'}));
    //disables double click zoom
    map.doubleClickZoom.disable();
    this.sensorDataService.getSensorIDs().subscribe((data: any)=>{
      this.sensorIDs = data;
   for(let i = 0; i < this.sensorIDs.sensors.length; i++)
   {
    this.sensorDataService.getSensorData(this.sensorIDs.sensors[i]).subscribe((data: any)=>{
      this.sensors.push(data);
      this.addMarker(data);
    })  
   }
   })
  }

  //leaflet map controls for map layers
  layersControl;

  //leaflet options
  options = {
    layers: this.streetMaps,
    zoom: 10,
    center: latLng([ 	32.897480,  -97.040443 ]),
    zoomControl:false
  };

  //adds wind overlay to leaflet map
  AddWindOverlay(map:Map){
    let url1 = "http://imd.utdallas.edu:3000/data/latest";
    this.sensorDataService.getWindData(url1).subscribe((data:any)=>{
        this.wind_latest = data
    });
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
  }

  //This funciton adds circle markers that represents the sensors
  addMarker(sData){

        //String that gives Real Time information about a Sensor. This is used in the popup modal for the marker
        let PopupString = "<div style='font-size:14px'><div style='text-align:center; font-weight:bold'>" + "Current Sensor Data </div><br>" + 
        "<li>PM1: " + parseFloat(sData.PM1).toFixed(2) + " Micrograms Per Cubic Meter</li><br>" +
        "<li>PM2_5: " + parseFloat(sData.PM2_5).toFixed(2) + " Micrograms Per Cubic Meter</li><br>" +
        "<li>PM4: " + parseFloat(sData.PM4).toFixed(2) + " Micrograms Per Cubic Meter</li><br>" +
        "<li>PM10: " + parseFloat(sData.PM10).toFixed(2) + " Micrograms Per Cubic Meter</li><br>" +
        "<li>Temperature: " + parseFloat(sData.Temperature).toFixed(2) + " Celcius</li><br>" +
        "<li>Humidity: " + parseFloat(sData.Humidity).toFixed(2) + "%</li><br>" +
        "<li>DewPoint: " + parseFloat(sData.DewPoint).toFixed(2) + "%</li></div><br>" +
        "<div style='text-align:right; font-size: 11px'>Last Updated: " + sData.dateTime + " UTC</div>";

        let newMarker = circleMarker([parseFloat(sData.Latitude), parseFloat(sData.Longitude)], { 
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