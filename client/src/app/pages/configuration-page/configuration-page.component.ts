import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-configuration-page',
  templateUrl: './configuration-page.component.html',
  styleUrls: ['./configuration-page.component.scss']
})
export class ConfigurationPageComponent implements OnInit {
  title = "Page de configuration";
  constructor() { }

  ngOnInit(): void {
  }
  
  over(){
    let subBox = document.getElementById("sub-box");
    if (subBox){
      subBox.className = "game-buttons";
    }
  }

}
