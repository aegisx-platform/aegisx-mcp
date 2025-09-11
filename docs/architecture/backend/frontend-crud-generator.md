# Frontend CRUD Generator

## Angular CRUD Generation from OpenAPI

### Frontend Generator Service

```typescript
// apps/admin-portal/src/app/features/generator/services/frontend-generator.service.ts
@Injectable({ providedIn: 'root' })
export class FrontendGeneratorService {
  private http = inject(HttpClient);

  // Generate complete Angular CRUD feature
  async generateCrudFeature(schema: any, options: FrontendGenerateOptions): Promise<GeneratedAngularFiles> {
    const response = await this.http
      .post<GeneratedAngularFiles>('/api/crud-generator/frontend', {
        schema,
        options,
      })
      .toPromise();

    return response!;
  }

  // Preview generated code
  async previewGeneration(schema: any): Promise<{ files: string[]; preview: any }> {
    const response = await this.http
      .post<any>('/api/crud-generator/frontend/preview', {
        schema,
      })
      .toPromise();

    return response!;
  }
}

interface FrontendGenerateOptions {
  moduleName: string;
  generateTests: boolean;
  useSignals: boolean;
  standalone: boolean;
  includeBulkOperations: boolean;
  includeExport: boolean;
  generateRoutes: boolean;
}

interface GeneratedAngularFiles {
  service: string;
  listComponent: string;
  formComponent: string;
  detailComponent: string;
  pageComponent: string;
  routes: string;
  models: string;
  tests: string[];
}
```

### Backend API for Frontend Generation

```typescript
// apps/api/src/modules/crud-generator/controllers/frontend-generator.controller.ts
export class FrontendGeneratorController {
  constructor(private fastify: FastifyInstance) {}

  async register(fastify: FastifyInstance) {
    // Generate Angular CRUD
    fastify.route({
      method: 'POST',
      url: '/frontend',
      schema: {
        description: 'Generate Angular CRUD components',
        body: {
          type: 'object',
          required: ['schema'],
          properties: {
            schema: { type: 'object' },
            options: {
              type: 'object',
              properties: {
                moduleName: { type: 'string' },
                generateTests: { type: 'boolean', default: true },
                useSignals: { type: 'boolean', default: true },
                standalone: { type: 'boolean', default: true },
                includeBulkOperations: { type: 'boolean', default: true },
                includeExport: { type: 'boolean', default: false },
                generateRoutes: { type: 'boolean', default: true },
              },
            },
          },
        },
      },
      handler: async (request, reply) => {
        const { schema, options = {} } = request.body;
        const generator = new AngularCrudGenerator(fastify);

        const files = await generator.generateFromSchema(schema, options);

        return reply.success(files, 'Angular CRUD generated successfully');
      },
    });
  }
}
```

### Angular Generator

```typescript
// apps/api/src/services/angular-crud-generator.ts
export class AngularCrudGenerator {
  constructor(private fastify: FastifyInstance) {}

  async generateFromSchema(schema: any, options: any): Promise<GeneratedAngularFiles> {
    const entityName = schema.name;
    const pascalCase = this.toPascalCase(entityName);
    const camelCase = this.toCamelCase(entityName);
    const kebabCase = this.toKebabCase(entityName);

    return {
      service: this.generateService(entityName, schema, options),
      listComponent: this.generateListComponent(entityName, schema, options),
      formComponent: this.generateFormComponent(entityName, schema, options),
      detailComponent: this.generateDetailComponent(entityName, schema, options),
      pageComponent: this.generatePageComponent(entityName, schema, options),
      routes: this.generateRoutes(entityName, schema, options),
      models: this.generateModels(entityName, schema, options),
      tests: this.generateTests(entityName, schema, options),
    };
  }

  private generateService(entityName: string, schema: any, options: any): string {
    const pascalCase = this.toPascalCase(entityName);
    const camelCase = this.toCamelCase(entityName);

    return `
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ${pascalCase}, Create${pascalCase}Dto, Update${pascalCase}Dto } from '../models/${entityName}.model';

@Injectable({ providedIn: 'root' })
export class ${pascalCase}Service {
  private http = inject(HttpClient);
  private baseUrl = '/api/${entityName}s';
  
