import { Component, ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ImageUpload } from '../image-upload/image-upload';
import { ImagePreview } from '../image-preview/image-preview';
import { Loading } from '../loading/loading';
import { AnalysisResult } from '../analysis-result/analysis-result';
import { MedicineAnalysis } from '../../models/medicine.model';
import { MedicineService } from '../../services/medicine';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    ImageUpload,
    ImagePreview,
    Loading,
    AnalysisResult
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home {
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isLoading: boolean = false;
  analysisResult: MedicineAnalysis | null = null;
  errorMessage: string | null = null;

  selectedLanguage: string = 'English';

  constructor(
    private medicineService: MedicineService,
    private cdr: ChangeDetectorRef
  ) {}

  onLanguageChange(newLanguage: any) {
    this.selectedLanguage = typeof newLanguage === 'string' ? newLanguage : (newLanguage?.value || 'English');
    if (this.previewUrl) {
      this.onAnalyzeImage();
    }
  }

  onImageSelected(data: { file: File; previewUrl: string }) {
    this.selectedFile = data.file;
    this.previewUrl = data.previewUrl;
    this.errorMessage = null;
  }

  onResetImage() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.isLoading = false;
    this.analysisResult = null;
    this.errorMessage = null;
  }

  onAnalyzeImage() {
    if (!this.previewUrl) return;

    this.isLoading = true;
    this.analysisResult = null;
    this.errorMessage = null;

    this.medicineService.analyzeLabel(this.previewUrl, this.selectedLanguage).subscribe({
      next: (result) => {
        this.analysisResult = result;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Gemini API Error details:', error);

        const apiMessage = error?.error?.error?.message || error?.error?.message || error?.message;

        if (error?.status === 503 || error?.status === 429) {
          this.errorMessage = 'Google AI servers are currently under high demand. Please wait 10 seconds and try again!';
        } else if (apiMessage && typeof apiMessage === 'string') {
          this.errorMessage = `API Error: ${apiMessage}`;
        } else {
          this.errorMessage = 'Failed to analyze medicine label. Please try again with a clearer image.';
        }

        this.cdr.detectChanges();
      }
    });
  }
}
