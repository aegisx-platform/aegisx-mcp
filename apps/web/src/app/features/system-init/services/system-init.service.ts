import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type {
  ApiResponse,
  AvailableModulesResponse,
  ImportOrderResponse,
  DashboardResponse,
  ValidationResult,
  ImportOptions,
  ImportJobResponse,
  ImportStatus,
  HealthStatusData,
} from '../types/system-init.types';

@Injectable({
  providedIn: 'root',
})
export class SystemInitService {
  private readonly baseUrl = '/admin/system-init';

  constructor(private http: HttpClient) {}

  // Dashboard APIs
  getAvailableModules(): Observable<AvailableModulesResponse> {
    return this.http
      .get<
        ApiResponse<AvailableModulesResponse>
      >(`${this.baseUrl}/available-modules`)
      .pipe(map((response) => response.data));
  }

  getImportOrder(): Observable<ImportOrderResponse> {
    return this.http
      .get<ApiResponse<ImportOrderResponse>>(`${this.baseUrl}/import-order`)
      .pipe(map((response) => response.data));
  }

  getDashboard(): Observable<DashboardResponse> {
    return this.http
      .get<ApiResponse<DashboardResponse>>(`${this.baseUrl}/dashboard`)
      .pipe(map((response) => response.data));
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

    return this.http
      .post<
        ApiResponse<ValidationResult>
      >(`${this.baseUrl}/module/${moduleName}/validate`, formData)
      .pipe(map((response) => response.data));
  }

  importData(
    moduleName: string,
    sessionId: string,
    options: ImportOptions,
  ): Observable<ImportJobResponse> {
    return this.http
      .post<
        ApiResponse<ImportJobResponse>
      >(`${this.baseUrl}/module/${moduleName}/import`, { sessionId, options })
      .pipe(map((response) => response.data));
  }

  getImportStatus(moduleName: string, jobId: string): Observable<ImportStatus> {
    return this.http
      .get<
        ApiResponse<ImportStatus>
      >(`${this.baseUrl}/module/${moduleName}/status/${jobId}`)
      .pipe(map((response) => response.data));
  }

  rollbackImport(moduleName: string, jobId: string): Observable<void> {
    return this.http
      .delete<
        ApiResponse<void>
      >(`${this.baseUrl}/module/${moduleName}/rollback/${jobId}`)
      .pipe(map((response) => response.data));
  }

  getHealthStatus(): Observable<HealthStatusData> {
    return this.http
      .get<ApiResponse<HealthStatusData>>(`${this.baseUrl}/health-status`)
      .pipe(map((response) => response.data));
  }
}
