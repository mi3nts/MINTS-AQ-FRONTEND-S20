import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.css']
})
export class HeaderBarComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  //FUNCTIONS FOR OPENING AND CLOSING HEADER MODALS 
  
  OpenAboutModal(){
    document.getElementById("CSScaleModal").style.display="none";
    document.getElementById("HowToInfo").style.display="none";
    document.getElementById("PMInfo").style.display="none";
    document.getElementById("AboutInfo").style.display="block";
  }

  OpenHowToModal(){
    document.getElementById("CSScaleModal").style.display="none";
    document.getElementById("AboutInfo").style.display="none";
    document.getElementById("PMInfo").style.display="none";
    document.getElementById("HowToInfo").style.display="block";
  }

  OpenPMModal(){
    document.getElementById("CSScaleModal").style.display="none";
    document.getElementById("PMInfo").style.display="block";
    document.getElementById("AboutInfo").style.display="none";
    document.getElementById("HowToInfo").style.display="none";
  }

  CloseModal($event)
  {
    document.getElementById("CSScaleModal").style.display="none";
    document.getElementById("AboutInfo").style.display="none";
    document.getElementById("HowToInfo").style.display="none";
    document.getElementById("PMInfo").style.display = "none";
  }
}
