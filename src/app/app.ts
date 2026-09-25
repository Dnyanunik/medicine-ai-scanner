import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Home } from './components/home/home';
import { VisionMissionComponent } from './components/vision-mission/vision-mission';
import { FooterComponent } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatToolbarModule, Home, VisionMissionComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  title = 'medicine-label-reader';
}
