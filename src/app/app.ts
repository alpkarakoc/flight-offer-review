import { Component } from '@angular/core';
import { FlightListComponent } from './offers/flight-list/flight-list.component';

@Component({
  selector: 'app-root',
  imports: [FlightListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}