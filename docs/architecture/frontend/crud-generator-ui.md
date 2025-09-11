# Frontend CRUD Generator UI Integration

## Code Generator Service

```typescript
// libs/code-generator/src/lib/services/code-generator.service.ts
@Injectable({ providedIn: 'root' })
export class CodeGeneratorService {
  private apiService = inject(ApiService);

  // Generator state signals
  private availableTablesSignal = signal<DatabaseTable[]>([]);
  private selectedTableSignal = signal<DatabaseTable | null>(null);
  private generationProgressSignal = signal<GenerationProgress | null>(null);
  private generatedFilesSignal = signal<GeneratedFile[]>([]);
  private loadingSignal = signal<boolean>(false);

  readonly availableTables = this.availableTablesSignal.asReadonly();
  readonly selectedTable = this.selectedTableSignal.asReadonly();
  readonly generationProgress = this.generationProgressSignal.asReadonly();
  readonly generatedFiles = this.generatedFilesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  // Computed signals
  readonly hasSelection = computed(() => this.selectedTable() !== null);
  readonly canGenerate = computed(() => {
    const table = this.selectedTable();
    return table && table.columns.length > 0;
  });

  readonly generationComplete = computed(() => {
    const progress = this.generationProgress();
    return progress?.status === 'completed';
  });

  async loadAvailableTables(): Promise<void> {
    this.loadingSignal.set(true);

    try {
      const tables = await this.apiService.get<DatabaseTable[]>('/api/generator/tables');
      this.availableTablesSignal.set(tables);
    } catch (error) {
      console.error('Failed to load tables:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadTableDetails(tableName: string): Promise<void> {
    this.loadingSignal.set(true);

    try {
      const table = await this.apiService.get<DatabaseTable>(`/api/generator/tables/${tableName}`);
      this.selectedTableSignal.set(table);
    } catch (error) {
      console.error('Failed to load table details:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async generateFrontendCrud(tableName: string, options: FrontendGenerationOptions): Promise<GenerationResult> {
    this.loadingSignal.set(true);
    this.generationProgressSignal.set({
      status: 'started',
      progress: 0,
      currentStep: 'Analyzing table structure',
    });

    try {
      // Start generation
      const result = await this.apiService.post<GenerationResult>('/api/generator/frontend', {
        tableName,
        ...options,
      });

      this.generatedFilesSignal.set(result.files);
      this.generationProgressSignal.set({
        status: 'completed',
        progress: 100,
        currentStep: 'Generation completed',
      });

      return result;
    } catch (error) {
      this.generationProgressSignal.set({
        status: 'failed',
        progress: 0,
        currentStep: 'Generation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async generateFullStack(tableName: string, options: FullStackGenerationOptions): Promise<GenerationResult> {
    const result = await this.apiService.post<GenerationResult>('/api/generator/fullstack', {
      tableName,
      ...options,
    });

    this.generatedFilesSignal.set(result.files);
    return result;
  }

  async previewGeneration(tableName: string, options: FrontendGenerationOptions): Promise<GeneratedFile[]> {
    return await this.apiService.post<GeneratedFile[]>('/api/generator/preview', {
      tableName,
      ...options,
      dryRun: true,
    });
  }

  downloadGeneratedCode(): void {
    const files = this.generatedFiles();
    if (files.length === 0) return;

    // Create zip file with all generated files
    this.createAndDownloadZip(files);
  }

  private createAndDownloadZip(files: GeneratedFile[]): void {
    // Implementation using JSZip or similar library
    const zip = new JSZip();

    files.forEach((file) => {
      zip.file(file.path, file.content);
    });

    zip.generateAsync({ type: 'blob' }).then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-code-${Date.now()}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  clearGeneration(): void {
    this.selectedTableSignal.set(null);
    this.generationProgressSignal.set(null);
    this.generatedFilesSignal.set([]);
  }
}

interface DatabaseTable {
  name: string;
  columns: TableColumn[];
  foreignKeys: ForeignKey[];
  indexes: TableIndex[];
  primaryKey: string;
  displayName: string;
  description?: string;
}

interface TableColumn {
  name: string;
  type: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  defaultValue?: any;
  maxLength?: number;
  isAutoIncrement: boolean;
}

interface ForeignKey {
  column: string;
  referencedTable: string;
  referencedColumn: string;
  constraintName: string;
}

interface TableIndex {
  name: string;
  columns: string[];
  isUnique: boolean;
}

interface FrontendGenerationOptions {
  generateList: boolean;
  generateForm: boolean;
  generateDetail: boolean;
  generateService: boolean;
  generateRoutes: boolean;
  generateTests: boolean;
  useStandalone: boolean;
  useMaterial: boolean;
  useTailwind: boolean;
  includePermissions: boolean;
  moduleName?: string;
  componentPrefix?: string;
}

interface FullStackGenerationOptions extends FrontendGenerationOptions {
  generateBackend: boolean;
  generateApi: boolean;
  generateDatabase: boolean;
  includeValidation: boolean;
  includeAudit: boolean;
}

interface GenerationProgress {
  status: 'started' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  error?: string;
}

interface GeneratedFile {
  path: string;
  content: string;
  type: 'component' | 'service' | 'model' | 'route' | 'test';
  language: 'typescript' | 'html' | 'scss';
}

interface GenerationResult {
  success: boolean;
  files: GeneratedFile[];
  summary: {
    componentsGenerated: number;
    servicesGenerated: number;
    testsGenerated: number;
    totalFiles: number;
  };
  warnings?: string[];
}
```

