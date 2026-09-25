import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { MedicineAnalysis } from '../models/medicine.model';

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private readonly apiUrl = '/api/analyze';

  constructor(private http: HttpClient) {}

  analyzeLabel(base64Image: string, targetLanguage: string = 'English'): Observable<MedicineAnalysis> {
    return from(this.compressImage(base64Image)).pipe(
      switchMap((compressedBase64) =>
        this.http.post<MedicineAnalysis>(this.apiUrl, {
          image: compressedBase64,
          language: targetLanguage
        })
      )
    );
  }

  private compressImage(base64Str: string, maxWidth = 1024): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {                               // ✅ handler before src
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };

      img.onerror = () => resolve(base64Str);            // fallback: use original
      img.src = base64Str;                               // ✅ src set last
    });
  }
}
