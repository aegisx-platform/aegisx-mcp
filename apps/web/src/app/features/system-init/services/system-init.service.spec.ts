import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { SystemInitService } from './system-init.service';
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

describe('SystemInitService', () => {
  let service: SystemInitService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api/admin/system-init';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SystemInitService],
    });

    service = TestBed.inject(SystemInitService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ===== SERVICE INITIALIZATION =====

  describe('Service Creation and Initialization', () => {
    it('should create the service', () => {
      expect(service).toBeTruthy();
    });

    it('should be provided as root singleton', () => {
      const service2 = TestBed.inject(SystemInitService);
      expect(service).toBe(service2);
    });

    it('should have correct base URL configured', () => {
      expect(service['baseUrl']).toBe('/api/admin/system-init');
    });

    it('should have HttpClient injected', () => {
      expect(service['http']).toBeTruthy();
    });
  });

  // ===== GET AVAILABLE MODULES =====

  describe('getAvailableModules()', () => {
    const mockData: AvailableModulesResponse = {
      modules: [
        {
          module: 'departments',
          domain: 'master-data',
          displayName: 'Departments',
          displayNameThai: 'สำนัก/ฝ่าย',
          dependencies: [],
          priority: 1,
          importStatus: 'not_started',
          recordCount: 0,
          tags: [],
          supportsRollback: false,
          version: '1.0.0',
        },
        {
          module: 'locations',
          domain: 'master-data',
          displayName: 'Locations',
          displayNameThai: 'สถานที่',
          dependencies: ['departments'],
          priority: 2,
          importStatus: 'completed',
          recordCount: 50,
          tags: [],
          supportsRollback: true,
          version: '1.0.0',
          lastImport: {
            jobId: 'job-123',
            completedAt: '2025-01-01T10:00:00Z',
            importedBy: {
              id: 'user-1',
              name: 'Admin User',
            },
          },
        },
      ],
      totalModules: 2,
      completedModules: 1,
      pendingModules: 1,
    };

    const mockResponse: ApiResponse<AvailableModulesResponse> = {
      success: true,
      data: mockData,
      meta: {
        requestId: 'req-1',
        timestamp: '2025-01-10T10:00:00Z',
        version: '1.0.0',
      },
    };

    it('should make GET request to correct endpoint', () => {
      service.getAvailableModules().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/available-modules`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return typed response', (done) => {
      service.getAvailableModules().subscribe((response) => {
        expect(response).toEqual(mockData);
        expect(response.modules.length).toBe(2);
        expect(response.totalModules).toBe(2);
        expect(response.completedModules).toBe(1);
        done();
      });

      httpMock.expectOne(`${baseUrl}/available-modules`).flush(mockResponse);
    });

    it('should handle empty modules array', (done) => {
      const emptyData: AvailableModulesResponse = {
        modules: [],
        totalModules: 0,
        completedModules: 0,
        pendingModules: 0,
      };

      const emptyResponse: ApiResponse<AvailableModulesResponse> = {
        success: true,
        data: emptyData,
        meta: {
          requestId: 'req-2',
          timestamp: '2025-01-10T10:00:00Z',
          version: '1.0.0',
        },
      };

      service.getAvailableModules().subscribe((response) => {
        expect(response.modules).toEqual([]);
        expect(response.totalModules).toBe(0);
        done();
      });

      httpMock.expectOne(`${baseUrl}/available-modules`).flush(emptyResponse);
    });

    it('should handle HTTP 500 error', (done) => {
      service.getAvailableModules().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.error).toEqual({ message: 'Internal Server Error' });
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/available-modules`)
        .flush(
          { message: 'Internal Server Error' },
          { status: 500, statusText: 'Internal Server Error' },
        );
    });

    it('should handle HTTP 404 error', (done) => {
      service.getAvailableModules().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/available-modules`)
        .flush(null, { status: 404, statusText: 'Not Found' });
    });

    it('should handle malformed response gracefully', (done) => {
      const malformedResponse: ApiResponse<any> = {
        success: true,
        data: {
          /* missing required fields */
        },
        meta: {
          requestId: 'req-3',
          timestamp: '2025-01-10T10:00:00Z',
          version: '1.0.0',
        },
      };

      service.getAvailableModules().subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });

      httpMock
        .expectOne(`${baseUrl}/available-modules`)
        .flush(malformedResponse);
    });

    it('should include module dependencies', (done) => {
      service.getAvailableModules().subscribe((response) => {
        const modulesWithDeps = response.modules.filter(
          (m) => m.dependencies.length > 0,
        );
        expect(modulesWithDeps[0].dependencies).toContain('departments');
        done();
      });

      httpMock.expectOne(`${baseUrl}/available-modules`).flush(mockResponse);
    });

    it('should preserve last import information', (done) => {
      service.getAvailableModules().subscribe((response) => {
        const module = response.modules.find((m) => m.lastImport);
        expect(module?.lastImport?.jobId).toBe('job-123');
        expect(module?.lastImport?.importedBy.name).toBe('Admin User');
        done();
      });

      httpMock.expectOne(`${baseUrl}/available-modules`).flush(mockResponse);
    });
  });

  // ===== GET IMPORT ORDER =====

  describe('getImportOrder()', () => {
    const mockData: ImportOrderResponse = {
      order: [
        { module: 'departments', reason: 'No dependencies' },
        {
          module: 'locations',
          reason: 'Depends on departments',
        },
        {
          module: 'budget_types',
          reason: 'No dependencies',
        },
      ],
    };

    const mockResponse: ApiResponse<ImportOrderResponse> = {
      success: true,
      data: mockData,
      meta: {
        requestId: 'req-4',
        timestamp: '2025-01-10T10:00:00Z',
        version: '1.0.0',
      },
    };

    it('should make GET request to correct endpoint', () => {
      service.getImportOrder().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/import-order`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return typed response with order array', (done) => {
      service.getImportOrder().subscribe((response) => {
        expect(response).toEqual(mockData);
        expect(response.order).toHaveLength(3);
        expect(response.order[0].module).toBe('departments');
        done();
      });

      httpMock.expectOne(`${baseUrl}/import-order`).flush(mockResponse);
    });

    it('should preserve dependency reasons', (done) => {
      service.getImportOrder().subscribe((response) => {
        expect(response.order[1].reason).toBe('Depends on departments');
        done();
      });

      httpMock.expectOne(`${baseUrl}/import-order`).flush(mockResponse);
    });

    it('should handle empty order array', (done) => {
      const emptyData: ImportOrderResponse = { order: [] };
      const emptyResponse: ApiResponse<ImportOrderResponse> = {
        success: true,
        data: emptyData,
        meta: {
          requestId: 'req-5',
          timestamp: '2025-01-10T10:00:00Z',
          version: '1.0.0',
        },
      };

      service.getImportOrder().subscribe((response) => {
        expect(response.order).toEqual([]);
        done();
      });

      httpMock.expectOne(`${baseUrl}/import-order`).flush(emptyResponse);
    });

    it('should handle HTTP 400 error', (done) => {
      service.getImportOrder().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/import-order`)
        .flush(null, { status: 400, statusText: 'Bad Request' });
    });
  });

  // ===== GET DASHBOARD =====

  describe('getDashboard()', () => {
    const mockData: DashboardResponse = {
      overview: {
        totalModules: 5,
        completedModules: 2,
        inProgressModules: 1,
        pendingModules: 2,
        totalRecordsImported: 1500,
      },
      modulesByDomain: {
        'master-data': { total: 3, completed: 2 },
        operations: { total: 2, completed: 0 },
      },
      recentImports: [
        {
          jobId: 'job-001',
          module: 'departments',
          status: 'completed',
          recordsImported: 45,
          completedAt: '2025-01-10T15:30:00Z',
          importedBy: { id: 'user-1', name: 'John Admin' },
        },
      ],
      nextRecommended: [
        { module: 'budget_types', reason: 'No dependencies' },
        { module: 'locations', reason: 'Depends on departments' },
      ],
    };

    const mockResponse: ApiResponse<DashboardResponse> = {
      success: true,
      data: mockData,
      meta: {
        requestId: 'req-6',
        timestamp: '2025-01-10T10:00:00Z',
        version: '1.0.0',
      },
    };

    it('should make GET request to correct endpoint', () => {
      service.getDashboard().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/dashboard`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return typed dashboard response', (done) => {
      service.getDashboard().subscribe((response) => {
        expect(response).toEqual(mockData);
        expect(response.overview.totalModules).toBe(5);
        expect(response.overview.totalRecordsImported).toBe(1500);
        done();
      });

      httpMock.expectOne(`${baseUrl}/dashboard`).flush(mockResponse);
    });

    it('should include overview statistics', (done) => {
      service.getDashboard().subscribe((response) => {
        const overview = response.overview;
        expect(overview.completedModules).toBe(2);
        expect(overview.inProgressModules).toBe(1);
        expect(overview.pendingModules).toBe(2);
        done();
      });

      httpMock.expectOne(`${baseUrl}/dashboard`).flush(mockResponse);
    });

    it('should include modules by domain breakdown', (done) => {
      service.getDashboard().subscribe((response) => {
        expect(response.modulesByDomain['master-data']).toEqual({
          total: 3,
          completed: 2,
        });
        done();
      });

      httpMock.expectOne(`${baseUrl}/dashboard`).flush(mockResponse);
    });

    it('should include recent imports', (done) => {
      service.getDashboard().subscribe((response) => {
        expect(response.recentImports).toHaveLength(1);
        expect(response.recentImports[0].jobId).toBe('job-001');
        done();
      });

      httpMock.expectOne(`${baseUrl}/dashboard`).flush(mockResponse);
    });

    it('should include next recommended modules', (done) => {
      service.getDashboard().subscribe((response) => {
        expect(response.nextRecommended).toHaveLength(2);
        expect(response.nextRecommended[0].module).toBe('budget_types');
        expect(response.nextRecommended[0].reason).toBe('No dependencies');
        expect(response.nextRecommended[1].module).toBe('locations');
        expect(response.nextRecommended[1].reason).toBe(
          'Depends on departments',
        );
        done();
      });

      httpMock.expectOne(`${baseUrl}/dashboard`).flush(mockResponse);
    });

    it('should handle HTTP 401 Unauthorized', (done) => {
      service.getDashboard().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/dashboard`)
        .flush(null, { status: 401, statusText: 'Unauthorized' });
    });
  });

  // ===== DOWNLOAD TEMPLATE =====

  describe('downloadTemplate(moduleName, format)', () => {
    it('should make GET request with correct URL and params for csv', () => {
      service.downloadTemplate('departments', 'csv').subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/module/departments/template?format=csv`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('format')).toBe('csv');
      expect(req.request.responseType).toBe('blob');

      req.flush(new Blob(['test']));
    });

    it('should make GET request with correct URL and params for xlsx', () => {
      service.downloadTemplate('locations', 'xlsx').subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/module/locations/template?format=xlsx`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('format')).toBe('xlsx');
      expect(req.request.responseType).toBe('blob');

      req.flush(new Blob(['test']));
    });

    it('should return Blob response', (done) => {
      const mockBlob = new Blob(['CSV data'], { type: 'text/csv' });

      service.downloadTemplate('departments', 'csv').subscribe((blob) => {
        expect(blob).toEqual(mockBlob);
        expect(blob.type).toBe('text/csv');
        done();
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/template?format=csv`)
        .flush(mockBlob);
    });

    it('should handle blob response type correctly', (done) => {
      const excelBlob = new Blob(['Excel data'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      service.downloadTemplate('budget_types', 'xlsx').subscribe((blob) => {
        expect(blob instanceof Blob).toBe(true);
        expect(blob.type).toContain('spreadsheet');
        done();
      });

      httpMock
        .expectOne(`${baseUrl}/module/budget_types/template?format=xlsx`)
        .flush(excelBlob);
    });

    it('should include module name in URL path', (done) => {
      service.downloadTemplate('custom_module', 'csv').subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/module/custom_module/template?format=csv`,
      );
      expect(req.request.url).toContain('custom_module');
      done();

      req.flush(new Blob());
    });

    it('should handle HTTP 404 for non-existent module', (done) => {
      service.downloadTemplate('nonexistent', 'csv').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/module/nonexistent/template?format=csv`)
        .flush(null, { status: 404, statusText: 'Not Found' });
    });

    it('should handle HTTP 400 for invalid format', (done) => {
      service.downloadTemplate('departments', 'invalid' as any).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/template?format=invalid`)
        .flush(null, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle server error during download', (done) => {
      service.downloadTemplate('departments', 'csv').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/template?format=csv`)
        .flush(null, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  // ===== VALIDATE FILE =====

  describe('validateFile(moduleName, file)', () => {
    const mockValidationResult: ValidationResult = {
      sessionId: 'session-123',
      isValid: true,
      errors: [],
      warnings: [],
      stats: {
        totalRows: 100,
        validRows: 100,
        errorRows: 0,
      },
      expiresAt: '2025-01-15T10:00:00Z',
      canProceed: true,
    };

    let mockFile: File;

    beforeEach(() => {
      mockFile = new File(['test content'], 'departments.csv', {
        type: 'text/csv',
      });
    });

    it('should make POST request with FormData', (done) => {
      service.validateFile('departments', mockFile).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/module/departments/validate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      done();

      req.flush(mockValidationResult);
    });

    it('should append file to FormData with correct field name', (done) => {
      service.validateFile('locations', mockFile).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/module/locations/validate`);
      const formData = req.request.body as FormData;

      expect(formData.get('file')).toBe(mockFile);
      done();

      req.flush(mockValidationResult);
    });

    it('should return ValidationResult with sessionId', (done) => {
      service.validateFile('departments', mockFile).subscribe((result) => {
        expect(result).toEqual(mockValidationResult);
        expect(result.sessionId).toBe('session-123');
        expect(result.isValid).toBe(true);
        done();
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/validate`)
        .flush(mockValidationResult);
    });

    it('should handle validation errors', (done) => {
      const errorResult: ValidationResult = {
        sessionId: null,
        isValid: false,
        errors: [
          {
            row: 5,
            field: 'code',
            message: 'Code is required',
            severity: 'ERROR',
            code: 'REQUIRED_FIELD_MISSING',
          },
        ],
        warnings: [],
        stats: {
          totalRows: 100,
          validRows: 99,
          errorRows: 1,
        },
        expiresAt: '2025-01-15T10:00:00Z',
        canProceed: false,
      };

      service.validateFile('departments', mockFile).subscribe((result) => {
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].field).toBe('code');
        expect(result.canProceed).toBe(false);
        done();
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/validate`)
        .flush(errorResult);
    });

    it('should handle validation warnings', (done) => {
      const warningResult: ValidationResult = {
        sessionId: 'session-456',
        isValid: true,
        errors: [],
        warnings: [
          {
            row: 10,
            field: 'notes',
            message: 'Empty optional field',
            severity: 'WARNING',
            code: 'EMPTY_OPTIONAL_FIELD',
          },
        ],
        stats: {
          totalRows: 100,
          validRows: 100,
          errorRows: 0,
        },
        expiresAt: '2025-01-15T10:00:00Z',
        canProceed: true,
      };

      service.validateFile('departments', mockFile).subscribe((result) => {
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].severity).toBe('WARNING');
        expect(result.canProceed).toBe(true);
        done();
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/validate`)
        .flush(warningResult);
    });

    it('should preserve file statistics in response', (done) => {
      service.validateFile('departments', mockFile).subscribe((result) => {
        expect(result.stats.totalRows).toBe(100);
        expect(result.stats.validRows).toBe(100);
        expect(result.stats.errorRows).toBe(0);
        done();
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/validate`)
        .flush(mockValidationResult);
    });

    it('should handle large files', (done) => {
      const largeFileContent = new Array(10000).fill('x').join('');
      const largeFile = new File([largeFileContent], 'large_data.csv', {
        type: 'text/csv',
      });

      service.validateFile('departments', largeFile).subscribe((result) => {
        expect(result).toBeDefined();
        done();
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/validate`)
        .flush(mockValidationResult);
    });

    it('should handle HTTP 422 validation failure', (done) => {
      service.validateFile('departments', mockFile).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(422);
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/validate`)
        .flush(null, { status: 422, statusText: 'Unprocessable Entity' });
    });

    it('should handle HTTP 413 file too large', (done) => {
      service.validateFile('departments', mockFile).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(413);
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/validate`)
        .flush(null, { status: 413, statusText: 'Payload Too Large' });
    });

    it('should not set Content-Type header for FormData', (done) => {
      service.validateFile('departments', mockFile).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/module/departments/validate`);
      // Browser automatically sets multipart/form-data with boundary
      expect(req.request.headers.has('Content-Type')).toBe(false);
      done();

      req.flush(mockValidationResult);
    });
  });

  // ===== IMPORT DATA =====

  describe('importData(moduleName, sessionId, options)', () => {
    const mockResponse: ImportJobResponse = {
      jobId: 'job-456',
      status: 'queued',
      message: 'Import job created successfully',
    };

    const importOptions: ImportOptions = {
      skipWarnings: false,
      batchSize: 50,
      onConflict: 'skip',
    };

    it('should make POST request to correct endpoint', () => {
      service
        .importData('departments', 'session-123', importOptions)
        .subscribe();

      const req = httpMock.expectOne(`${baseUrl}/module/departments/import`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should send sessionId in request body', (done) => {
      service
        .importData('departments', 'session-789', importOptions)
        .subscribe();

      const req = httpMock.expectOne(`${baseUrl}/module/departments/import`);
      const body = req.request.body as any;

      expect(body.sessionId).toBe('session-789');
      done();

      req.flush(mockResponse);
    });

    it('should send import options in request body', (done) => {
      service.importData('locations', 'session-123', importOptions).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/module/locations/import`);
      const body = req.request.body as any;

      expect(body.options).toEqual(importOptions);
      expect(body.options.skipWarnings).toBe(false);
      expect(body.options.batchSize).toBe(50);
      expect(body.options.onConflict).toBe('skip');
      done();

      req.flush(mockResponse);
    });

    it('should return ImportJobResponse with jobId', (done) => {
      service
        .importData('departments', 'session-123', importOptions)
        .subscribe((response) => {
          expect(response).toEqual(mockResponse);
          expect(response.jobId).toBe('job-456');
          expect(response.status).toBe('queued');
          done();
        });

      httpMock
        .expectOne(`${baseUrl}/module/departments/import`)
        .flush(mockResponse);
    });

    it('should handle skip warnings option', (done) => {
      const skipWarningsOptions: ImportOptions = {
        skipWarnings: true,
        batchSize: 100,
        onConflict: 'update',
      };

      service
        .importData('budget_types', 'session-456', skipWarningsOptions)
        .subscribe();

      const req = httpMock.expectOne(`${baseUrl}/module/budget_types/import`);
      const body = req.request.body as any;

      expect(body.options.skipWarnings).toBe(true);
      expect(body.options.onConflict).toBe('update');
      done();

      req.flush(mockResponse);
    });

    it('should handle different onConflict strategies', (done) => {
      const errorConflictOptions: ImportOptions = {
        skipWarnings: false,
        batchSize: 50,
        onConflict: 'error',
      };

      service
        .importData('departments', 'session-123', errorConflictOptions)
        .subscribe();

      const req = httpMock.expectOne(`${baseUrl}/module/departments/import`);
      const body = req.request.body as any;

      expect(body.options.onConflict).toBe('error');
      done();

      req.flush(mockResponse);
    });

    it('should return status running for active job', (done) => {
      const runningResponse: ImportJobResponse = {
        jobId: 'job-789',
        status: 'running',
        message: 'Import job is processing',
      };

      service
        .importData('departments', 'session-123', importOptions)
        .subscribe((response) => {
          expect(response.status).toBe('running');
          done();
        });

      httpMock
        .expectOne(`${baseUrl}/module/departments/import`)
        .flush(runningResponse);
    });

    it('should handle HTTP 400 for invalid session', (done) => {
      service
        .importData('departments', 'invalid-session', importOptions)
        .subscribe({
          next: () => fail('should have failed'),
          error: (error) => {
            expect(error.status).toBe(400);
            done();
          },
        });

      httpMock
        .expectOne(`${baseUrl}/module/departments/import`)
        .flush(
          { message: 'Invalid session' },
          { status: 400, statusText: 'Bad Request' },
        );
    });

    it('should handle HTTP 409 conflict', (done) => {
      service
        .importData('departments', 'session-123', importOptions)
        .subscribe({
          next: () => fail('should have failed'),
          error: (error) => {
            expect(error.status).toBe(409);
            done();
          },
        });

      httpMock
        .expectOne(`${baseUrl}/module/departments/import`)
        .flush(null, { status: 409, statusText: 'Conflict' });
    });

    it('should handle module not found error', (done) => {
      service
        .importData('nonexistent', 'session-123', importOptions)
        .subscribe({
          next: () => fail('should have failed'),
          error: (error) => {
            expect(error.status).toBe(404);
            done();
          },
        });

      httpMock
        .expectOne(`${baseUrl}/module/nonexistent/import`)
        .flush(null, { status: 404, statusText: 'Not Found' });
    });
  });

  // ===== GET IMPORT STATUS =====

  describe('getImportStatus(moduleName, jobId)', () => {
    const mockStatus: ImportStatus = {
      jobId: 'job-456',
      status: 'running',
      progress: {
        totalRows: 1000,
        importedRows: 500,
        errorRows: 5,
        currentRow: 505,
        percentComplete: 50.5,
      },
      startedAt: '2025-01-10T10:00:00Z',
      completedAt: undefined,
      error: undefined,
    };

    it('should make GET request to correct endpoint', () => {
      service.getImportStatus('departments', 'job-456').subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/module/departments/status/job-456`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockStatus);
    });

    it('should include module name in URL', (done) => {
      service.getImportStatus('locations', 'job-123').subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/module/locations/status/job-123`,
      );
      expect(req.request.url).toContain('locations');
      done();

      req.flush(mockStatus);
    });

    it('should include jobId in URL path', (done) => {
      service.getImportStatus('departments', 'job-999').subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/module/departments/status/job-999`,
      );
      expect(req.request.url).toContain('job-999');
      done();

      req.flush(mockStatus);
    });

    it('should return ImportStatus with progress information', (done) => {
      service.getImportStatus('departments', 'job-456').subscribe((status) => {
        expect(status).toEqual(mockStatus);
        expect(status.progress.totalRows).toBe(1000);
        expect(status.progress.importedRows).toBe(500);
        expect(status.progress.percentComplete).toBe(50.5);
        done();
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/status/job-456`)
        .flush(mockStatus);
    });

    it('should return completed status', (done) => {
      const completedStatus: ImportStatus = {
        jobId: 'job-456',
        status: 'completed',
        progress: {
          totalRows: 1000,
          importedRows: 1000,
          errorRows: 0,
          currentRow: 1000,
          percentComplete: 100,
        },
        startedAt: '2025-01-10T10:00:00Z',
        completedAt: '2025-01-10T10:30:00Z',
        error: undefined,
      };

      service.getImportStatus('departments', 'job-456').subscribe((status) => {
        expect(status.status).toBe('completed');
        expect(status.progress.percentComplete).toBe(100);
        expect(status.completedAt).toBeDefined();
        done();
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/status/job-456`)
        .flush(completedStatus);
    });

    it('should return failed status with error message', (done) => {
      const failedStatus: ImportStatus = {
        jobId: 'job-456',
        status: 'failed',
        progress: {
          totalRows: 1000,
          importedRows: 250,
          errorRows: 25,
          currentRow: 275,
          percentComplete: 27.5,
        },
        startedAt: '2025-01-10T10:00:00Z',
        completedAt: '2025-01-10T10:05:00Z',
        error: 'Database connection lost',
      };

      service.getImportStatus('departments', 'job-456').subscribe((status) => {
        expect(status.status).toBe('failed');
        expect(status.error).toBe('Database connection lost');
        done();
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/status/job-456`)
        .flush(failedStatus);
    });

    it('should return queued status', (done) => {
      const queuedStatus: ImportStatus = {
        jobId: 'job-456',
        status: 'queued',
        progress: {
          totalRows: 1000,
          importedRows: 0,
          errorRows: 0,
          currentRow: 0,
          percentComplete: 0,
        },
        startedAt: '2025-01-10T10:00:00Z',
        completedAt: undefined,
        error: undefined,
      };

      service.getImportStatus('departments', 'job-456').subscribe((status) => {
        expect(status.status).toBe('queued');
        expect(status.progress.percentComplete).toBe(0);
        done();
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/status/job-456`)
        .flush(queuedStatus);
    });

    it('should handle HTTP 404 for non-existent job', (done) => {
      service.getImportStatus('departments', 'job-invalid').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/status/job-invalid`)
        .flush(null, { status: 404, statusText: 'Not Found' });
    });

    it('should handle session expired error', (done) => {
      service.getImportStatus('departments', 'job-456').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(410);
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/status/job-456`)
        .flush(null, { status: 410, statusText: 'Gone' });
    });
  });

  // ===== ROLLBACK IMPORT =====

  describe('rollbackImport(moduleName, jobId)', () => {
    it('should make DELETE request to correct endpoint', () => {
      service.rollbackImport('departments', 'job-456').subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/module/departments/rollback/job-456`,
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should include module name in URL', (done) => {
      service.rollbackImport('locations', 'job-123').subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/module/locations/rollback/job-123`,
      );
      expect(req.request.url).toContain('locations');
      done();

      req.flush(null);
    });

    it('should include jobId in URL path', (done) => {
      service.rollbackImport('departments', 'job-999').subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/module/departments/rollback/job-999`,
      );
      expect(req.request.url).toContain('job-999');
      done();

      req.flush(null);
    });

    it('should handle void response', (done) => {
      service.rollbackImport('departments', 'job-456').subscribe((result) => {
        expect(result).toBeNull();
        done();
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/rollback/job-456`)
        .flush(null);
    });

    it('should complete successfully without response data', (done) => {
      let completed = false;

      service.rollbackImport('departments', 'job-456').subscribe({
        next: () => {
          completed = true;
        },
        complete: () => {
          expect(completed).toBe(true);
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/rollback/job-456`)
        .flush(null);
    });

    it('should handle HTTP 404 for non-existent job', (done) => {
      service.rollbackImport('departments', 'job-invalid').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/rollback/job-invalid`)
        .flush(null, { status: 404, statusText: 'Not Found' });
    });

    it('should handle HTTP 409 conflict for already completed job', (done) => {
      service.rollbackImport('departments', 'job-456').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(409);
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/rollback/job-456`)
        .flush(null, { status: 409, statusText: 'Conflict' });
    });

    it('should handle HTTP 400 for invalid module', (done) => {
      service.rollbackImport('invalid-module', 'job-456').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/module/invalid-module/rollback/job-456`)
        .flush(null, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle HTTP 403 permission denied', (done) => {
      service.rollbackImport('departments', 'job-456').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(403);
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/module/departments/rollback/job-456`)
        .flush(null, { status: 403, statusText: 'Forbidden' });
    });
  });

  // ===== GET HEALTH STATUS =====

  describe('getHealthStatus()', () => {
    const mockHealthStatusData: HealthStatusData = {
      isHealthy: true,
      validationErrors: [],
      circularDependencies: [],
    };

    const mockHealthResponse: ApiResponse<HealthStatusData> = {
      success: true,
      data: mockHealthStatusData,
      meta: {
        requestId: 'req-123',
        timestamp: '2025-01-10T10:00:00Z',
        version: '1.0.0',
      },
    };

    it('should make GET request to health-status endpoint', () => {
      service.getHealthStatus().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/health-status`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHealthResponse);
    });

    it('should unwrap and return HealthStatusData', (done) => {
      service.getHealthStatus().subscribe((health) => {
        expect(health).toEqual(mockHealthStatusData);
        expect(health.isHealthy).toBe(true);
        expect(health.validationErrors).toEqual([]);
        done();
      });

      httpMock.expectOne(`${baseUrl}/health-status`).flush(mockHealthResponse);
    });

    it('should return healthy status with no errors', (done) => {
      service.getHealthStatus().subscribe((health) => {
        expect(health.isHealthy).toBe(true);
        expect(health.validationErrors).toHaveLength(0);
        expect(health.circularDependencies).toHaveLength(0);
        done();
      });

      httpMock.expectOne(`${baseUrl}/health-status`).flush(mockHealthResponse);
    });

    it('should return unhealthy status with validation errors', (done) => {
      const unhealthyResponse: ApiResponse<HealthStatusData> = {
        success: true,
        data: {
          isHealthy: false,
          validationErrors: [
            'Department must have a name',
            'Location code is required',
          ],
          circularDependencies: [],
        },
        meta: {
          requestId: 'req-124',
          timestamp: '2025-01-10T10:00:00Z',
          version: '1.0.0',
        },
      };

      service.getHealthStatus().subscribe((health) => {
        expect(health.isHealthy).toBe(false);
        expect(health.validationErrors).toHaveLength(2);
        expect(health.validationErrors[0]).toBe('Department must have a name');
        done();
      });

      httpMock.expectOne(`${baseUrl}/health-status`).flush(unhealthyResponse);
    });

    it('should report circular dependencies', (done) => {
      const circularDepsResponse: ApiResponse<HealthStatusData> = {
        success: true,
        data: {
          isHealthy: false,
          validationErrors: [],
          circularDependencies: [
            { path: ['departments', 'locations', 'departments'] },
            { path: ['budgets', 'allocations', 'budgets'] },
          ],
        },
        meta: {
          requestId: 'req-125',
          timestamp: '2025-01-10T10:00:00Z',
          version: '1.0.0',
        },
      };

      service.getHealthStatus().subscribe((health) => {
        expect(health.circularDependencies).toHaveLength(2);
        expect(health.circularDependencies[0].path).toEqual([
          'departments',
          'locations',
          'departments',
        ]);
        done();
      });

      httpMock
        .expectOne(`${baseUrl}/health-status`)
        .flush(circularDepsResponse);
    });

    it('should handle HTTP 503 service unavailable', (done) => {
      service.getHealthStatus().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(503);
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/health-status`)
        .flush(null, { status: 503, statusText: 'Service Unavailable' });
    });

    it('should handle HTTP 500 server error', (done) => {
      service.getHealthStatus().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/health-status`)
        .flush(null, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  // ===== INTEGRATION TESTS =====

  describe('Multiple Requests in Sequence', () => {
    it('should handle multiple sequential HTTP calls', (done) => {
      const mockModules: ApiResponse<AvailableModulesResponse> = {
        success: true,
        data: {
          modules: [],
          totalModules: 0,
          completedModules: 0,
          pendingModules: 0,
        },
        meta: {
          requestId: 'req-1',
          timestamp: '2025-01-10T10:00:00Z',
          version: '1.0.0',
        },
      };

      const mockHealth: ApiResponse<HealthStatusData> = {
        success: true,
        data: {
          isHealthy: true,
          validationErrors: [],
          circularDependencies: [],
        },
        meta: {
          requestId: 'req-2',
          timestamp: '2025-01-10T10:00:00Z',
          version: '1.0.0',
        },
      };

      service.getAvailableModules().subscribe(() => {
        service.getHealthStatus().subscribe((health) => {
          expect(health.isHealthy).toBe(true);
          done();
        });

        httpMock.expectOne(`${baseUrl}/health-status`).flush(mockHealth);
      });

      httpMock.expectOne(`${baseUrl}/available-modules`).flush(mockModules);
    });

    it('should handle parallel HTTP calls', () => {
      const mockModules: AvailableModulesResponse = {
        modules: [],
        totalModules: 0,
        completedModules: 0,
        pendingModules: 0,
      };

      const mockOrder: ImportOrderResponse = {
        order: [],
      };

      service.getAvailableModules().subscribe();
      service.getImportOrder().subscribe();

      const requests = httpMock.match((req) => req.url.includes(`${baseUrl}`));

      expect(requests).toHaveLength(2);
      requests[0].flush(mockModules);
      requests[1].flush(mockOrder);
    });
  });

  // ===== ERROR HANDLING AND EDGE CASES =====

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors', (done) => {
      service.getAvailableModules().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/available-modules`)
        .error(new ErrorEvent('Network error'));
    });

    it('should handle timeout errors', (done) => {
      service.getAvailableModules().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        },
      });

      httpMock
        .expectOne(`${baseUrl}/available-modules`)
        .error(new ErrorEvent('Timeout'));
    });

    it('should handle JSON parsing errors', (done) => {
      service.getAvailableModules().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/available-modules`);
      req.flush('invalid json', { status: 200, statusText: 'OK' });
    });
  });
});
