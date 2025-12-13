// ===== IMPORT MODULE TYPES =====

export interface ImportModule {
  module: string;
  domain: string;
  subdomain?: string;
  displayName: string;
  displayNameThai?: string;
  dependencies: string[];
  priority: number;
  importStatus: ImportModuleStatus;
  recordCount: number;
  lastImport?: {
    jobId: string;
    completedAt: string;
    importedBy: {
      id: string;
      name: string;
    };
  };
}

export type ImportModuleStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'failed';

// ===== DASHBOARD RESPONSE TYPES =====

export interface AvailableModulesResponse {
  modules: ImportModule[];
  totalModules: number;
  completedModules: number;
  pendingModules: number;
}

export interface ImportOrderResponse {
  order: Array<{
    module: string;
    reason: string;
  }>;
}

export interface DashboardResponse {
  overview: {
    totalModules: number;
    completedModules: number;
    inProgressModules: number;
    pendingModules: number;
    totalRecordsImported: number;
  };
  modulesByDomain: Record<string, {
    total: number;
    completed: number;
  }>;
  recentImports: ImportHistoryItem[];
  nextRecommended: string[];
}

// ===== IMPORT HISTORY TYPES =====

export interface ImportHistoryItem {
  jobId: string;
  module: string;
  status: ImportJobStatus;
  recordsImported: number;
  completedAt: string;
  importedBy: {
    id: string;
    name: string;
  };
  error?: string;
}

export type ImportJobStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

// ===== VALIDATION TYPES =====

export interface ValidationResult {
  sessionId: string | null;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: {
    totalRows: number;
    validRows: number;
    errorRows: number;
  };
  expiresAt: string;
  canProceed: boolean;
}

export interface ValidationError {
  row?: number;
  field?: string;
  message: string;
  severity: 'ERROR';
  code: string;
  data?: any;
}

export interface ValidationWarning {
  row?: number;
  field?: string;
  message: string;
  severity: 'WARNING';
  code: string;
  data?: any;
}

// ===== IMPORT JOB TYPES =====

export interface ImportOptions {
  skipWarnings: boolean;
  batchSize: number;
  onConflict: 'skip' | 'update' | 'error';
}

export interface ImportJobResponse {
  jobId: string;
  status: ImportJobStatus;
  message: string;
}

export interface ImportStatus {
  jobId: string;
  status: ImportJobStatus;
  progress: {
    totalRows: number;
    importedRows: number;
    errorRows: number;
    currentRow: number;
    percentComplete: number;
  };
  startedAt: string;
  completedAt?: string;
  error?: string;
}

// ===== HEALTH CHECK TYPES =====

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  discoveredServices: number;
  lastDiscoveryTime: string;
  services: Array<{
    module: string;
    status: 'active' | 'inactive';
  }>;
}
