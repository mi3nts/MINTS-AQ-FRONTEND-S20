import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  //Closes sidebar using x at the top left
  CloseSideBar($event)
  {
    document.getElementById("sDataDetails").style.display="none";
  }
}