## CRUD Generator Component

```typescript
// apps/admin-portal/src/app/features/code-generator/components/crud-generator.component.ts
@Component({
  selector: 'app-crud-generator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatStepperModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatCheckboxModule, MatButtonModule, MatCardModule, MatIconModule, MatListModule, MatProgressBarModule, MatTabsModule, MatExpansionModule, MonacoEditorModule],
  template: `
    <div class="crud-generator p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">CRUD Generator</h1>
        <button mat-button (click)="reset()" [disabled]="loading()">
          <mat-icon>refresh</mat-icon>
          Reset
        </button>
      </div>

      <mat-stepper [linear]="true" #stepper>
        <!-- Step 1: Select Table -->
        <mat-step [stepControl]="tableSelectionForm" label="Select Table">
          <form [formGroup]="tableSelectionForm">
            <div class="step-content space-y-4">
              <p class="text-gray-600">Choose a database table to generate CRUD operations for:</p>

              @if (loading()) {
                <mat-progress-bar mode="indeterminate"></mat-progress-bar>
              }

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Database Table</mat-label>
                <mat-select formControlName="tableName" (selectionChange)="onTableSelect($event.value)">
                  @for (table of availableTables(); track table.name) {
                    <mat-option [value]="table.name">
                      <div class="flex flex-col">
                        <span class="font-medium">{{ table.displayName }}</span>
                        <span class="text-xs text-gray-500">{{ table.name }} ({{ table.columns.length }} columns)</span>
                      </div>
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <!-- Table Details -->
              @if (selectedTable()) {
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>Table Structure</mat-card-title>
                    <mat-card-subtitle>{{ selectedTable()!.name }}</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="table-columns">
                      @for (column of selectedTable()!.columns; track column.name) {
                        <div class="flex items-center justify-between py-2 border-b">
                          <div class="flex-1">
                            <span class="font-medium">{{ column.name }}</span>
                            @if (column.isPrimaryKey) {
                              <mat-chip class="ml-2" color="primary">PK</mat-chip>
                            }
                          </div>
                          <div class="text-sm text-gray-600">
                            {{ column.type }}
                            @if (!column.isNullable) {
                              <span class="text-red-600 ml-1">*</span>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </mat-card-content>
                </mat-card>
              }

              <div class="flex justify-end">
                <button mat-raised-button color="primary" [disabled]="!hasSelection()" matStepperNext>Next</button>
              </div>
            </div>
          </form>
        </mat-step>

        <!-- Step 2: Configure Generation -->
        <mat-step [stepControl]="optionsForm" label="Configure Options">
          <form [formGroup]="optionsForm">
            <div class="step-content space-y-4">
              <p class="text-gray-600">Configure what components to generate:</p>

              <!-- Component Options -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Components to Generate</mat-card-title>
                </mat-card-header>
                <mat-card-content class="space-y-2">
                  <mat-checkbox formControlName="generateList"> List Component (Data table with pagination) </mat-checkbox>
                  <mat-checkbox formControlName="generateForm"> Form Component (Create/Edit form) </mat-checkbox>
                  <mat-checkbox formControlName="generateDetail"> Detail Component (View details) </mat-checkbox>
                  <mat-checkbox formControlName="generateService"> Service (Data management with signals) </mat-checkbox>
                  <mat-checkbox formControlName="generateRoutes"> Routes (Routing configuration) </mat-checkbox>
                  <mat-checkbox formControlName="generateTests"> Tests (Unit tests for components) </mat-checkbox>
                </mat-card-content>
              </mat-card>

              <!-- Style Options -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Styling & Architecture</mat-card-title>
                </mat-card-header>
                <mat-card-content class="space-y-2">
                  <mat-checkbox formControlName="useStandalone"> Standalone Components (Angular 19+) </mat-checkbox>
                  <mat-checkbox formControlName="useMaterial"> Angular Material UI </mat-checkbox>
                  <mat-checkbox formControlName="useTailwind"> TailwindCSS Styling </mat-checkbox>
                  <mat-checkbox formControlName="includePermissions"> Role-based Access Control </mat-checkbox>
                </mat-card-content>
              </mat-card>

              <!-- Naming Options -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Naming Configuration</mat-card-title>
                </mat-card-header>
                <mat-card-content class="space-y-4">
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Module Name</mat-label>
                    <input matInput formControlName="moduleName" placeholder="user-management" />
                    <mat-hint>Kebab-case module name</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Component Prefix</mat-label>
                    <input matInput formControlName="componentPrefix" placeholder="User" />
                    <mat-hint>PascalCase prefix for components</mat-hint>
                  </mat-form-field>
                </mat-card-content>
              </mat-card>

              <div class="flex justify-between">
                <button mat-button matStepperPrevious>Back</button>
                <button mat-raised-button color="primary" matStepperNext>Preview Generation</button>
              </div>
            </div>
          </form>
        </mat-step>

        <!-- Step 3: Preview -->
        <mat-step label="Preview & Generate">
          <div class="step-content space-y-4">
            <p class="text-gray-600">Preview the files that will be generated:</p>

            <!-- Generation Summary -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>Generation Summary</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div class="stat-item">
                    <p class="text-2xl font-bold text-blue-600">{{ previewStats().components }}</p>
                    <p class="text-sm text-gray-600">Components</p>
                  </div>
                  <div class="stat-item">
                    <p class="text-2xl font-bold text-green-600">{{ previewStats().services }}</p>
                    <p class="text-sm text-gray-600">Services</p>
                  </div>
                  <div class="stat-item">
                    <p class="text-2xl font-bold text-purple-600">{{ previewStats().routes }}</p>
                    <p class="text-sm text-gray-600">Routes</p>
                  </div>
                  <div class="stat-item">
                    <p class="text-2xl font-bold text-orange-600">{{ previewStats().tests }}</p>
                    <p class="text-sm text-gray-600">Tests</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- File Preview -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>Generated Files</mat-card-title>
                <mat-card-subtitle>Click to preview file content</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <mat-tab-group>
                  @for (fileGroup of groupedFiles(); track fileGroup.type) {
                    <mat-tab [label]="fileGroup.label + ' (' + fileGroup.files.length + ')'">
                      <div class="pt-4">
                        <mat-list>
                          @for (file of fileGroup.files; track file.path) {
                            <mat-list-item (click)="previewFile(file)" class="cursor-pointer hover:bg-gray-50">
                              <mat-icon matListItemIcon>{{ getFileIcon(file.type) }}</mat-icon>
                              <div matListItemTitle>{{ getFileName(file.path) }}</div>
                              <div matListItemLine>{{ file.path }}</div>
                            </mat-list-item>
                          }
                        </mat-list>
                      </div>
                    </mat-tab>
                  }
                </mat-tab-group>
              </mat-card-content>
            </mat-card>

            <!-- Generation Progress -->
            @if (generationProgress()) {
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Generation Progress</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <span>{{ generationProgress()!.currentStep }}</span>
                      <span>{{ generationProgress()!.progress }}%</span>
                    </div>
                    <mat-progress-bar [value]="generationProgress()!.progress" [color]="generationProgress()!.status === 'failed' ? 'warn' : 'primary'"> </mat-progress-bar>

                    @if (generationProgress()!.error) {
                      <p class="text-red-600 text-sm">{{ generationProgress()!.error }}</p>
                    }
                  </div>
                </mat-card-content>
              </mat-card>
            }

            <!-- Actions -->
            <div class="flex justify-between">
              <button mat-button matStepperPrevious>Back</button>
              <div class="flex gap-2">
                <button mat-button (click)="previewGeneration()">
                  <mat-icon>preview</mat-icon>
                  Preview
                </button>
                <button mat-raised-button color="primary" (click)="generateCode()" [disabled]="loading() || !canGenerate()">
                  @if (loading()) {
                    <mat-spinner diameter="20" class="mr-2"></mat-spinner>
                  }
                  <mat-icon>build</mat-icon>
                  Generate Code
                </button>
              </div>
            </div>
          </div>
        </mat-step>

        <!-- Step 4: Results -->
        <mat-step label="Download Results">
          <div class="step-content space-y-4">
            @if (generationComplete()) {
              <div class="text-center">
                <mat-icon class="text-6xl text-green-600 mb-4">check_circle</mat-icon>
                <h2 class="text-xl font-bold text-gray-800 mb-2">Generation Complete!</h2>
                <p class="text-gray-600 mb-6">Successfully generated {{ generatedFiles().length }} files</p>

                <div class="flex justify-center gap-4">
                  <button mat-raised-button color="primary" (click)="downloadCode()">
                    <mat-icon>download</mat-icon>
                    Download ZIP
                  </button>
                  <button mat-button (click)="viewInIDE()">
                    <mat-icon>code</mat-icon>
                    View in IDE
                  </button>
                  <button mat-button (click)="startNew()">
                    <mat-icon>add</mat-icon>
                    Generate Another
                  </button>
                </div>
              </div>
            }
          </div>
        </mat-step>
      </mat-stepper>
    </div>

    <!-- File Preview Dialog -->
    @if (previewFileContent()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" (click)="closePreview()">
        <div class="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] m-4" (click)="$event.stopPropagation()">
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-lg font-medium">{{ previewFileName() }}</h3>
            <button mat-icon-button (click)="closePreview()">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="p-4 overflow-auto max-h-[60vh]">
            <ngx-monaco-editor [options]="editorOptions" [ngModel]="previewFileContent()" class="h-96"> </ngx-monaco-editor>
          </div>
        </div>
      </div>
    }
  `,
})
export class CrudGeneratorComponent implements OnInit {
  private codeGeneratorService = inject(CodeGeneratorService);
  private fb = inject(FormBuilder);

  // Service signals
  availableTables = this.codeGeneratorService.availableTables;
  selectedTable = this.codeGeneratorService.selectedTable;
  generationProgress = this.codeGeneratorService.generationProgress;
  generatedFiles = this.codeGeneratorService.generatedFiles;
  loading = this.codeGeneratorService.loading;
  hasSelection = this.codeGeneratorService.hasSelection;
  canGenerate = this.codeGeneratorService.canGenerate;
  generationComplete = this.codeGeneratorService.generationComplete;

  // Local signals
  previewFileContent = signal<string | null>(null);
  previewFileName = signal<string>('');

  // Forms
  tableSelectionForm = this.fb.group({
    tableName: ['', Validators.required],
  });

  optionsForm = this.fb.group({
    generateList: [true],
    generateForm: [true],
    generateDetail: [true],
    generateService: [true],
    generateRoutes: [true],
    generateTests: [false],
    useStandalone: [true],
    useMaterial: [true],
    useTailwind: [true],
    includePermissions: [true],
    moduleName: [''],
    componentPrefix: [''],
  });

  // Computed
  previewStats = computed(() => {
    const files = this.generatedFiles();
    return {
      components: files.filter((f) => f.type === 'component').length,
      services: files.filter((f) => f.type === 'service').length,
      routes: files.filter((f) => f.type === 'route').length,
      tests: files.filter((f) => f.type === 'test').length,
    };
  });

  groupedFiles = computed(() => {
    const files = this.generatedFiles();
    const groups: { type: string; label: string; files: GeneratedFile[] }[] = [
      { type: 'component', label: 'Components', files: [] },
      { type: 'service', label: 'Services', files: [] },
      { type: 'model', label: 'Models', files: [] },
      { type: 'route', label: 'Routes', files: [] },
      { type: 'test', label: 'Tests', files: [] },
    ];

    files.forEach((file) => {
      const group = groups.find((g) => g.type === file.type);
      if (group) {
        group.files.push(file);
      }
    });

    return groups.filter((g) => g.files.length > 0);
  });

  editorOptions = {
    theme: 'vs-dark',
    language: 'typescript',
    readOnly: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
  };

  async ngOnInit() {
    await this.codeGeneratorService.loadAvailableTables();
  }

  async onTableSelect(tableName: string): Promise<void> {
    await this.codeGeneratorService.loadTableDetails(tableName);

    // Auto-populate form fields based on table name
    const table = this.selectedTable();
    if (table) {
      const pascalCase = this.toPascalCase(table.name);
      const kebabCase = this.toKebabCase(table.name);

      this.optionsForm.patchValue({
        moduleName: kebabCase,
        componentPrefix: pascalCase,
      });
    }
  }

  async previewGeneration(): Promise<void> {
    if (!this.canGenerate()) return;

    const tableName = this.tableSelectionForm.value.tableName!;
    const options = this.optionsForm.value as FrontendGenerationOptions;

    try {
      const files = await this.codeGeneratorService.previewGeneration(tableName, options);
      this.codeGeneratorService['generatedFilesSignal'].set(files); // Access private for preview
    } catch (error) {
      console.error('Preview failed:', error);
    }
  }

  async generateCode(): Promise<void> {
    if (!this.canGenerate()) return;

    const tableName = this.tableSelectionForm.value.tableName!;
    const options = this.optionsForm.value as FrontendGenerationOptions;

    try {
      await this.codeGeneratorService.generateFrontendCrud(tableName, options);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  }

  previewFile(file: GeneratedFile): void {
    this.previewFileContent.set(file.content);
    this.previewFileName.set(file.path);

    // Update editor language based on file type
    if (file.language === 'html') {
      this.editorOptions = { ...this.editorOptions, language: 'html' };
    } else if (file.language === 'scss') {
      this.editorOptions = { ...this.editorOptions, language: 'scss' };
    } else {
      this.editorOptions = { ...this.editorOptions, language: 'typescript' };
    }
  }

  closePreview(): void {
    this.previewFileContent.set(null);
    this.previewFileName.set('');
  }

  downloadCode(): void {
    this.codeGeneratorService.downloadGeneratedCode();
  }

  viewInIDE(): void {
    // Open VS Code or preferred IDE
    const files = this.generatedFiles();
    if (files.length > 0) {
      // Create temporary project structure and open
      console.log('Would open IDE with generated files');
    }
  }

  startNew(): void {
    this.reset();
  }

  reset(): void {
    this.codeGeneratorService.clearGeneration();
    this.tableSelectionForm.reset();
    this.optionsForm.reset({
      generateList: true,
      generateForm: true,
      generateDetail: true,
      generateService: true,
      generateRoutes: true,
      generateTests: false,
      useStandalone: true,
      useMaterial: true,
      useTailwind: true,
      includePermissions: true,
    });
    this.previewFileContent.set(null);
  }

  getFileIcon(type: string): string {
    const icons: Record<string, string> = {
      component: 'widgets',
      service: 'build',
      model: 'data_object',
      route: 'route',
      test: 'bug_report',
    };
    return icons[type] || 'description';
  }

  getFileName(path: string): string {
    return path.split('/').pop() || path;
  }

  private toPascalCase(str: string): string {
    return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase()).replace(/^(.)/, (char) => char.toUpperCase());
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
      .replace(/^-/, '')
      .replace(/_/g, '-');
  }
}
```

## Generated Code Templates Integration

```typescript
// libs/code-generator/src/lib/services/template.service.ts
@Injectable({ providedIn: 'root' })
export class TemplateService {
  // Angular component templates
  generateListComponent(table: DatabaseTable, options: FrontendGenerationOptions): string {
    const componentName = `${options.componentPrefix}ListComponent`;
    const serviceName = `${options.componentPrefix}Service`;

    return `
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ${serviceName} } from '../services/${this.toKebabCase(options.componentPrefix!)}.service';

@Component({
  selector: 'app-${this.toKebabCase(options.componentPrefix!)}-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  template: \`
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">${options.componentPrefix} Management</h1>
        <button mat-raised-button color="primary" (click)="create${options.componentPrefix}()">
          <mat-icon>add</mat-icon>
          Add ${options.componentPrefix}
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <mat-card-content class="p-0">
            <table mat-table [dataSource]="items()" class="w-full">
              ${this.generateTableColumns(table)}
              
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                  class="hover:bg-gray-50 cursor-pointer"
                  (click)="selectItem(row)">
              </tr>
            </table>
          </mat-card-content>
        </mat-card>
      }
    </div>
  \`
})
export class ${componentName} {
  private ${this.toCamelCase(serviceName)} = inject(${serviceName});
  
  // Service signals
  items = this.${this.toCamelCase(serviceName)}.items;
  loading = this.${this.toCamelCase(serviceName)}.loading;
  
  displayedColumns = [${this.getDisplayColumns(table)}];
  
  create${options.componentPrefix}(): void {
    // Navigation logic
  }
  
  selectItem(item: any): void {
    // Selection logic
  }
}`;
  }

  generateFormComponent(table: DatabaseTable, options: FrontendGenerationOptions): string {
    const componentName = `${options.componentPrefix}FormComponent`;
    const serviceName = `${options.componentPrefix}Service`;

    return `
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ${serviceName} } from '../services/${this.toKebabCase(options.componentPrefix!)}.service';

@Component({
  selector: 'app-${this.toKebabCase(options.componentPrefix!)}-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  template: \`
    <div class="container mx-auto p-4 max-w-2xl">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            {{ isEditMode() ? 'Edit' : 'Create' }} ${options.componentPrefix}
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="${this.toCamelCase(options.componentPrefix!)}Form" (ngSubmit)="onSubmit()">
            ${this.generateFormFields(table)}
          </form>
        </mat-card-content>
        
        <mat-card-actions align="end">
          <button mat-button type="button" (click)="cancel()">Cancel</button>
          <button mat-raised-button color="primary" type="submit"
                  [disabled]="${this.toCamelCase(options.componentPrefix!)}Form.invalid || saving()">
            {{ isEditMode() ? 'Update' : 'Create' }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  \`
})
export class ${componentName} implements OnInit {
  private fb = inject(FormBuilder);
  private ${this.toCamelCase(serviceName)} = inject(${serviceName});
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  isEditMode = signal(false);
  saving = signal(false);
  
  ${this.toCamelCase(options.componentPrefix!)}Form = this.fb.group({
    ${this.generateFormControls(table)}
  });

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.load${options.componentPrefix}(id);
    }
  }

  async load${options.componentPrefix}(id: string) {
    const item = await this.${this.toCamelCase(serviceName)}.loadById(id);
    if (item) {
      this.${this.toCamelCase(options.componentPrefix!)}Form.patchValue(item);
    }
  }

  async onSubmit() {
    if (this.${this.toCamelCase(options.componentPrefix!)}Form.invalid) return;
    
    this.saving.set(true);
    
    try {
      const formData = this.${this.toCamelCase(options.componentPrefix!)}Form.value;
      
      if (this.isEditMode()) {
        const id = this.route.snapshot.params['id'];
        await this.${this.toCamelCase(serviceName)}.update(id, formData);
      } else {
        await this.${this.toCamelCase(serviceName)}.create(formData);
      }
      
      this.router.navigate(['/${this.toKebabCase(options.componentPrefix!)}']);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      this.saving.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/${this.toKebabCase(options.componentPrefix!)}']);
  }
}`;
  }

  generateService(table: DatabaseTable, options: FrontendGenerationOptions): string {
    const serviceName = `${options.componentPrefix}Service`;
    const modelName = options.componentPrefix!;

    return `
import { Injectable, signal, computed } from '@angular/core';
import { ApiService } from '@org/http';

@Injectable({ providedIn: 'root' })
export class ${serviceName} {
  private apiService = inject(ApiService);
  
  // State signals
  private itemsSignal = signal<${modelName}[]>([]);
  private selectedItemSignal = signal<${modelName} | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  
  readonly items = this.itemsSignal.asReadonly();
  readonly selectedItem = this.selectedItemSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  
  // Computed
  readonly hasItems = computed(() => this.items().length > 0);
  readonly itemCount = computed(() => this.items().length);

  async loadAll(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      const items = await this.apiService.get<${modelName}[]>('/api/${this.toKebabCase(table.name)}');
      this.itemsSignal.set(items);
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to load ${this.toKebabCase(table.name)}');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadById(id: string): Promise<${modelName} | null> {
    this.loadingSignal.set(true);
    
    try {
      const item = await this.apiService.get<${modelName}>(\`/api/${this.toKebabCase(table.name)}/\${id}\`);
      this.selectedItemSignal.set(item);
      return item;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to load ${this.toKebabCase(table.name)}');
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async create(data: Create${modelName}Dto): Promise<${modelName}> {
    this.loadingSignal.set(true);
    
    try {
      const newItem = await this.apiService.post<${modelName}>('/api/${this.toKebabCase(table.name)}', data);
      this.itemsSignal.update(items => [...items, newItem]);
      return newItem;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to create ${this.toKebabCase(table.name)}');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async update(id: string, data: Update${modelName}Dto): Promise<${modelName}> {
    this.loadingSignal.set(true);
    
    try {
      const updatedItem = await this.apiService.put<${modelName}>(\`/api/${this.toKebabCase(table.name)}/\${id}\`, data);
      this.itemsSignal.update(items =>
        items.map(item => item.id === id ? updatedItem : item)
      );
      
      if (this.selectedItem()?.id === id) {
        this.selectedItemSignal.set(updatedItem);
      }
      
      return updatedItem;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to update ${this.toKebabCase(table.name)}');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async delete(id: string): Promise<void> {
    this.loadingSignal.set(true);
    
    try {
      await this.apiService.delete(\`/api/${this.toKebabCase(table.name)}/\${id}\`);
      this.itemsSignal.update(items => items.filter(item => item.id !== id));
      
      if (this.selectedItem()?.id === id) {
        this.selectedItemSignal.set(null);
      }
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to delete ${this.toKebabCase(table.name)}');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  selectItem(item: ${modelName} | null): void {
    this.selectedItemSignal.set(item);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}

// Generated interfaces
interface ${modelName} {
  ${this.generateInterface(table)}
}

interface Create${modelName}Dto {
  ${this.generateCreateDto(table)}
}

interface Update${modelName}Dto {
  ${this.generateUpdateDto(table)}
}`;
  }

  private generateTableColumns(table: DatabaseTable): string {
    const columns = table.columns
      .filter((col) => !col.isPrimaryKey || col.name !== 'id')
      .slice(0, 5) // Show first 5 non-ID columns
      .map(
        (col) => `
              <ng-container matColumnDef="${col.name}">
                <th mat-header-cell *matHeaderCellDef>${this.toDisplayName(col.name)}</th>
                <td mat-cell *matCellDef="let element">{{ element.${col.name} }}</td>
              </ng-container>`,
      );

    return columns.join('\n');
  }

  private generateFormFields(table: DatabaseTable): string {
    const fields = table.columns
      .filter((col) => !col.isPrimaryKey && !col.isAutoIncrement)
      .map((col) => {
        const fieldType = this.getFormFieldType(col);
        const required = !col.isNullable ? 'required' : '';

        return `
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>${this.toDisplayName(col.name)}</mat-label>
              <input matInput 
                     formControlName="${col.name}"
                     type="${fieldType}"
                     ${required}>
              @if (${this.toCamelCase(table.name)}Form.get('${col.name}')?.errors?.['required']) {
                <mat-error>${this.toDisplayName(col.name)} is required</mat-error>
              }
            </mat-form-field>`;
      });

    return fields.join('\n');
  }

  private generateFormControls(table: DatabaseTable): string {
    const controls = table.columns
      .filter((col) => !col.isPrimaryKey && !col.isAutoIncrement)
      .map((col) => {
        const validators = [];
        if (!col.isNullable) validators.push('Validators.required');
        if (col.type.includes('varchar') && col.maxLength) {
          validators.push(`Validators.maxLength(${col.maxLength})`);
        }

        const validatorString = validators.length > 0 ? `[${validators.join(', ')}]` : '[]';
        return `    ${col.name}: ['', ${validatorString}]`;
      });

    return controls.join(',\n');
  }

  private generateInterface(table: DatabaseTable): string {
    const properties = table.columns.map((col) => {
      const optional = col.isNullable ? '?' : '';
      const type = this.getTypeScriptType(col.type);
      return `  ${col.name}${optional}: ${type};`;
    });

    return properties.join('\n');
  }

  private generateCreateDto(table: DatabaseTable): string {
    const properties = table.columns
      .filter((col) => !col.isPrimaryKey && !col.isAutoIncrement)
      .map((col) => {
        const optional = col.isNullable ? '?' : '';
        const type = this.getTypeScriptType(col.type);
        return `  ${col.name}${optional}: ${type};`;
      });

    return properties.join('\n');
  }

  private generateUpdateDto(table: DatabaseTable): string {
    const properties = table.columns
      .filter((col) => !col.isPrimaryKey && !col.isAutoIncrement)
      .map((col) => {
        const type = this.getTypeScriptType(col.type);
        return `  ${col.name}?: ${type};`;
      });

    return properties.join('\n');
  }

  private getDisplayColumns(table: DatabaseTable): string {
    const columns = table.columns
      .filter((col) => !col.isPrimaryKey || col.name !== 'id')
      .slice(0, 5)
      .map((col) => `'${col.name}'`);

    columns.push("'actions'");
    return columns.join(', ');
  }

  private getFormFieldType(column: TableColumn): string {
    if (column.type.includes('email')) return 'email';
    if (column.type.includes('password')) return 'password';
    if (column.type.includes('date')) return 'date';
    if (column.type.includes('time')) return 'time';
    if (column.type.includes('number') || column.type.includes('int')) return 'number';
    return 'text';
  }

  private getTypeScriptType(sqlType: string): string {
    if (sqlType.includes('varchar') || sqlType.includes('text')) return 'string';
    if (sqlType.includes('int') || sqlType.includes('decimal') || sqlType.includes('float')) return 'number';
    if (sqlType.includes('boolean')) return 'boolean';
    if (sqlType.includes('date') || sqlType.includes('timestamp')) return 'string'; // ISO date string
    if (sqlType.includes('json')) return 'any';
    return 'string';
  }

  private toDisplayName(camelCase: string): string {
    return camelCase
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  private toCamelCase(str: string): string {
    return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase()).replace(/^(.)/, (char) => char.toLowerCase());
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
      .replace(/^-/, '')
      .replace(/_/g, '-');
  }
}
```

## Code Preview Component

```typescript
// apps/admin-portal/src/app/features/code-generator/components/code-preview.component.ts
@Component({
  selector: 'app-code-preview',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatButtonModule, MatIconModule, MatCardModule, MonacoEditorModule],
  template: `
    <div class="code-preview">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold">Generated Code Preview</h2>
        <div class="flex gap-2">
          <button mat-button (click)="copyToClipboard()">
            <mat-icon>content_copy</mat-icon>
            Copy
          </button>
          <button mat-button (click)="downloadFile()">
            <mat-icon>download</mat-icon>
            Download
          </button>
        </div>
      </div>

      <mat-card>
        <mat-card-content class="p-0">
          <mat-tab-group>
            @for (file of files(); track file.path) {
              <mat-tab [label]="getFileName(file.path)">
                <div class="tab-content">
                  <div class="flex justify-between items-center p-2 bg-gray-50 border-b">
                    <span class="text-sm font-medium">{{ file.path }}</span>
                    <mat-chip [color]="getFileTypeColor(file.type)">{{ file.type }}</mat-chip>
                  </div>

                  <ngx-monaco-editor [options]="getEditorOptions(file.language)" [ngModel]="file.content" class="h-96"> </ngx-monaco-editor>
                </div>
              </mat-tab>
            }
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class CodePreviewComponent {
  @Input() files = signal<GeneratedFile[]>([]);

  getFileName(path: string): string {
    return path.split('/').pop() || path;
  }

  getFileTypeColor(type: string): string {
    const colors: Record<string, string> = {
      component: 'primary',
      service: 'accent',
      model: 'warn',
      route: 'primary',
      test: 'warn',
    };
    return colors[type] || 'primary';
  }

  getEditorOptions(language: string) {
    return {
      theme: 'vs-dark',
      language: language,
      readOnly: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      wordWrap: 'on',
      automaticLayout: true,
    };
  }

  async copyToClipboard(): Promise<void> {
    const currentFile = this.getCurrentFile();
    if (currentFile) {
      await navigator.clipboard.writeText(currentFile.content);
    }
  }

  downloadFile(): void {
    const currentFile = this.getCurrentFile();
    if (currentFile) {
      const blob = new Blob([currentFile.content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.getFileName(currentFile.path);
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  private getCurrentFile(): GeneratedFile | null {
    // Get currently active tab file
    return this.files()[0] || null; // Simplified - would get actual active tab
  }
}
```

## Generator Integration in Admin Portal

```typescript
// apps/admin-portal/src/app/features/developer/pages/code-generator-page.component.ts
@Component({
  selector: 'app-code-generator-page',
  standalone: true,
  imports: [CommonModule, CrudGeneratorComponent, CodePreviewComponent, MatTabsModule, MatCardModule],
  template: `
    <div class="code-generator-page">
      <mat-tab-group>
        <mat-tab label="CRUD Generator">
          <div class="pt-4">
            <app-crud-generator></app-crud-generator>
          </div>
        </mat-tab>

        <mat-tab label="Custom Templates">
          <div class="pt-4">
            <app-template-manager></app-template-manager>
          </div>
        </mat-tab>

        <mat-tab label="Generated History">
          <div class="pt-4">
            <app-generation-history></app-generation-history>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
})
export class CodeGeneratorPageComponent {
  // Main generator page component
}
```

## Template Manager Component

```typescript
// apps/admin-portal/src/app/features/code-generator/components/template-manager.component.ts
@Component({
  selector: 'app-template-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule, MatListModule, MatIconModule, MonacoEditorModule],
  template: `
    <div class="template-manager">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">Custom Templates</h2>
        <button mat-raised-button color="primary" (click)="createTemplate()">
          <mat-icon>add</mat-icon>
          New Template
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Template List -->
        <mat-card class="template-list">
          <mat-card-header>
            <mat-card-title>Available Templates</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-list>
              @for (template of customTemplates(); track template.id) {
                <mat-list-item (click)="selectTemplate(template)" [class.bg-blue-50]="selectedTemplate()?.id === template.id" class="cursor-pointer">
                  <mat-icon matListItemIcon>{{ getTemplateIcon(template.type) }}</mat-icon>
                  <div matListItemTitle>{{ template.name }}</div>
                  <div matListItemLine>{{ template.description }}</div>
                  <button mat-icon-button (click)="deleteTemplate(template.id); $event.stopPropagation()">
                    <mat-icon>delete</mat-icon>
                  </button>
                </mat-list-item>
              }
            </mat-list>
          </mat-card-content>
        </mat-card>

        <!-- Template Editor -->
        <div class="lg:col-span-2">
          @if (selectedTemplate()) {
            <mat-card>
              <mat-card-header>
                <mat-card-title>{{ selectedTemplate()!.name }}</mat-card-title>
                <mat-card-subtitle>{{ selectedTemplate()!.type | titlecase }} Template</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="templateForm" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <mat-form-field appearance="outline">
                      <mat-label>Template Name</mat-label>
                      <input matInput formControlName="name" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Template Type</mat-label>
                      <mat-select formControlName="type">
                        <mat-option value="component">Component</mat-option>
                        <mat-option value="service">Service</mat-option>
                        <mat-option value="model">Model</mat-option>
                        <mat-option value="test">Test</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Description</mat-label>
                    <textarea matInput formControlName="description" rows="2"></textarea>
                  </mat-form-field>

                  <div class="template-editor">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Template Content</label>
                    <ngx-monaco-editor [options]="editorOptions" formControlName="content" class="h-64"> </ngx-monaco-editor>
                    <mat-hint>Use Handlebars syntax: {{ table.name }}, {{#columns}}, etc.</mat-hint>
                  </div>

                  <div class="flex justify-end gap-2">
                    <button mat-button (click)="resetTemplate()">Reset</button>
                    <button mat-raised-button color="primary" (click)="saveTemplate()">Save Template</button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          } @else {
            <div class="flex items-center justify-center h-64 text-gray-500">
              <div class="text-center">
                <mat-icon class="text-4xl mb-2">code</mat-icon>
                <p>Select a template to edit</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class TemplateManagerComponent implements OnInit {
  private codeGeneratorService = inject(CodeGeneratorService);
  private fb = inject(FormBuilder);

  // Signals
  customTemplates = signal<CustomTemplate[]>([]);
  selectedTemplate = signal<CustomTemplate | null>(null);

  templateForm = this.fb.group({
    name: ['', Validators.required],
    type: ['component', Validators.required],
    description: [''],
    content: ['', Validators.required],
  });

  editorOptions = {
    theme: 'vs-dark',
    language: 'typescript',
    minimap: { enabled: false },
    fontSize: 14,
    wordWrap: 'on',
  };

  async ngOnInit() {
    await this.loadCustomTemplates();
  }

  async loadCustomTemplates(): Promise<void> {
    try {
      const templates = await this.codeGeneratorService.getCustomTemplates();
      this.customTemplates.set(templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }

  selectTemplate(template: CustomTemplate): void {
    this.selectedTemplate.set(template);
    this.templateForm.patchValue(template);
  }

  createTemplate(): void {
    const newTemplate: CustomTemplate = {
      id: '',
      name: 'New Template',
      type: 'component',
      description: '',
      content: this.getDefaultTemplateContent('component'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.selectedTemplate.set(newTemplate);
    this.templateForm.patchValue(newTemplate);
  }

  async saveTemplate(): Promise<void> {
    if (this.templateForm.invalid) return;

    try {
      const formData = this.templateForm.value;
      const template = this.selectedTemplate();

      if (template?.id) {
        // Update existing
        await this.codeGeneratorService.updateCustomTemplate(template.id, formData);
      } else {
        // Create new
        await this.codeGeneratorService.createCustomTemplate(formData);
      }

      await this.loadCustomTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  }

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      await this.codeGeneratorService.deleteCustomTemplate(templateId);
      await this.loadCustomTemplates();

      // Clear selection if deleted template was selected
      if (this.selectedTemplate()?.id === templateId) {
        this.selectedTemplate.set(null);
        this.templateForm.reset();
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  }

  resetTemplate(): void {
    const template = this.selectedTemplate();
    if (template) {
      this.templateForm.patchValue(template);
    }
  }

  getTemplateIcon(type: string): string {
    const icons: Record<string, string> = {
      component: 'widgets',
      service: 'build',
      model: 'data_object',
      test: 'bug_report',
    };
    return icons[type] || 'description';
  }

  private getDefaultTemplateContent(type: string): string {
    const templates: Record<string, string> = {
      component: `import { Component } from '@angular/core';

@Component({
  selector: 'app-{{kebabCase table.name}}',
  standalone: true,
  template: \`
    <div class="{{kebabCase table.name}}-component">
      <h1>{{pascalCase table.name}} Component</h1>
    </div>
  \`
})
export class {{pascalCase table.name}}Component {
  // Component implementation
}`,
      service: `import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class {{pascalCase table.name}}Service {
  private itemsSignal = signal<{{pascalCase table.name}}[]>([]);
  
  readonly items = this.itemsSignal.asReadonly();
  
  // Service implementation
}`,
      model: `export interface {{pascalCase table.name}} {
  {{#columns}}
  {{name}}: {{getTypeScriptType type}};
  {{/columns}}
}`,
      test: `import { TestBed } from '@angular/core/testing';
import { {{pascalCase table.name}}Service } from './{{kebabCase table.name}}.service';

describe('{{pascalCase table.name}}Service', () => {
  let service: {{pascalCase table.name}}Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject({{pascalCase table.name}}Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});`,
    };

    return templates[type] || '';
  }
}

interface CustomTemplate {
  id: string;
  name: string;
  type: 'component' | 'service' | 'model' | 'test';
  description: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

## CLI Integration Commands

```typescript
// apps/admin-portal/src/app/features/code-generator/services/cli-integration.service.ts
@Injectable({ providedIn: 'root' })
export class CLIIntegrationService {
  private apiService = inject(ApiService);

  async generateViaCLI(command: string): Promise<CLIResult> {
    return await this.apiService.post<CLIResult>('/api/generator/cli', {
      command,
    });
  }

  async getAvailableCommands(): Promise<CLICommand[]> {
    return await this.apiService.get<CLICommand[]>('/api/generator/cli/commands');
  }

  buildCLICommand(options: FrontendGenerationOptions, tableName: string): string {
    const flags = [];

    if (options.generateList) flags.push('--list');
    if (options.generateForm) flags.push('--form');
    if (options.generateDetail) flags.push('--detail');
    if (options.generateService) flags.push('--service');
    if (options.generateRoutes) flags.push('--routes');
    if (options.generateTests) flags.push('--tests');
    if (options.useStandalone) flags.push('--standalone');
    if (options.useMaterial) flags.push('--material');
    if (options.useTailwind) flags.push('--tailwind');
    if (options.includePermissions) flags.push('--permissions');

    if (options.moduleName) flags.push(`--module="${options.moduleName}"`);
    if (options.componentPrefix) flags.push(`--prefix="${options.componentPrefix}"`);

    return `nx generate:crud ${tableName} ${flags.join(' ')}`;
  }
}

interface CLICommand {
  name: string;
  description: string;
  usage: string;
  options: CLIOption[];
}

interface CLIOption {
  name: string;
  description: string;
  type: 'string' | 'boolean' | 'number';
  required: boolean;
  default?: any;
}

interface CLIResult {
  success: boolean;
  output: string;
  error?: string;
  files?: GeneratedFile[];
}
```
