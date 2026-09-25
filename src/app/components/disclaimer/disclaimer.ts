import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-disclaimer',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './disclaimer.html',
  styleUrls: ['./disclaimer.scss']
})
export class Disclaimer {}
