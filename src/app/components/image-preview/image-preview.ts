import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-image-preview',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './image-preview.html',
  styleUrls: ['./image-preview.scss']
})
export class ImagePreview {
  @Input() previewUrl: string | null = null;
  @Output() analyze = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  onAnalyze() {
    this.analyze.emit();
  }

  onReset() {
    this.reset.emit();
  }
}
