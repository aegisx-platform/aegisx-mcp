import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type {
  AvailableModulesResponse,
  ImportOrderResponse,
  DashboardResponse,
  ValidationResult,
  ImportOptions,
  ImportJobResponse,
  ImportStatus,
  HealthResponse,
} from '../types/system-init.types';

@Injectable({
  providedIn: 'root',
})
export class SystemInitService {
  private readonly baseUrl = '/admin/system-init';

  constructor(private http: HttpClient) {}

  // Dashboard APIs
  getAvailableModules(): Observable<AvailableModulesResponse> {
    return this.http.get<AvailableModulesResponse>(
      `${this.baseUrl}/available-modules`,
    );
  }

  getImportOrder(): Observable<ImportOrderResponse> {
    return this.http.get<ImportOrderResponse>(`${this.baseUrl}/import-order`);
  }

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/dashboard`);
  }

  // Module-specific APIs
  downloadTemplate(
    moduleName: string,
    format: 'csv' | 'xlsx',
  ): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/module/${moduleName}/template`, {
      params: { format },
      responseType: 'blob',
    });
  }

  validateFile(moduleName: string, file: File): Observable<ValidationResult> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ValidationResult>(
      `${this.baseUrl}/module/${moduleName}/validate`,
      formData,
    );
  }

  importData(
    moduleName: string,
    sessionId: string,
    options: ImportOptions,
  ): Observable<ImportJobResponse> {
    return this.http.post<ImportJobResponse>(
      `${this.baseUrl}/module/${moduleName}/import`,
      { sessionId, options },
    );
  }

  getImportStatus(moduleName: string, jobId: string): Observable<ImportStatus> {
    return this.http.get<ImportStatus>(
      `${this.baseUrl}/module/${moduleName}/status/${jobId}`,
    );
  }

  rollbackImport(moduleName: string, jobId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/module/${moduleName}/rollback/${jobId}`,
    );
  }

  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/health-status`);
  }
}
