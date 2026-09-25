import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap, map } from 'rxjs';
import { MedicineAnalysis } from '../models/medicine.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private readonly apiKey = environment.anthropicApiKey;
  private readonly anthropicUrl = 'https://api.anthropic.com/v1/messages';

  constructor(private http: HttpClient) {}

  analyzeLabel(base64Image: string, targetLanguage: string = 'English'): Observable<MedicineAnalysis> {
    return from(this.compressImage(base64Image)).pipe(
      switchMap((compressedBase64) => {
        const rawBase64 = compressedBase64.replace(/^data:image\/\w+;base64,/, '');

        const headers = new HttpHeaders({
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true' // Enables direct browser requests
        });

        const prompt = `Analyze this medicine label image and extract all visible details.
TARGET LANGUAGE: ${targetLanguage}

Return ONLY a single valid raw JSON object matching this structure (no markdown formatting, no code blocks):
{
  "medicineName": "",
  "activeIngredients": [],
  "strength": "",
  "form": "",
  "labelPurpose": "",
  "warnings": [],
  "storage": "",
  "expiryDate": "",
  "manufacturer": "",
  "confidence": "High",
  "imageFeedback": "",
  "generalAdvice": ""
}`;

        const body = {
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1500,
          temperature: 0.1,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: rawBase64
                  }
                },
                {
                  type: 'text',
                  text: prompt
                }
              ]
            }
          ]
        };

        return this.http.post<any>(this.anthropicUrl, body, { headers }).pipe(
          map((response) => {
            const rawText = response.content[0].text;
            const cleanJsonText = rawText
              .replace(/```json/gi, '')
              .replace(/```/g, '')
              .trim();
            return JSON.parse(cleanJsonText) as MedicineAnalysis;
          })
        );
      })
    );
  }

  private compressImage(base64Str: string, maxWidth = 1024): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
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

      img.onerror = () => resolve(base64Str);
      img.src = base64Str;
    });
  }
}