  // Signals
  private ${camelCase}sSignal = signal<${pascalCase}[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  private selectedSignal = signal<${pascalCase} | null>(null);
  private searchTermSignal = signal('');
  private currentPageSignal = signal(1);
  private totalSignal = signal(0);
  
  // Public readonly signals
  readonly ${camelCase}s = this.${camelCase}sSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly selected = this.selectedSignal.asReadonly();
  readonly searchTerm = this.searchTermSignal.asReadonly();
  readonly currentPage = this.currentPageSignal.asReadonly();
  readonly total = this.totalSignal.asReadonly();
  
  // Computed
  readonly filtered${pascalCase}s = computed(() => {
    const search = this.searchTermSignal().toLowerCase();
    const items = this.${camelCase}sSignal();
    
    if (!search) return items;
    
    return items.filter(item =>
      ${this.generateSearchFields(schema)}
    );
  });

  // Actions
  async load${pascalCase}s(params: any = {}) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await this.http.get<any>(\`\${this.baseUrl}\`, { params }).toPromise();
      this.${camelCase}sSignal.set(response.data);
      this.totalSignal.set(response.pagination.total);
    } catch (error: any) {
      this.errorSignal.set(error.message);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async load${pascalCase}ById(id: string) {
    this.loadingSignal.set(true);
    
    try {
      const response = await this.http.get<${pascalCase}>(\`\${this.baseUrl}/\${id}\`).toPromise();
      this.selectedSignal.set(response!);
      return response!;
    } catch (error: any) {
      this.errorSignal.set(error.message);
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async create${pascalCase}(data: Create${pascalCase}Dto) {
    this.loadingSignal.set(true);
    
    try {
      const response = await this.http.post<${pascalCase}>(\`\${this.baseUrl}\`, data).toPromise();
      this.${camelCase}sSignal.update(items => [...items, response!]);
      return response!;
    } catch (error: any) {
      this.errorSignal.set(error.message);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async update${pascalCase}(id: string, data: Update${pascalCase}Dto) {
    this.loadingSignal.set(true);
    
    try {
      const response = await this.http.put<${pascalCase}>(\`\${this.baseUrl}/\${id}\`, data).toPromise();
      this.${camelCase}sSignal.update(items =>
        items.map(item => item.id === id ? response! : item)
      );
      if (this.selectedSignal()?.id === id) {
        this.selectedSignal.set(response!);
      }
      return response!;
    } catch (error: any) {
      this.errorSignal.set(error.message);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async delete${pascalCase}(id: string) {
    this.loadingSignal.set(true);
    
    try {
      await this.http.delete(\`\${this.baseUrl}/\${id}\`).toPromise();
      this.${camelCase}sSignal.update(items => items.filter(item => item.id !== id));
      if (this.selectedSignal()?.id === id) {
        this.selectedSignal.set(null);
      }
    } catch (error: any) {
      this.errorSignal.set(error.message);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  ${
    options.includeBulkOperations
      ? `
  async bulkDelete(ids: string[]) {
    this.loadingSignal.set(true);
    
    try {
      await this.http.post(\`\${this.baseUrl}/bulk/delete\`, { ids }).toPromise();
      this.${camelCase}sSignal.update(items => 
        items.filter(item => !ids.includes(item.id))
      );
    } catch (error: any) {
      this.errorSignal.set(error.message);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }`
      : ''
  }

  // Utility methods
  setSearchTerm(term: string) {
    this.searchTermSignal.set(term);
  }

  setCurrentPage(page: number) {
    this.currentPageSignal.set(page);
  }

  clearError() {
    this.errorSignal.set(null);
  }
}`;
  }

  private generateListComponent(entityName: string, schema: any, options: any): string {
    const pascalCase = this.toPascalCase(entityName);
    const camelCase = this.toCamelCase(entityName);
    const kebabCase = this.toKebabCase(entityName);

    return `
@Component({
  selector: 'app-${kebabCase}-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatButtonModule,
    MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatCheckboxModule, MatMenuModule, MatPaginatorModule
  ],
  template: \`
    <div class="container mx-auto p-4">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">${pascalCase} Management</h1>
        <button mat-raised-button color="primary" (click)="create${pascalCase}()">
          <mat-icon>add</mat-icon>
          Add ${pascalCase}
        </button>
      </div>

      <!-- Search -->
      <mat-form-field appearance="outline" class="w-full max-w-md mb-4">
        <mat-label>Search ${entityName}s...</mat-label>
        <input matInput [value]="${camelCase}Service.searchTerm()" 
               (input)="onSearchChange($event.target.value)">
        <mat-icon matPrefix>search</mat-icon>
      </mat-form-field>

      <!-- Table -->
      <mat-card>
        <mat-card-content class="p-0">
          <table mat-table [dataSource]="${camelCase}Service.filtered${pascalCase}s()" class="w-full">
            ${this.generateTableColumns(schema)}
            
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                class="hover:bg-gray-50 cursor-pointer"
                (click)="view${pascalCase}(row)"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  \`
})
export class ${pascalCase}ListComponent {
  ${camelCase}Service = inject(${pascalCase}Service);
  router = inject(Router);
  
  displayedColumns = ['${this.getDisplayColumns(schema).join("', '")}'];
  
  ngOnInit() {
    this.${camelCase}Service.load${pascalCase}s();
  }
  
  onSearchChange(term: string) {
    this.${camelCase}Service.setSearchTerm(term);
  }
  
  create${pascalCase}() {
    this.router.navigate(['/${kebabCase}s/new']);
  }
  
  view${pascalCase}(${camelCase}: ${pascalCase}) {
    this.router.navigate(['/${kebabCase}s', ${camelCase}.id]);
  }
  
  edit${pascalCase}(${camelCase}: ${pascalCase}) {
    this.router.navigate(['/${kebabCase}s', ${camelCase}.id, 'edit']);
  }
  
  async delete${pascalCase}(${camelCase}: ${pascalCase}) {
    if (confirm('Are you sure?')) {
      await this.${camelCase}Service.delete${pascalCase}(${camelCase}.id);
    }
  }
}`;
  }

  private generateFormComponent(entityName: string, schema: any, options: any): string {
    const pascalCase = this.toPascalCase(entityName);
    const camelCase = this.toCamelCase(entityName);
    const kebabCase = this.toKebabCase(entityName);

    return `
@Component({
  selector: 'app-${kebabCase}-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatCardModule, MatSelectModule, MatDatepickerModule,
    MatCheckboxModule, MatProgressSpinnerModule
  ],
  template: \`
    <div class="container mx-auto p-4 max-w-2xl">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEditMode() ? 'Edit' : 'Create' }} ${pascalCase}</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="${camelCase}Form" (ngSubmit)="onSubmit()">
            ${this.generateFormFields(schema)}
          </form>
        </mat-card-content>
        
        <mat-card-actions align="end">
          <button mat-button type="button" (click)="onCancel()">Cancel</button>
          <button mat-raised-button color="primary" 
                  [disabled]="${camelCase}Form.invalid || ${camelCase}Service.loading()"
                  (click)="onSubmit()">
            @if (${camelCase}Service.loading()) {
              <mat-spinner diameter="20" class="mr-2"></mat-spinner>
            }
            {{ isEditMode() ? 'Update' : 'Create' }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  \`
})
export class ${pascalCase}FormComponent implements OnInit {
  private fb = inject(FormBuilder);
  ${camelCase}Service = inject(${pascalCase}Service);
  router = inject(Router);
  route = inject(ActivatedRoute);
  
  isEditMode = signal(false);
  ${camelCase}Id = signal<string | null>(null);
  
  ${camelCase}Form = this.fb.group({
    ${this.generateFormControls(schema)}
  });
  
  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.${camelCase}Id.set(id);
      this.load${pascalCase}(id);
    }
  }
  
  async load${pascalCase}(id: string) {
    const ${camelCase} = await this.${camelCase}Service.load${pascalCase}ById(id);
    if (${camelCase}) {
      this.${camelCase}Form.patchValue(${camelCase});
    }
  }
  
  async onSubmit() {
    if (!this.${camelCase}Form.valid) return;
    
    const formData = this.${camelCase}Form.value;
    
    try {
      if (this.isEditMode()) {
        await this.${camelCase}Service.update${pascalCase}(this.${camelCase}Id()!, formData);
      } else {
        await this.${camelCase}Service.create${pascalCase}(formData);
      }
      
      this.router.navigate(['/${kebabCase}s']);
    } catch (error) {
      console.error('Error saving ${camelCase}:', error);
    }
  }
  
  onCancel() {
    this.router.navigate(['/${kebabCase}s']);
  }
}`;
  }

  private generateRoutes(entityName: string, schema: any, options: any): string {
    const pascalCase = this.toPascalCase(entityName);
    const kebabCase = this.toKebabCase(entityName);

    return `
import { Routes } from '@angular/router';
import { AuthGuard, PermissionGuard } from '@org/auth';

export const ${entityName}Routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/${kebabCase}-list/${kebabCase}-list.component')
          .then(m => m.${pascalCase}ListComponent),
        title: '${pascalCase}s',
        data: { breadcrumb: '${pascalCase}s' }
      },
      {
        path: 'new',
        loadComponent: () => import('./components/${kebabCase}-form/${kebabCase}-form.component')
          .then(m => m.${pascalCase}FormComponent),
        canActivate: [PermissionGuard],
        title: 'Create ${pascalCase}',
        data: { 
          breadcrumb: 'Create ${pascalCase}',
          requiredPermission: '${entityName}s.create'
        }
      },
      {
        path: ':id',
        loadComponent: () => import('./components/${kebabCase}-detail/${kebabCase}-detail.component')
          .then(m => m.${pascalCase}DetailComponent),
        title: '${pascalCase} Details',
        data: { breadcrumb: '${pascalCase} Details' }
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./components/${kebabCase}-form/${kebabCase}-form.component')
          .then(m => m.${pascalCase}FormComponent),
        canActivate: [PermissionGuard],
        title: 'Edit ${pascalCase}',
        data: { 
          breadcrumb: 'Edit ${pascalCase}',
          requiredPermission: '${entityName}s.update'
        }
      }
    ]
  }
];`;
  }

  private generateModels(entityName: string, schema: any, options: any): string {
    const pascalCase = this.toPascalCase(entityName);

    return `
export interface ${pascalCase} {
  ${this.generateInterfaceFields(schema)}
}

export interface Create${pascalCase}Dto {
  ${this.generateCreateDtoFields(schema)}
}

export interface Update${pascalCase}Dto {
  ${this.generateUpdateDtoFields(schema)}
}

export interface ${pascalCase}ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  ${this.generateFilterFields(schema)}
}`;
  }

  // Helper methods
  private generateSearchFields(schema: any): string {
    const searchableFields = schema.columns
      .filter((col: any) => ['string', 'text'].includes(col.type))
      .map((col: any) => `item.${this.toCamelCase(col.name)}?.toLowerCase().includes(search)`)
      .join(' || ');

    return searchableFields || 'true';
  }

  private generateTableColumns(schema: any): string {
    return (
      schema.columns
        .filter((col: any) => !['password', 'token'].includes(col.name))
        .slice(0, 6) // Limit columns
        .map(
          (col: any) => `
            <ng-container matColumnDef="${col.name}">
              <th mat-header-cell *matHeaderCellDef>${this.toTitleCase(col.name)}</th>
              <td mat-cell *matCellDef="let element">{{ element.${this.toCamelCase(col.name)} }}</td>
            </ng-container>`,
        )
        .join('') +
      `
            
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let element">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="view${this.toPascalCase(schema.name)}(element)">
                    <mat-icon>visibility</mat-icon>
                    View
                  </button>
                  <button mat-menu-item (click)="edit${this.toPascalCase(schema.name)}(element)">
                    <mat-icon>edit</mat-icon>
                    Edit
                  </button>
                  <button mat-menu-item (click)="delete${this.toPascalCase(schema.name)}(element)">
                    <mat-icon>delete</mat-icon>
                    Delete
                  </button>
                </mat-menu>
              </td>
            </ng-container>`
    );
  }

  private generateFormFields(schema: any): string {
    return schema.columns
      .filter((col: any) => !['id', 'created_at', 'updated_at'].includes(col.name))
      .map((col: any) => {
        if (col.type === 'boolean') {
          return `
            <mat-checkbox formControlName="${this.toCamelCase(col.name)}" class="mb-4">
              ${this.toTitleCase(col.name)}
            </mat-checkbox>`;
        } else if (col.type === 'text') {
          return `
            <mat-form-field appearance="outline" class="w-full mb-4">
              <mat-label>${this.toTitleCase(col.name)}</mat-label>
              <textarea matInput formControlName="${this.toCamelCase(col.name)}" rows="4"></textarea>
            </mat-form-field>`;
        } else {
          return `
            <mat-form-field appearance="outline" class="w-full mb-4">
              <mat-label>${this.toTitleCase(col.name)}</mat-label>
              <input matInput formControlName="${this.toCamelCase(col.name)}" ${col.required ? 'required' : ''}>
            </mat-form-field>`;
        }
      })
      .join('');
  }

  private generateFormControls(schema: any): string {
    return schema.columns
      .filter((col: any) => !['id', 'created_at', 'updated_at'].includes(col.name))
      .map((col: any) => {
        const validators = [];
        if (col.required) validators.push('Validators.required');
        if (col.type === 'email') validators.push('Validators.email');
        if (col.maxLength) validators.push(`Validators.maxLength(${col.maxLength})`);

        const validatorArray = validators.length > 0 ? `[${validators.join(', ')}]` : '[]';
        const defaultValue = col.type === 'boolean' ? 'false' : "''";

        return `${this.toCamelCase(col.name)}: [${defaultValue}, ${validatorArray}]`;
      })
      .join(',\n    ');
  }

  private getDisplayColumns(schema: any): string[] {
    const columns = schema.columns
      .filter((col: any) => !['password', 'token'].includes(col.name))
      .slice(0, 5)
      .map((col: any) => col.name);

    columns.push('actions');
    return columns;
  }

  private generateInterfaceFields(schema: any): string {
    return schema.columns
      .map((col: any) => {
        const type = this.mapColumnTypeToTypescript(col.type);
        const optional = col.nullable ? '?' : '';
        return `  ${this.toCamelCase(col.name)}${optional}: ${type};`;
      })
      .join('\n');
  }

  private generateCreateDtoFields(schema: any): string {
    return schema.columns
      .filter((col: any) => !['id', 'created_at', 'updated_at'].includes(col.name))
      .map((col: any) => {
        const type = this.mapColumnTypeToTypescript(col.type);
        const optional = !col.required ? '?' : '';
        return `  ${this.toCamelCase(col.name)}${optional}: ${type};`;
      })
      .join('\n');
  }

  private generateUpdateDtoFields(schema: any): string {
    return schema.columns
      .filter((col: any) => !['id', 'created_at', 'updated_at'].includes(col.name))
      .map((col: any) => {
        const type = this.mapColumnTypeToTypescript(col.type);
        return `  ${this.toCamelCase(col.name)}?: ${type};`;
      })
      .join('\n');
  }

  private generateFilterFields(schema: any): string {
    const filterableColumns = schema.columns.filter((col: any) => ['string', 'boolean', 'date'].includes(col.type)).slice(0, 5);

    return filterableColumns
      .map((col: any) => {
        const type = this.mapColumnTypeToTypescript(col.type);
        return `  ${this.toCamelCase(col.name)}?: ${type};`;
      })
      .join('\n');
  }

  private mapColumnTypeToTypescript(dbType: string): string {
    const typeMap: { [key: string]: string } = {
      varchar: 'string',
      text: 'string',
      integer: 'number',
      bigint: 'number',
      decimal: 'number',
      boolean: 'boolean',
      timestamp: 'Date',
      date: 'Date',
      uuid: 'string',
      json: 'any',
      jsonb: 'any',
    };

    return typeMap[dbType] || 'any';
  }

  private toPascalCase(str: string): string {
    return str
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  private toKebabCase(str: string): string {
    return str
      .split(/[-_]/)
      .map((word) => word.toLowerCase())
      .join('-');
  }

  private toTitleCase(str: string): string {
    return str
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
```

## CLI Generator

```bash
# Generate Angular CRUD from table
nx generate crud user --frontend-only

# With options
nx generate crud product --signals --standalone --bulk-ops
```

## Admin UI Generator

```typescript
// Component for web-based generation
@Component({
  template: `
    <mat-stepper>
      <mat-step label="Select Table">
        <mat-select [(value)]="selectedTable">
          <mat-option *ngFor="let table of tables()" [value]="table">
            {{ table.name }}
          </mat-option>
        </mat-select>
      </mat-step>

      <mat-step label="Configure Options">
        <mat-checkbox [(ngModel)]="options.useSignals">Use Signals</mat-checkbox>
        <mat-checkbox [(ngModel)]="options.standalone">Standalone Components</mat-checkbox>
        <mat-checkbox [(ngModel)]="options.includeBulkOperations">Bulk Operations</mat-checkbox>
      </mat-step>

      <mat-step label="Generate">
        <button mat-raised-button (click)="generate()">Generate CRUD</button>
      </mat-step>
    </mat-stepper>
  `,
})
export class CrudGeneratorComponent {
  generatorService = inject(FrontendGeneratorService);

  tables = signal<any[]>([]);
  selectedTable = signal<any>(null);
  options = signal({
    useSignals: true,
    standalone: true,
    includeBulkOperations: true,
    generateTests: true,
  });

  async generate() {
    const files = await this.generatorService.generateCrudFeature(this.selectedTable(), this.options());

    // Show generated files or download
    console.log('Generated files:', files);
  }
}
```
