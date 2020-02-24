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

      //loop through each sensor in the list
      for(let i = 0; i < this.sensorIDs.sensors.length; i++)
      {
        //get real time sensor data and add a marker for each sensor in list
        this.sensorDataService.getRealTimeSensorData(this.sensorIDs.sensors[i]).subscribe((data2: any)=>{
          this.sensors.push(data2);
          this.addMarker(data2, this.sensorIDs.sensors[i]);
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
    if(!isNaN(parseFloat(sData.PM1)) && parseFloat(sData.PM1) !== 0)
      PopupString += "<li>PM1: " + parseFloat(sData.PM1).toFixed(2) + " Micrograms Per Cubic Meter</li><br>";
    if(!isNaN(parseFloat(sData.PM2_5)) && parseFloat(sData.PM2_5) !== 0)
      PopupString += "<li>PM2.5: " + parseFloat(sData.PM2_5).toFixed(2) + " Micrograms Per Cubic Meter</li><br>" ;
    if(!isNaN(parseFloat(sData.PM4)) && parseFloat(sData.PM4) !== 0)
      PopupString += "<li>PM4: " + parseFloat(sData.PM4).toFixed(2) + " Micrograms Per Cubic Meter</li><br>" ;
    if(!isNaN(parseFloat(sData.PM10))&& parseFloat(sData.PM10) !== 0)    
      PopupString += "<li>PM10: " + parseFloat(sData.PM10).toFixed(2) + " Micrograms Per Cubic Meter</li><br>" ;
    if(!isNaN(parseFloat(sData.Temperature))&& parseFloat(sData.Temperature) !== 0)
      PopupString += "<li>Temperature: " + parseFloat(sData.Temperature).toFixed(2) + " Celcius</li><br>" ;
    if(!isNaN(parseFloat(sData.Humidity))&& parseFloat(sData.Humidity) !== 0)
      PopupString += "<li>Humidity: " + parseFloat(sData.Humidity).toFixed(2) + "%</li><br>" ;
    if(!isNaN(parseFloat(sData.DewPoint))&& parseFloat(sData.DewPoint) !== 0)
      PopupString += "<li>DewPoint: " + parseFloat(sData.DewPoint).toFixed(2) + "%</li></div><br>" 
    if(!isNaN(parseFloat(sData.dateTime)))
      PopupString += "<div style='text-align:right; font-size: 11px'>Last Updated: " + sData.dateTime + " UTC</div>";

    //get colors based on PM 2.5 values
    let outlineColor = this.setColor(parseFloat(sData.PM2_5));
    let fillColor = this.setFillColor(parseFloat(sData.PM2_5));
    // console.log(outlineColor);
    // console.log(fillColor);

    let beautifyOptions = {
      icon: 'leaf',
      iconShape: 'circle',
      borderColor: outlineColor,
      textColor: fillColor,
      backgroundColor: 'transparent'
    };
    let beautyMark = L.marker([parseFloat(sData.Latitude), parseFloat(sData.Longitude)], {
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
    //this.OpenSideBar();
    // console.log(sensorID);
    //PASS SENSORID TO CHART BY USING SIDEBAR SERVICE
    //this.sideBarService.setSensorID(sensorID);
	
	window.open('http://localhost:3000/d/sensorID/at-location-sensorid?orgId=1&refresh=5s', "http://localhost:3000/d/sensorID/at-location-sensorid?orgId=1&refresh=5s");
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
  setColor(PM:number):string{
      // console.log(PM);
      if(PM >= 11.00)return "#ed0000";
      else if(PM >= 8.00)return "#ed9200";
      else if(PM >= 5.00)return "#fffb00";
      else if(PM >= 3.00)return "#35b000";
      else if(PM >= 0.00)return "#3d88ff";
    }
  
    //function for getting the fill color of circle markers
  setFillColor(PM:number):string{
      // console.log(PM);
  
      if(PM >= 11.00){
        if(PM >= 11.90)return "#ed0000";
        else if(PM >= 11.80)return "#ff1919";
        else if(PM >= 11.70)return "#ff2b2b";
        else if(PM >= 11.60)return "#ff3838";
        else if(PM >= 11.50)return "#ff4545";
        else if(PM >= 11.40)return "#ff4d4d";
        else if(PM >= 11.30)return "#ff6363";
        else if(PM >= 11.20)return "#ff6b6b";
        else if(PM >= 11.10)return "#ff8585";
        else if(PM >= 11.00)return "#ff9696";
      }
  
      else if(PM >= 8.00){      
        if(PM >= 8.90)return "#ed9200";
        else if(PM >= 8.80)return "#fca314";
        else if(PM >= 8.70)return "#faad32";
        else if(PM >= 8.60)return "#ffb43d";
        else if(PM >= 8.50)return "#ffba4d";
        else if(PM >= 8.40)return "#ffc261";
        else if(PM >= 8.30)return "#ffc870";
        else if(PM >= 8.20)return "#ffcf82";
        else if(PM >= 8.10)return "#fcd28d";
        else if(PM >= 8.00)return "#ffda9e";
      }
  
      else if(PM >= 5.00){
        if(PM >= 5.90)return "#fffb00";
        else if(PM >= 5.80)return "#fffb19";
        else if(PM >= 5.70)return "#fffb30";
        else if(PM >= 5.60)return "#fffb3b";
        else if(PM >= 5.50)return "#fffb4d";
        else if(PM >= 5.40)return "#fffb57";
        else if(PM >= 5.30)return "#fffb61";
        else if(PM >= 5.20)return "#fffb69";
        else if(PM >= 5.10)return "#fffc80";
        else if(PM >= 5.00)return "#fffd96";
      }
  
      else if(PM >= 3.00 ){
        if(PM >= 3.90)return "#35b000";
        else if(PM >= 3.80)return "#48bf15";
        else if(PM >= 3.70)return "#52c91e";
        else if(PM >= 3.60)return "#52c91e";
        else if(PM >= 3.50)return "#69e334";
        else if(PM >= 3.40)return "#6eeb38";
        else if(PM >= 3.30)return "#79ed47";
        else if(PM >= 3.20)return "#83f252";
        else if(PM >= 3.10)return "#8eff5c";
        else if(PM >= 3.00)return "#a5ff7d";
      }
  
      else if(PM >= 0.00){
        if(PM >= 2.90)return "#3d88ff";
        else if(PM >= 2.70)return "#4a90ff";
        else if(PM >= 2.50)return "#5c9bff";
        else if(PM >= 2.30)return "#6ea6ff";
        else if(PM >= 2.10)return "#4288ff";
        else if(PM >= 1.90)return "#5292ff";
        else if(PM >= 1.70)return "#5d98fc";
        else if(PM >= 1.50)return "#6ea4ff";
        else if(PM >= 1.30)return "#7aacff";
        else if(PM >= 1.00)return "#96beff";
        else if(PM >= 0.75)return "#a8c9ff";
        else if(PM >= 0.50)return "#bad4ff";
        else if(PM >= 0.25)return "#c9deff";
        else if(PM >= 0.00)return "#dbe9ff";
        
      }
    }
}