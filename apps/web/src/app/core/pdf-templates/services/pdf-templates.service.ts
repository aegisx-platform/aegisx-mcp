import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Import types from the shared types file
import {
  PdfTemplate,
  CreatePdfTemplateRequest,
  UpdatePdfTemplateRequest,
  ListPdfTemplateQuery,
  ApiResponse,
  BulkResponse,
  PaginatedResponse,
} from '../types/pdf-templates.types';

// ===== SERVICE CONFIGURATION =====

const API_BASE_URL = '';

@Injectable({
  providedIn: 'root',
})
export class PdfTemplateService {
  private http = inject(HttpClient);
  private baseUrl = `${API_BASE_URL}/pdf-templates`; // Plural to match backend

  // ===== SIGNALS FOR STATE MANAGEMENT =====

  private pdfTemplatesListSignal = signal<PdfTemplate[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private permissionErrorSignal = signal<boolean>(false);
  private lastErrorStatusSignal = signal<number | null>(null);
  private selectedPdfTemplateSignal = signal<PdfTemplate | null>(null);
  private currentPageSignal = signal<number>(1);
  private pageSizeSignal = signal<number>(10);
  private totalPdfTemplateSignal = signal<number>(0);

  // ===== PUBLIC READONLY SIGNALS =====

  readonly pdfTemplatesList = this.pdfTemplatesListSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly permissionError = this.permissionErrorSignal.asReadonly();
  readonly lastErrorStatus = this.lastErrorStatusSignal.asReadonly();
  readonly selectedPdfTemplate = this.selectedPdfTemplateSignal.asReadonly();
  readonly currentPage = this.currentPageSignal.asReadonly();
  readonly totalPdfTemplate = this.totalPdfTemplateSignal.asReadonly();
  readonly pageSize = this.pageSizeSignal.asReadonly();

  // ===== COMPUTED SIGNALS =====

  readonly totalPages = computed(() => {
    const total = this.totalPdfTemplateSignal();
    const size = this.pageSizeSignal();
    return Math.ceil(total / size);
  });

  readonly hasNextPage = computed(() => {
    return this.currentPageSignal() < this.totalPages();
  });

  readonly hasPreviousPage = computed(() => {
    return this.currentPageSignal() > 1;
  });

  // ===== ERROR HANDLING HELPER =====

  /**
   * Handle HTTP errors and set appropriate error signals
   */
  private handleError(error: any, defaultMessage: string): void {
    const status = error?.status || null;
    this.lastErrorStatusSignal.set(status);

    // Check if error is 403 Forbidden
    if (status === 403) {
      this.permissionErrorSignal.set(true);
      this.errorSignal.set('You do not have permission to perform this action');
    } else {
      this.permissionErrorSignal.set(false);
      this.errorSignal.set(error.message || defaultMessage);
    }
  }

  /**
   * Clear permission error state
   */
  clearPermissionError(): void {
    this.permissionErrorSignal.set(false);
    this.lastErrorStatusSignal.set(null);
  }

  // ===== STANDARD CRUD OPERATIONS =====

  /**
   * Load pdfTemplates list with pagination and filters
   */
  async loadPdfTemplateList(params?: ListPdfTemplateQuery): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      // Build HTTP params
      let httpParams = new HttpParams();
      if (params?.page)
        httpParams = httpParams.set('page', params.page.toString());
      if (params?.limit)
        httpParams = httpParams.set('limit', params.limit.toString());
      if (params?.sort) httpParams = httpParams.set('sort', params.sort);

      // Handle fields array parameter (multiple values)
      if (params?.fields && params.fields.length > 0) {
        params.fields.forEach((field: string) => {
          httpParams = httpParams.append('fields', field);
        });
      }

      // Add smart filter parameters based on table schema
      // String filtering for name
      if (params?.name) httpParams = httpParams.set('name', params.name);
      // String filtering for display_name
      if (params?.display_name)
        httpParams = httpParams.set('display_name', params.display_name);
      // String filtering for description
      if (params?.description)
        httpParams = httpParams.set('description', params.description);
      // String filtering for category
      if (params?.category)
        httpParams = httpParams.set('category', params.category);
      // String filtering for type
      if (params?.type) httpParams = httpParams.set('type', params.type);
      // String filtering for page_size
      if (params?.page_size)
        httpParams = httpParams.set('page_size', params.page_size);
      // String filtering for orientation
      if (params?.orientation)
        httpParams = httpParams.set('orientation', params.orientation);
      // String filtering for version
      if (params?.version)
        httpParams = httpParams.set('version', params.version);
      // Boolean filtering for is_active
      if (params?.is_active !== undefined)
        httpParams = httpParams.set('is_active', params.is_active.toString());
      // Boolean filtering for is_default
      if (params?.is_default !== undefined)
        httpParams = httpParams.set('is_default', params.is_default.toString());
      // Numeric filtering for usage_count
      if (params?.usage_count !== undefined)
        httpParams = httpParams.set(
          'usage_count',
          params.usage_count.toString(),
        );
      if (params?.usage_count_min !== undefined)
        httpParams = httpParams.set(
          'usage_count_min',
          params.usage_count_min.toString(),
        );
      if (params?.usage_count_max !== undefined)
        httpParams = httpParams.set(
          'usage_count_max',
          params.usage_count_max.toString(),
        );
      // String filtering for created_by
      if (params?.created_by)
        httpParams = httpParams.set('created_by', params.created_by);
      // String filtering for updated_by
      if (params?.updated_by)
        httpParams = httpParams.set('updated_by', params.updated_by);
      // Date/DateTime filtering for created_at
      if (params?.created_at)
        httpParams = httpParams.set('created_at', params.created_at);
      if (params?.created_at_min)
        httpParams = httpParams.set('created_at_min', params.created_at_min);
      if (params?.created_at_max)
        httpParams = httpParams.set('created_at_max', params.created_at_max);
      // Date/DateTime filtering for updated_at
      if (params?.updated_at)
        httpParams = httpParams.set('updated_at', params.updated_at);
      if (params?.updated_at_min)
        httpParams = httpParams.set('updated_at_min', params.updated_at_min);
      if (params?.updated_at_max)
        httpParams = httpParams.set('updated_at_max', params.updated_at_max);

      const response = await this.http
        .get<
          PaginatedResponse<PdfTemplate>
        >(this.baseUrl, { params: httpParams })
        .toPromise();

      if (response) {
        this.pdfTemplatesListSignal.set(response.data);

        if (response.pagination) {
          this.totalPdfTemplateSignal.set(response.pagination.total);
          this.currentPageSignal.set(response.pagination.page);
          this.pageSizeSignal.set(response.pagination.limit);
        }
      }
    } catch (error: any) {
      this.handleError(error, 'Failed to load pdfTemplates list');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Load single pdfTemplates by ID
   */
  async loadPdfTemplateById(id: string): Promise<PdfTemplate | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .get<ApiResponse<PdfTemplate>>(`${this.baseUrl}/${id}`)
        .toPromise();

      if (response) {
        this.selectedPdfTemplateSignal.set(response.data);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to load pdfTemplates');
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Create new pdfTemplates
   */
  async createPdfTemplate(
    data: CreatePdfTemplateRequest,
  ): Promise<PdfTemplate | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<ApiResponse<PdfTemplate>>(`${this.baseUrl}`, data)
        .toPromise();

      if (response) {
        // Optimistic update: add to list
        this.pdfTemplatesListSignal.update((list) => [...list, response.data!]);
        this.totalPdfTemplateSignal.update((total) => total + 1);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to create pdfTemplates');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Update existing pdfTemplates
   */
  async updatePdfTemplate(
    id: string,
    data: UpdatePdfTemplateRequest,
  ): Promise<PdfTemplate | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<ApiResponse<PdfTemplate>>(`${this.baseUrl}/${id}`, data)
        .toPromise();

      if (response) {
        // Optimistic update: replace in list
        this.pdfTemplatesListSignal.update((list) =>
          list.map((item) => (item.id === id ? response.data! : item)),
        );
        // Update selected pdfTemplates if it's the same
        if (this.selectedPdfTemplateSignal()?.id === id) {
          this.selectedPdfTemplateSignal.set(response.data);
        }
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to update pdfTemplates');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Delete pdfTemplates by ID
   */
  async deletePdfTemplate(id: string): Promise<boolean> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .delete<ApiResponse<{ id: string }>>(`${this.baseUrl}/${id}`)
        .toPromise();

      if (response?.success) {
        // Optimistic update: remove from list
        this.pdfTemplatesListSignal.update((list) =>
          list.filter((item) => item.id !== id),
        );
        this.totalPdfTemplateSignal.update((total) => Math.max(0, total - 1));
        // Clear selected pdfTemplates if it's the deleted one
        if (this.selectedPdfTemplateSignal()?.id === id) {
          this.selectedPdfTemplateSignal.set(null);
        }
        return true;
      }
      return false;
    } catch (error: any) {
      this.handleError(error, 'Failed to delete pdfTemplates');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // ===== ENHANCED OPERATIONS =====

  /**
   * Export pdfTemplates data
   */
  async exportPdfTemplate(options: {
    format: 'csv' | 'excel' | 'pdf';
    ids?: string[];
    filters?: Record<string, any>;
    fields?: string[];
    filename?: string;
    applyFilters?: boolean;
    includeMetadata?: boolean;
  }): Promise<Blob> {
    try {
      let httpParams = new HttpParams().set('format', options.format);

      if (options.ids && options.ids.length > 0) {
        options.ids.forEach((id) => {
          httpParams = httpParams.append('ids', id);
        });
      }

      if (options.filters && options.applyFilters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            httpParams = httpParams.set(`filters[${key}]`, String(value));
          }
        });
      }

      if (options.fields && options.fields.length > 0) {
        options.fields.forEach((field) => {
          httpParams = httpParams.append('fields', field);
        });
      }

      if (options.filename) {
        httpParams = httpParams.set('filename', options.filename);
      }

      if (options.applyFilters !== undefined) {
        httpParams = httpParams.set(
          'applyFilters',
          String(options.applyFilters),
        );
      }

      if (options.includeMetadata !== undefined) {
        httpParams = httpParams.set(
          'includeMetadata',
          String(options.includeMetadata),
        );
      }

      const response = await this.http
        .get(`${this.baseUrl}/export`, {
          params: httpParams,
          responseType: 'blob',
        })
        .toPromise();

      if (response) {
        return response;
      }

      throw new Error('Export failed - no response received');
    } catch (error: any) {
      console.error('Failed to export pdfTemplates data:', error);
      throw error;
    }
  }

  /**
   * Get dropdown options for pdfTemplates
   */
  async getDropdownOptions(
    params: { search?: string; limit?: number } = {},
  ): Promise<Array<{ value: string; label: string }>> {
    try {
      let httpParams = new HttpParams();
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.limit)
        httpParams = httpParams.set('limit', params.limit.toString());

      const response = await this.http
        .get<
          ApiResponse<{
            options: Array<{ value: string; label: string }>;
            total: number;
          }>
        >(`${this.baseUrl}/dropdown`, { params: httpParams })
        .toPromise();

      if (response?.success && response.data?.options) {
        return response.data.options;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch pdfTemplates dropdown options:', error);
      return [];
    }
  }

  /**
   * Bulk create pdfTemplatess
   */
  async bulkCreatePdfTemplate(
    items: CreatePdfTemplateRequest[],
  ): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadPdfTemplateList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to bulk create pdfTemplatess');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk update pdfTemplatess
   */
  async bulkUpdatePdfTemplate(
    items: Array<{ id: string; data: UpdatePdfTemplateRequest }>,
  ): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .put<BulkResponse>(`${this.baseUrl}/bulk`, { items })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadPdfTemplateList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to bulk update pdfTemplatess');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Bulk delete pdfTemplatess
   */
  async bulkDeletePdfTemplate(ids: string[]): Promise<BulkResponse | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .delete<BulkResponse>(`${this.baseUrl}/bulk`, { body: { ids } })
        .toPromise();

      if (response) {
        // Refresh list after bulk operation
        await this.loadPdfTemplateList();
        return response;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to bulk delete pdfTemplatess');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Set current page
   */
  setCurrentPage(page: number): void {
    this.currentPageSignal.set(page);
  }

  /**
   * Set page size and reset to first page
   */
  setPageSize(size: number): void {
    this.pageSizeSignal.set(size);
    this.currentPageSignal.set(1);
  }

  /**
   * Select pdfTemplates
   */
  selectPdfTemplate(pdfTemplates: PdfTemplate | null): void {
    this.selectedPdfTemplateSignal.set(pdfTemplates);
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.errorSignal.set(null);
    this.clearPermissionError();
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.pdfTemplatesListSignal.set([]);
    this.selectedPdfTemplateSignal.set(null);
    this.currentPageSignal.set(1);
    this.errorSignal.set(null);
    this.clearPermissionError();
    this.totalPdfTemplateSignal.set(0);
  }

  // ===== ADVANCED FEATURE METHODS =====

  /**
   * Render PDF from template
   */
  async renderPdf(
    request: import('../types/pdf-templates.types').RenderPdfRequest,
  ): Promise<Blob | null> {
    try {
      const response = await this.http
        .post(`${this.baseUrl}/render`, request, {
          responseType: 'blob',
        })
        .toPromise();

      return response || null;
    } catch (error: any) {
      console.error('Failed to render PDF:', error);
      throw error;
    }
  }

  /**
   * Preview template with sample data
   */
  async previewTemplate(
    id: string,
    data?: Record<string, any>,
  ): Promise<Blob | null> {
    try {
      // First, get preview metadata (previewUrl)
      const previewResponse = await this.http
        .post<any>(`${this.baseUrl}/${id}/preview`, { data })
        .toPromise();

      if (!previewResponse?.previewUrl) {
        throw new Error('Invalid response: ' + JSON.stringify(previewResponse));
      }

      // Then fetch the actual PDF file using previewUrl
      // Remove /api prefix if present to avoid double /api/api
      let pdfUrl = previewResponse.previewUrl;
      if (pdfUrl.startsWith('/api/')) {
        pdfUrl = pdfUrl.substring(4); // Remove '/api' prefix
      }

      const pdfBlob = await this.http
        .get(pdfUrl, {
          responseType: 'blob',
        })
        .toPromise();

      return pdfBlob || null;
    } catch (error: any) {
      console.error('Failed to preview template:', error);
      throw error;
    }
  }

  /**
   * Validate template syntax
   */
  async validateTemplate(
    templateData: Record<string, any>,
  ): Promise<import('../types/pdf-templates.types').ValidateTemplateResponse> {
    try {
      const response = await this.http
        .post<
          ApiResponse<
            import('../types/pdf-templates.types').ValidateTemplateResponse
          >
        >(`${this.baseUrl}/validate`, { template_data: templateData })
        .toPromise();

      return response?.data || { valid: false };
    } catch (error: any) {
      console.error('Failed to validate template:', error);
      throw error;
    }
  }

  /**
   * Duplicate template
   */
  async duplicateTemplate(
    id: string,
    name: string,
  ): Promise<PdfTemplate | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http
        .post<
          ApiResponse<PdfTemplate>
        >(`${this.baseUrl}/${id}/duplicate`, { name })
        .toPromise();

      if (response?.data) {
        // Add to list
        this.pdfTemplatesListSignal.update((list) => [...list, response.data!]);
        this.totalPdfTemplateSignal.update((total) => total + 1);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.handleError(error, 'Failed to duplicate template');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Search templates
   */
  async searchTemplates(query: string): Promise<PdfTemplate[]> {
    try {
      const httpParams = new HttpParams().set('q', query);

      const response = await this.http
        .get<
          ApiResponse<PdfTemplate[]>
        >(`${this.baseUrl}/search`, { params: httpParams })
        .toPromise();

      return response?.data || [];
    } catch (error: any) {
      console.error('Failed to search templates:', error);
      return [];
    }
  }

  /**
   * Get template versions
   */
  async getTemplateVersions(
    id: string,
  ): Promise<import('../types/pdf-templates.types').TemplateVersion[]> {
    try {
      const response = await this.http
        .get<
          ApiResponse<import('../types/pdf-templates.types').TemplateVersion[]>
        >(`${this.baseUrl}/${id}/versions`)
        .toPromise();

      return response?.data || [];
    } catch (error: any) {
      console.error('Failed to get template versions:', error);
      return [];
    }
  }

  /**
   * Get template statistics
   */
  async getStats(): Promise<
    import('../types/pdf-templates.types').TemplateStats | null
  > {
    try {
      const response = await this.http
        .get<
          ApiResponse<import('../types/pdf-templates.types').TemplateStats>
        >(`${this.baseUrl}/stats`)
        .toPromise();

      return response?.data || null;
    } catch (error: any) {
      console.error('Failed to get template stats:', error);
      return null;
    }
  }

  /**
   * Get template categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await this.http
        .get<ApiResponse<string[]>>(`${this.baseUrl}/categories`)
        .toPromise();

      return response?.data || [];
    } catch (error: any) {
      console.error('Failed to get categories:', error);
      return [];
    }
  }

  /**
   * Get template types
   */
  async getTypes(): Promise<string[]> {
    try {
      const response = await this.http
        .get<ApiResponse<string[]>>(`${this.baseUrl}/types`)
        .toPromise();

      return response?.data || [];
    } catch (error: any) {
      console.error('Failed to get types:', error);
      return [];
    }
  }

  /**
   * Get available Handlebars helpers
   */
  async getHelpers(): Promise<
    import('../types/pdf-templates.types').HandlebarsHelper[]
  > {
    try {
      const response = await this.http
        .get<
          ApiResponse<import('../types/pdf-templates.types').HandlebarsHelper[]>
        >(`${this.baseUrl}/helpers`)
        .toPromise();

      return response?.data || [];
    } catch (error: any) {
      console.error('Failed to get helpers:', error);
      return [];
    }
  }

  /**
   * Get template starters for creating new templates
   */
  async getTemplateStarters(): Promise<PdfTemplate[]> {
    try {
      const response = await this.http
        .get<ApiResponse<PdfTemplate[]>>(`${this.baseUrl}/starters`)
        .toPromise();

      return response?.data || [];
    } catch (error: any) {
      console.error('Failed to get template starters:', error);
      return [];
    }
  }

  /**
   * Get active templates for actual use (excludes template starters)
   */
  async getTemplatesForUse(): Promise<PdfTemplate[]> {
    try {
      const response = await this.http
        .get<ApiResponse<PdfTemplate[]>>(`${this.baseUrl}/for-use`)
        .toPromise();

      return response?.data || [];
    } catch (error: any) {
      console.error('Failed to get templates for use:', error);
      return [];
    }
  }
}
