import { Component, OnInit } from '@angular/core';
import { latLng,  tileLayer, marker, icon, polyline, Map, Layer, circle, circleMarker, LeafletEventHandlerFn, Control, LayerGroup} from 'leaflet';
import 'beautifymarker';
import { SensorDataService } from '../sensor-data.service';
import {SideBarService} from '../side-bar.service';
import 'leaflet-velocity-ts';
declare var L: any;
declare var require: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})

export class MapComponent implements OnInit{
  constructor(private sensorDataService: SensorDataService, private sideBarService: SideBarService){
  }

  data_time;
  updated_time;
  wind_json = require('./wind-gbr.json');

  //holds current sensor data
  sensors:object[] = [];
  sensorIDs:any;
  //Layer array for circle markers
  markers: Layer[] = [];
  showSpinner: Boolean = true;
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

  //WMS Radar Layer
  nexrad:any;
  RadarLayer = L.tileLayer.wms(
    "http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {
      layers: 'nexrad-n0r',
      format: 'image/png',
      transparent: true,
      attribution: "Weather data &copy; 2015 IEM Nexrad"
    }
  );


  wind_overlay: any;
  layerGrp: LayerGroup;
  imageUrl:any;
  
  refreshLayersControl(){
    this.layersControl = {
      baseLayers: {
        'Street Maps': this.streetMaps,
        'Satellite': this.Esri_WorldImagery,
        'Dark Mode': this.DarkMap
      },
      overlays:{
          "Wind Overlay": this.wind_overlay,
          "Radar": this.RadarLayer
      }
    };
  }

  //function that runs when the map is loaded and ready to receive layers
  onMapReady(map:Map){
    //changes zoom control position
    map.addControl( L.control.zoom({position:'bottomright'}));

    //disables double click zoom
    map.doubleClickZoom.disable();
    
    //IF MAP IS CLICKED CLOSE ALL ON SCREEN MODALS
    map.on('click', function(){
      document.getElementById("sDataDetails").style.display="none";
      document.getElementById("AboutInfo").style.display="none";
      document.getElementById("HowToInfo").style.display="none";
      document.getElementById("PMInfo").style.display="none";
      document.getElementById("CSScaleModal").style.display="none";
    });
    //IF MAP IS DRAGGED CLOSE ALL ON SCREEN MODALS
    map.on('drag', function(){
      document.getElementById("sDataDetails").style.display="none";
      document.getElementById("AboutInfo").style.display="none";
      document.getElementById("HowToInfo").style.display="none";
      document.getElementById("PMInfo").style.display="none";
      document.getElementById("CSScaleModal").style.display="none";
    });

    //gets a list of sensor IDs to begin getting real time data
    this.sensorDataService.getSensorIDs().subscribe((data1: any)=>{
      this.sensorIDs = data1;
      console.log(data1);
      //loop through each sensor in the list
      for(let i = 0; i < this.sensorIDs.length; i++)
      {
        //get real time sensor data and add a marker for each sensor in list
        this.sensorDataService.getRealTimeSensorData(this.sensorIDs[i]).subscribe((data2: any)=>{
          //this.sensors.push(data2);
          console.log(data2)
          console.log(this.sensorIDs[i]);
          this.addMarker(data2[0], this.sensorIDs[i]);
        })  
      }
   });

   //Sets boundaries for the map
    var southWest = L.latLng(-89.98155760646617, -180),
    northEast = L.latLng(89.99346179538875, 180);
    var bounds = L.latLngBounds(southWest, northEast);

    map.setMaxBounds(bounds);
    map.on('drag', function() {
      map.panInsideBounds(bounds, { animate: false });
    });
    //Sets max zoom for the map
    setInterval(function(){
      if(map.getZoom() < 3)
      map.setZoom(3);
    }, 1);

  }

  //leaflet map controls for map layers
  layersControl;

  //leaflet options
  options = {
    layers: this.DarkMap,
    zoom: 10,
    center: latLng([ 	32.897480,  -97.040443 ]),
    zoomControl:false
  };

  //This funciton adds circle markers that represents the sensors
  addMarker(sData, sensorID){
    //String that gives Real Time information about a Sensor. This is used in the popup modal for the marker
    let PopupString = "<div style='font-size:14px'><div style='text-align:center; font-weight:bold'>" + "Current Sensor Data </div><br>";
    if(!isNaN(parseFloat(sData.pm1)) && parseFloat(sData.pm1) !== 0)
      PopupString += "<li>PM1: " + parseFloat(sData.pm1).toFixed(2) + " Micrograms Per Cubic Meter</li><br>";
    if(!isNaN(parseFloat(sData.pm2_5)) && parseFloat(sData.pm2_5) !== 0)
      PopupString += "<li>PM2.5: " + parseFloat(sData.pm2_5).toFixed(2) + " Micrograms Per Cubic Meter</li><br>" ;
    if(!isNaN(parseFloat(sData.pm4)) && parseFloat(sData.pm4) !== 0)
      PopupString += "<li>PM4: " + parseFloat(sData.pm4).toFixed(2) + " Micrograms Per Cubic Meter</li><br>" ;
    if(!isNaN(parseFloat(sData.pm10))&& parseFloat(sData.pm10) !== 0)    
      PopupString += "<li>PM10: " + parseFloat(sData.pm10).toFixed(2) + " Micrograms Per Cubic Meter</li><br>" ;
    if(!isNaN(parseFloat(sData.temperature))&& parseFloat(sData.temperature) !== 0)
      PopupString += "<li>Temperature: " + parseFloat(sData.temperature).toFixed(2) + " Celcius</li><br>" ;
    if(!isNaN(parseFloat(sData.humidity))&& parseFloat(sData.humidity) !== 0)
      PopupString += "<li>Humidity: " + parseFloat(sData.humidity).toFixed(2) + "%</li><br>" ;
    if(!isNaN(parseFloat(sData.dewpoint))&& parseFloat(sData.dewpoint) !== 0)
      PopupString += "<li>DewPoint: " + parseFloat(sData.dewpoint).toFixed(2) + "%</li></div><br>" 
    if(!isNaN(parseFloat(sData.timestamp)))
      PopupString += "<div style='text-align:right; font-size: 11px'>Last Updated: " + sData.timestamp + " UTC</div>";

    //get colors based on PM 2.5 values
    let outlineColor = this.setColor(parseFloat(sData.pm2_5));
    let fillColor = this.setFillColor(parseFloat(sData.pm2_5));
    // console.log(outlineColor);
    // console.log(fillColor);

    let beautifyOptions = {
      icon: 'leaf',
      iconShape: 'circle',
      borderColor: outlineColor,
      textColor: fillColor,
      backgroundColor: 'transparent'
    };
    let beautyMark = L.marker([parseFloat(sData.latitude), parseFloat(sData.longitude)], {
      icon: L.BeautifyIcon.icon(beautifyOptions)
    })
    //create the marker
    // let newMarker = circleMarker([parseFloat(sData.Latitude), parseFloat(sData.Longitude)], { 
    //   radius: 10,
    //   color: outlineColor,
    //   fillColor: fillColor,
    //   fillOpacity: 1
    // })
        //handles click events for single clicks
        // .on("click", () => {
        //   this.ClickTimer = setTimeout(()=>{
        //     if (!this.ClickPrevent) {
        //       this.doSingleClickAction(this, sData);
        //     }
        //     this.ClickPrevent = false;
        //   }, this.ClickDelay);
        // })
        //handles click events for double click events
    .on("dblclick", () => {
      this.doDoubleClickAction(sensorID);
    }).bindPopup(PopupString).openPopup();
    this.markers.push(beautyMark);
  }

  //OPENS SIDEBAR 
  OpenSideBar(){
    document.getElementById("sDataDetails").style.display="none";
    setTimeout(() => {
      document.getElementById("sDataDetails").style.display="block";
    }, 1)
  }

  //function for double click action
  doDoubleClickAction(sensorID){
    this.OpenSideBar();
    // console.log(sensorID);
    //PASS SENSORID TO CHART BY USING SIDEBAR SERVICE
    this.sideBarService.setSensorID(sensorID);

  }

  //function for single click action
  doSingleClickAction(this, sData){
    // console.log("click once");
  }

  calculateWindOverlay(data){
    return L.velocityLayer({
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
      data,
      maxVelocity: 10,
    });
  }

  refreshWindOverlayData(){
    this.sensorDataService.getWindData().subscribe(
      data => {
        this.wind_overlay = this.calculateWindOverlay(data);
        this.refreshLayersControl();
        let date_time = new Date() 
        this.data_time = "Wind Data time: " + data["0"].recorded_time; 
        this.data_time=this.data_time.replace(/T|\:\d\dZ/g,' ')
        this.data_time = this.data_time.substring(0, this.data_time.length-5);
        this.updated_time = "Wind Updated Last: " + data["0"].header.refTime;
        this.updated_time=this.updated_time.replace(/T|\:\d\dZ/g,' ')
        this.updated_time = this.updated_time.substring(0, this.updated_time.length-5);
        setTimeout(() => {
          this.showSpinner = false;
        }, 3000);
      },
      error => {
        console.error('There was an error!', error)
        this.wind_overlay = this.calculateWindOverlay([]);
        this.refreshLayersControl();
        setTimeout(() => {
          this.showSpinner = false;
        }, 3000);
        
      }
    )
  }

  //component initialize function
  async ngOnInit(){
    this.refreshWindOverlayData();
    setInterval(() => { 
      this.refreshWindOverlayData();
      // console.log("Wind Overlay Data has been refreshed")
  }, 3600000); //Refreshes every hour
  }

  ngAfterViewInit():void{
  }

  //USED FOR OPENING AND CLOSING COLOR SCALE MODALS

  OpenColorScaleModal(){
    document.getElementById("CSScaleModal").style.display="block";
    document.getElementById("PMInfo").style.display="none";
    document.getElementById("AboutInfo").style.display="none";
    document.getElementById("HowToInfo").style.display="none";
  }
  CloseModal($event){
    document.getElementById("CSScaleModal").style.display="none";
    document.getElementById("AboutInfo").style.display="none";
    document.getElementById("HowToInfo").style.display="none";
    document.getElementById("PMInfo").style.display = "none";
  }

    //function for getting the outline color of circle markers
    
setColor(AQI:number):string{            //AQI stands for Air Quality Index

           if(AQI >= 0   && AQI <=5)   return "#ffff66";
      else if(AQI >  5   && AQI <=10)  return "#ff6600";
      else if(AQI > 10   && AQI <=15)  return "#cc0000";
      else if(AQI > 15   && AQI <=20)  return "#990099";
      else if(AQI > 20) return "#732626";
    }
  
    //function for getting the fill color of circle markers
setFillColor(AQI:number):string{

          if(AQI >= 0   &&  AQI  <=5)   return "#ffff66";
     else if(AQI >  5   &&  AQI  <=10)  return "#ff6600";
     else if(AQI > 10   &&  AQI  <=15)  return "#cc0000";
     else if(AQI > 15   &&  AQI  <=20)  return "#990099";
     else if(AQI > 20) return "#732626";
    }
}
