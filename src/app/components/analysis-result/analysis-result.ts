import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MedicineAnalysis } from '../../models/medicine.model';
import { Disclaimer } from '../disclaimer/disclaimer';

@Component({
  selector: 'app-analysis-result',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule,
    MatFormFieldModule,
    Disclaimer
  ],
  templateUrl: './analysis-result.html',
  styleUrls: ['./analysis-result.scss']
})
export class AnalysisResult {
  @Input() result!: MedicineAnalysis;
  @Input() currentLanguage: string = 'English';
  @Output() reset = new EventEmitter<void>();
  @Output() languageChange = new EventEmitter<string>();

  copied: boolean = false;

  languages = [
    { code: 'English', label: 'English' },
    { code: 'Hindi', label: 'हिंदी (Hindi)' },
    { code: 'Spanish', label: 'Español (Spanish)' },
    { code: 'French', label: 'Français (French)' },
    { code: 'German', label: 'Deutsch (German)' },
    { code: 'Arabic', label: 'العربية (Arabic)' }
  ];

  onLanguageSelect(lang: string) {
    this.languageChange.emit(lang);
  }

  copySummary() {
    if (!this.result) return;

    const textSummary = `
=== MEDLABEL AI - MEDICINE REPORT ===
Medicine Name: ${this.result.medicineName}
Confidence: ${this.result.confidence}
Active Ingredients: ${this.result.activeIngredients.join(', ') || 'Not clearly visible'}
Strength: ${this.result.strength}
Form: ${this.result.form}
Purpose: ${this.result.labelPurpose}
Storage: ${this.result.storage}
Expiry Date: ${this.result.expiryDate}
Manufacturer: ${this.result.manufacturer}

WARNINGS:
${this.result.warnings?.map(w => '- ' + w).join('\n') || 'None listed'}

GENERAL GUIDANCE:
${this.result.generalAdvice || 'N/A'}
=====================================
    `.trim();

    navigator.clipboard.writeText(textSummary).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2500);
    });
  }

  exportPdf() {
    window.print();
  }

  onScanAnother() {
    this.reset.emit();
  }

  getConfidenceClass(confidence: string): string {
    switch (confidence?.toLowerCase()) {
      case 'high': return 'confidence-high';
      case 'medium': return 'confidence-medium';
      default: return 'confidence-low';
    }
  }
}
