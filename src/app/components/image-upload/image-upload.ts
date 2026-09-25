import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './image-upload.html',
  styleUrls: ['./image-upload.scss']
})
export class ImageUpload {
  // This sends the selected file and its preview URL back to the parent (HomeComponent)
  @Output() imageSelected = new EventEmitter<{file: File, previewUrl: string}>();

  errorMessage: string | null = null;

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.validateAndEmitFile(file);
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.validateAndEmitFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Required to allow dropping
  }

  private validateAndEmitFile(file: File) {
    this.errorMessage = null;

    // 1. Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      this.errorMessage = 'Please upload a valid image (JPG, PNG, or WEBP).';
      return;
    }

    // 2. Validate file size (max 10MB to keep API requests safe)
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = 'File is too large. Maximum size is 10MB.';
      return;
    }

    // 3. Generate a local preview URL
    const reader = new FileReader();
    reader.onload = () => {
      this.imageSelected.emit({
        file: file,
        previewUrl: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  }
}
