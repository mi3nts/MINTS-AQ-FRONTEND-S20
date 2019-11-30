import { Component, OnInit } from '@angular/core';
import {SideBarService} from '../side-bar.service';
@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {

  constructor(private sideBarService: SideBarService) { }

  ngOnInit() {
  }

  //Closes sidebar using x at the top left
  CloseSideBar($event)
  {
    document.getElementById("sDataDetails").style.visibility="hidden";
    this.sideBarService.setSensorID("");
  }
}
