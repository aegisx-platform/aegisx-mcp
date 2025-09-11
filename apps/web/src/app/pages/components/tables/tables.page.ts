import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { SelectionModel } from '@angular/cdk/collections';
import { AegisxCardComponent, AegisxAlertComponent } from '@aegisx/ui';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: Date;
}

interface Product {
  position: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

@Component({
  selector: 'ax-tables-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatMenuModule,
    MatChipsModule,
    AegisxCardComponent,
    AegisxAlertComponent
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Table Components</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Examples of data tables using Angular Material.
        </p>
      </div>

      <!-- Alert -->
      <ax-alert type="info" class="mb-8">
        Angular Material tables provide powerful features like sorting, pagination, and filtering.
      </ax-alert>

      <!-- Basic Table -->
      <section class="mb-12">
        <ax-card title="Basic Table" subtitle="Simple data display" appearance="outlined">
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="basicData" class="w-full">
              <!-- Position Column -->
              <ng-container matColumnDef="position">
                <th mat-header-cell *matHeaderCellDef> No. </th>
                <td mat-cell *matCellDef="let element"> {{element.position}} </td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef> Name </th>
                <td mat-cell *matCellDef="let element"> {{element.name}} </td>
              </ng-container>

              <!-- Weight Column -->
              <ng-container matColumnDef="weight">
                <th mat-header-cell *matHeaderCellDef> Weight </th>
                <td mat-cell *matCellDef="let element"> {{element.weight}} </td>
              </ng-container>

              <!-- Symbol Column -->
              <ng-container matColumnDef="symbol">
                <th mat-header-cell *matHeaderCellDef> Symbol </th>
                <td mat-cell *matCellDef="let element"> {{element.symbol}} </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="basicColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: basicColumns;"></tr>
            </table>
          </div>
        </ax-card>
      </section>

      <!-- Advanced Table with Sorting and Pagination -->
      <section class="mb-12">
        <ax-card title="Advanced Table" subtitle="With sorting, filtering, and pagination" appearance="elevated">
          <!-- Search Filter -->
          <mat-form-field appearance="outline" class="w-full mb-4">
            <mat-label>Filter</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Search users...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>

          <div class="overflow-x-auto">
            <table mat-table [dataSource]="dataSource" matSort class="w-full">
              <!-- Checkbox Column -->
              <ng-container matColumnDef="select">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-checkbox (change)="$event ? masterToggle() : null"
                                [checked]="selection.hasValue() && isAllSelected()"
                                [indeterminate]="selection.hasValue() && !isAllSelected()">
                  </mat-checkbox>
                </th>
                <td mat-cell *matCellDef="let row">
                  <mat-checkbox (click)="$event.stopPropagation()"
                                (change)="$event ? selection.toggle(row) : null"
                                [checked]="selection.isSelected(row)">
                  </mat-checkbox>
                </td>
              </ng-container>

              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> ID </th>
                <td mat-cell *matCellDef="let element"> {{element.id}} </td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Name </th>
                <td mat-cell *matCellDef="let element"> {{element.name}} </td>
              </ng-container>

              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Email </th>
                <td mat-cell *matCellDef="let element"> {{element.email}} </td>
              </ng-container>

              <!-- Role Column -->
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Role </th>
                <td mat-cell *matCellDef="let element">
                  <mat-chip [ngClass]="{
                    'bg-blue-100 text-blue-800': element.role === 'Admin',
                    'bg-green-100 text-green-800': element.role === 'User',
                    'bg-purple-100 text-purple-800': element.role === 'Manager'
                  }">
                    {{element.role}}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
                <td mat-cell *matCellDef="let element">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-green-100 text-green-800': element.status === 'active',
                          'bg-red-100 text-red-800': element.status === 'inactive',
                          'bg-yellow-100 text-yellow-800': element.status === 'pending'
                        }">
                    <span class="w-2 h-2 mr-1 rounded-full"
                          [ngClass]="{
                            'bg-green-400': element.status === 'active',
                            'bg-red-400': element.status === 'inactive',
                            'bg-yellow-400': element.status === 'pending'
                          }"></span>
                    {{element.status}}
                  </span>
                </td>
              </ng-container>

              <!-- Last Login Column -->
              <ng-container matColumnDef="lastLogin">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Last Login </th>
                <td mat-cell *matCellDef="let element"> {{element.lastLogin | date:'short'}} </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef> Actions </th>
                <td mat-cell *matCellDef="let element">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item>
                      <mat-icon>edit</mat-icon>
                      <span>Edit</span>
                    </button>
                    <button mat-menu-item>
                      <mat-icon>visibility</mat-icon>
                      <span>View</span>
                    </button>
                    <button mat-menu-item class="text-red-600">
                      <mat-icon>delete</mat-icon>
                      <span>Delete</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800"></tr>
            </table>
          </div>

          <mat-paginator [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons></mat-paginator>
        </ax-card>
      </section>

      <!-- Expandable Table -->
      <section class="mb-12">
        <ax-card title="Expandable Table" subtitle="Click rows to expand" appearance="outlined">
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="productsData" multiTemplateDataRows class="w-full">
              <!-- Product columns -->
              <ng-container matColumnDef="position">
                <th mat-header-cell *matHeaderCellDef> # </th>
                <td mat-cell *matCellDef="let element"> {{element.position}} </td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef> Product </th>
                <td mat-cell *matCellDef="let element"> {{element.name}} </td>
              </ng-container>

              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef> Category </th>
                <td mat-cell *matCellDef="let element"> {{element.category}} </td>
              </ng-container>

              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef> Price </th>
                <td mat-cell *matCellDef="let element"> $\{{ element.price.toFixed(2) }} </td>
              </ng-container>

              <ng-container matColumnDef="stock">
                <th mat-header-cell *matHeaderCellDef> Stock </th>
                <td mat-cell *matCellDef="let element">
                  <span [ngClass]="{
                    'text-green-600': element.stock > 50,
                    'text-yellow-600': element.stock > 10 && element.stock <= 50,
                    'text-red-600': element.stock <= 10
                  }">
                    {{element.stock}}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef> Status </th>
                <td mat-cell *matCellDef="let element">
                  <mat-chip [ngClass]="{
                    'bg-green-100 text-green-800': element.status === 'in_stock',
                    'bg-yellow-100 text-yellow-800': element.status === 'low_stock',
                    'bg-red-100 text-red-800': element.status === 'out_of_stock'
                  }">
                    {{element.status.replace('_', ' ')}}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Expanded Content -->
              <ng-container matColumnDef="expandedDetail">
                <td mat-cell *matCellDef="let element" [attr.colspan]="productColumns.length">
                  <div class="overflow-hidden transition-all duration-300"
                       [@detailExpand]="element == expandedProduct ? 'expanded' : 'collapsed'">
                    <div class="p-4 bg-gray-50 dark:bg-gray-900">
                      <h4 class="font-semibold mb-2">Product Details</h4>
                      <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span class="text-gray-600 dark:text-gray-400">SKU:</span>
                          <span class="ml-2">PRD-{{element.position.toString().padStart(4, '0')}}</span>
                        </div>
                        <div>
                          <span class="text-gray-600 dark:text-gray-400">Last Updated:</span>
                          <span class="ml-2">{{currentDate | date:'short'}}</span>
                        </div>
                        <div>
                          <span class="text-gray-600 dark:text-gray-400">Supplier:</span>
                          <span class="ml-2">Acme Corp</span>
                        </div>
                        <div>
                          <span class="text-gray-600 dark:text-gray-400">Warehouse:</span>
                          <span class="ml-2">Warehouse A</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="productColumns"></tr>
              <tr mat-row *matRowDef="let element; columns: productColumns;"
                  class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  (click)="expandedProduct = expandedProduct === element ? null : element">
              </tr>
              <tr mat-row *matRowDef="let row; columns: ['expandedDetail']" class="h-0"></tr>
            </table>
          </div>
        </ax-card>
      </section>
    </div>
  `,
  styles: [`
    table {
      width: 100%;
    }
    
    .mat-mdc-row .mat-mdc-cell {
      border-bottom: 1px solid transparent;
      border-top: 1px solid transparent;
      cursor: pointer;
    }
    
    tr.detail-row {
      height: 0;
    }
    
    tr.element-row:not(.expanded-row):hover {
      background: whitesmoke;
    }
    
    tr.element-row:not(.expanded-row):active {
      background: #efefef;
    }
    
    .element-detail {
      overflow: hidden;
      display: flex;
    }
  `]
})
export class TablesPage {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Basic table
  basicColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  basicData = [
    {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
    {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
    {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  ];

  // Advanced table
  displayedColumns: string[] = ['select', 'id', 'name', 'email', 'role', 'status', 'lastLogin', 'actions'];
  dataSource: MatTableDataSource<User>;
  selection = new SelectionModel<User>(true, []);

  // Expandable table
  productColumns: string[] = ['position', 'name', 'category', 'price', 'stock', 'status'];
  expandedProduct: Product | null = null;
  productsData: Product[] = [
    {position: 1, name: 'Laptop Pro', category: 'Electronics', price: 1299.99, stock: 25, status: 'low_stock'},
    {position: 2, name: 'Wireless Mouse', category: 'Accessories', price: 29.99, stock: 150, status: 'in_stock'},
    {position: 3, name: 'USB-C Hub', category: 'Accessories', price: 49.99, stock: 0, status: 'out_of_stock'},
    {position: 4, name: 'Monitor 4K', category: 'Electronics', price: 599.99, stock: 75, status: 'in_stock'},
    {position: 5, name: 'Keyboard Mechanical', category: 'Accessories', price: 89.99, stock: 8, status: 'low_stock'},
  ];

  constructor() {
    const users: User[] = [
      {id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', lastLogin: new Date('2024-01-15')},
      {id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active', lastLogin: new Date()},
      {id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', status: 'inactive', lastLogin: new Date('2024-01-10')},
      {id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User', status: 'pending', lastLogin: new Date('2024-01-12')},
      {id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'active', lastLogin: new Date()},
      {id: 6, name: 'Diana Davis', email: 'diana@example.com', role: 'Manager', status: 'active', lastLogin: new Date('2024-01-14')},
      {id: 7, name: 'Edward Miller', email: 'edward@example.com', role: 'Admin', status: 'active', lastLogin: new Date()},
      {id: 8, name: 'Fiona Garcia', email: 'fiona@example.com', role: 'User', status: 'inactive', lastLogin: new Date('2024-01-08')},
    ];
    
    this.dataSource = new MatTableDataSource(users);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  get currentDate() {
    return new Date();
  }
}