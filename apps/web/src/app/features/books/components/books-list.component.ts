import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { fromEventPattern } from 'rxjs';

// Material imports for table
import { SelectionModel } from '@angular/cdk/collections';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatSort,
  MatSortModule,
  Sort,
  SortDirection,
} from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AxDialogService } from '@aegisx/ui';
import {
  ExportOptions,
  ExportService,
  SharedExportComponent,
} from '../../../shared/components/shared-export/shared-export.component';
import { BookService } from '../services/books.service';
import { Book, ListBookQuery } from '../types/books.types';
import { BookCreateDialogComponent } from './books-create.dialog';
import {
  BookEditDialogComponent,
  BookEditDialogData,
} from './books-edit.dialog';
import {
  BookViewDialogComponent,
  BookViewDialogData,
} from './books-view.dialog';

interface AdvancedFilters {
  available?: boolean;
  genre: string;
  author_id?: string;
}

@Component({
  selector: 'app-books-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatCardModule,
    MatMenuModule,
    SharedExportComponent,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header with Stats Summary -->
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-2xl font-semibold text-gray-900">Books</h1>
              <span
                class="px-2.5 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-md"
              >
                {{ booksService.totalBook() }} total
              </span>
            </div>
            <p class="text-sm text-gray-600">Manage your book collection</p>
          </div>
          <button
            (click)="openCreateDialog()"
            [disabled]="
              booksService.loading() || booksService.permissionError()
            "
            class="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
          >
            <mat-icon class="!text-lg !w-5 !h-5">add</mat-icon>
            Add book
          </button>
        </div>

        <!-- Permission Error -->
        @if (booksService.permissionError()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <mat-icon class="text-red-600 !text-xl !w-5 !h-5">error</mat-icon>
              <div class="flex-1">
                <h3 class="text-sm font-medium text-red-900">Access Denied</h3>
                <p class="mt-1 text-sm text-red-700">
                  You don't have permission to access or modify books.
                </p>
              </div>
              <button
                (click)="booksService.clearPermissionError()"
                class="text-red-400 hover:text-red-600"
              >
                <mat-icon class="!text-xl !w-5 !h-5">close</mat-icon>
              </button>
            </div>
          </div>
        }

        <!-- Minimal Stats Cards - Separated -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Books Card -->
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full"
              >
                <mat-icon class="!w-5 !h-5 text-blue-600"
                  >library_books</mat-icon
                >
              </div>
              <div>
                <div class="text-xs text-gray-500">Total Books</div>
                <div class="text-xl font-bold text-gray-900">
                  {{ booksService.totalBook() }}
                </div>
              </div>
            </div>
          </div>

          <!-- Available Card -->
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full"
              >
                <mat-icon class="!w-5 !h-5 text-green-600"
                  >check_circle</mat-icon
                >
              </div>
              <div>
                <div class="text-xs text-gray-500">Available</div>
                <div class="text-xl font-bold text-gray-900">
                  {{ stats().available }}
                  <span class="text-xs text-green-600"
                    >{{ getPercentage(stats().available) }}%</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Unavailable Card -->
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full"
              >
                <mat-icon class="!w-5 !h-5 text-red-600">block</mat-icon>
              </div>
              <div>
                <div class="text-xs text-gray-500">Unavailable</div>
                <div class="text-xl font-bold text-gray-900">
                  {{ stats().unavailable }}
                  <span class="text-xs text-red-600"
                    >{{ getPercentage(stats().unavailable) }}%</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- This Week Card -->
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full"
              >
                <mat-icon class="!w-5 !h-5 text-orange-600"
                  >trending_up</mat-icon
                >
              </div>
              <div>
                <div class="text-xs text-gray-500">This Week</div>
                <div class="text-xl font-bold text-gray-900">
                  {{ stats().recentWeek }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Search and Filters -->
        <!-- Filters Panel -->
        <div class="bg-slate-100 rounded-lg border border-gray-200 p-5">
          <!-- Main Filter Row -->
          <div class="flex flex-col md:flex-row gap-3 md:items-center">
            <!-- Search Input with Buttons (single row, no wrap) -->
            <div class="flex flex-row flex-nowrap gap-2 items-center md:w-2/5">
              <div class="relative flex-1 min-w-0">
                <mat-icon
                  class="absolute left-3 top-3 !text-lg !w-5 !h-5 text-gray-400"
                  >search</mat-icon
                >
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  (keyup.enter)="search()"
                  placeholder="Search by title, author, ISBN... (Press Enter or click Search)"
                  aria-label="Search books"
                  [class.pr-10]="searchTerm || booksService.loading()"
                  class="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  *ngIf="searchTerm"
                  (click)="clearSearch()"
                  aria-label="Clear search"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <mat-icon class="!text-lg !w-5 !h-5">close</mat-icon>
                </button>
              </div>
              <button
                (click)="search()"
                class="flex-shrink-0 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                aria-label="Search"
                [matTooltip]="
                  searchTerm.trim()
                    ? 'Search books'
                    : 'Enter search term to search'
                "
              >
                <mat-icon class="!text-lg !w-5 !h-5">search</mat-icon>
                Search
              </button>
              <button
                (click)="refresh()"
                class="flex-shrink-0 px-3 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                [class.opacity-50]="booksService.loading()"
                [class.cursor-wait]="booksService.loading()"
                aria-label="Refresh"
                [matTooltip]="
                  booksService.loading() ? 'Loading...' : 'Reload all books'
                "
              >
                <mat-icon class="!text-lg !w-5 !h-5">refresh</mat-icon>
              </button>
            </div>
            <!-- Quick Filters - flex grow -->
            <div class="flex items-center gap-2 flex-wrap flex-1">
              <button
                (click)="setQuickFilter('all')"
                [class]="
                  quickFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                "
                class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
              >
                All
              </button>
              <button
                (click)="setQuickFilter('active')"
                [class]="
                  quickFilter === 'active'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                "
                class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
              >
                Available
              </button>
              <button
                (click)="setQuickFilter('unavailable')"
                [class]="
                  quickFilter === 'unavailable'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                "
                class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
              >
                Unavailable
              </button>

              <!-- Divider -->
              <div class="h-6 w-px bg-gray-300 mx-1 hidden md:block"></div>

              <!-- Advanced Filters Toggle -->
              <button
                (click)="showAdvancedFilters.set(!showAdvancedFilters())"
                [class]="
                  showAdvancedFilters()
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-gray-700 border-gray-300'
                "
                class="px-3 py-2 text-sm font-medium rounded-md border hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <mat-icon class="!text-base !w-4 !h-4">tune</mat-icon>
                More filters
                @if (hasActiveFilters()) {
                  <span
                    class="ml-1 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full"
                  >
                    {{ getActiveFilterCount() }}
                  </span>
                }
              </button>

              <!-- Spacer to push items to right -->
              <div class="flex-1"></div>

              <!-- Export Button -->
              <app-export
                [exportService]="exportServiceAdapter"
                [currentFilters]="getExportFilters()"
                [selectedItems]="selectedItems()"
                [availableFields]="availableExportFields"
                [moduleName]="'books'"
                (exportStarted)="onExportStarted($event)"
                (exportCompleted)="onExportCompleted($event)"
              ></app-export>

              <!-- Clear All (show when filters active) -->
              @if (hasActiveFilters()) {
                <button
                  (click)="clearAllFilters()"
                  class="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1"
                >
                  <mat-icon class="!text-base !w-4 !h-4">clear</mat-icon>
                  Clear
                </button>
              }
            </div>
          </div>

          <!-- Active Filter Chips -->
          @if (hasActiveFilters()) {
            <div class="mt-3 flex flex-wrap gap-2">
              @if (searchTermSignal()) {
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium"
                >
                  <mat-icon class="!text-sm !w-4 !h-4">search</mat-icon>
                  Search: {{ searchTermSignal() }}
                  <button
                    (click)="searchTermSignal.set('')"
                    class="hover:text-blue-900"
                  >
                    <mat-icon class="!text-sm !w-3 !h-3">close</mat-icon>
                  </button>
                </span>
              }
              @if (availableFilterSignal() === true) {
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium"
                >
                  <mat-icon class="!text-sm !w-4 !h-4">check_circle</mat-icon>
                  Available
                  <button
                    (click)="
                      availableInputSignal.set(undefined);
                      availableFilterSignal.set(undefined);
                      quickFilter = 'all'
                    "
                    class="hover:text-green-900"
                  >
                    <mat-icon class="!text-sm !w-3 !h-3">close</mat-icon>
                  </button>
                </span>
              }
              @if (availableFilterSignal() === false) {
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium"
                >
                  <mat-icon class="!text-sm !w-4 !h-4">block</mat-icon>
                  Unavailable
                  <button
                    (click)="
                      availableInputSignal.set(undefined);
                      availableFilterSignal.set(undefined);
                      quickFilter = 'all'
                    "
                    class="hover:text-red-900"
                  >
                    <mat-icon class="!text-sm !w-3 !h-3">close</mat-icon>
                  </button>
                </span>
              }
              @if (genreFilterSignal()) {
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium"
                >
                  <mat-icon class="!text-sm !w-4 !h-4">category</mat-icon>
                  Genre: {{ genreFilterSignal() }}
                  <button
                    (click)="
                      genreInputSignal.set(''); genreFilterSignal.set('')
                    "
                    class="hover:text-purple-900"
                  >
                    <mat-icon class="!text-sm !w-3 !h-3">close</mat-icon>
                  </button>
                </span>
              }
              @if (authorIdFilterSignal()) {
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium"
                >
                  <mat-icon class="!text-sm !w-4 !h-4">person</mat-icon>
                  Author: {{ authorIdFilterSignal() }}
                  <button
                    (click)="
                      authorIdInputSignal.set(''); authorIdFilterSignal.set('')
                    "
                    class="hover:text-orange-900"
                  >
                    <mat-icon class="!text-sm !w-3 !h-3">close</mat-icon>
                  </button>
                </span>
              }
            </div>
          }

          <!-- Advanced Filters Panel -->
          @if (showAdvancedFilters()) {
            <div class="mt-4 pt-4 border-t border-gray-200">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5"
                    >Status</label
                  >
                  <select
                    [(ngModel)]="availableFilter"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option [ngValue]="undefined">All statuses</option>
                    <option [ngValue]="true">Available only</option>
                    <option [ngValue]="false">Unavailable only</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5"
                    >Genre</label
                  >
                  <input
                    type="text"
                    [(ngModel)]="genreFilter"
                    (keyup.enter)="applyFilterImmediate()"
                    placeholder="e.g., Fiction, Science"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5"
                    >Author ID</label
                  >
                  <input
                    type="text"
                    [(ngModel)]="authorIdFilter"
                    (keyup.enter)="applyFilterImmediate()"
                    placeholder="Search by author"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <!-- Apply Filters Button -->
              <div class="mt-4 flex justify-end gap-2">
                <button
                  (click)="clearAllFilters()"
                  class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  (click)="applyFilterImmediate()"
                  [disabled]="booksService.loading()"
                  class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Error State -->
        @if (booksService.error()) {
          <!-- Error Message -->
          <div
            class="bg-white rounded-lg border border-gray-200 p-12 text-center"
          >
            <mat-icon class="!text-4xl !w-12 !h-12 text-red-600 mx-auto"
              >error_outline</mat-icon
            >
            <h3 class="text-lg font-medium text-gray-900 mt-4">
              Error Loading Books
            </h3>
            <p class="text-sm text-gray-600 mt-2">{{ booksService.error() }}</p>
            <button
              (click)="refresh()"
              class="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        }

        <!-- Table Section: always in DOM -->
        <div
          class="bg-white rounded-lg border border-gray-200 overflow-hidden tremor-table relative"
        >
          <!-- Loading Overlay -->
          @if (booksService.loading()) {
            <div
              class="absolute inset-0 bg-white/75 backdrop-blur-sm flex items-center justify-center z-10"
            >
              <div class="text-center">
                <mat-spinner class="!mx-auto" [diameter]="40"></mat-spinner>
                <p class="text-sm text-gray-600 mt-4">Loading books...</p>
              </div>
            </div>
          }
          <!-- Bulk Actions -->
          @if (selection.selected.length > 0) {
            <div
              class="bg-blue-50 border-b border-blue-200 px-5 py-3 flex items-center justify-between"
            >
              <span class="text-sm font-medium text-blue-900"
                >{{ selection.selected.length }} selected</span
              >
              <button
                (click)="bulkDelete()"
                class="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700"
              >
                Delete selected
              </button>
            </div>
          }

          <!-- Table Container -->
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="dataSource" matSort class="w-full">
              <!-- ...existing columns and rows... -->
              <!-- Checkbox Column -->
              <ng-container matColumnDef="select">
                <th mat-header-cell *matHeaderCellDef class="w-12">
                  <mat-checkbox
                    (change)="$event ? toggleAllRows() : null"
                    [checked]="selection.hasValue() && isAllSelected()"
                    [indeterminate]="selection.hasValue() && !isAllSelected()"
                  ></mat-checkbox>
                </th>
                <td mat-cell *matCellDef="let row">
                  <mat-checkbox
                    (click)="$event.stopPropagation()"
                    (change)="$event ? selection.toggle(row) : null"
                    [checked]="selection.isSelected(row)"
                  ></mat-checkbox>
                </td>
              </ng-container>
              <!-- ...other columns unchanged... -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
                <td mat-cell *matCellDef="let book">
                  <div class="text-md font-semibold text-gray-900">
                    {{ book.title }}
                  </div>
                  @if (book.description) {
                    <div class="text-sm text-gray-500 mt-0.5">
                      {{ book.description | slice: 0 : 50 }}...
                    </div>
                  }
                </td>
              </ng-container>
              <ng-container matColumnDef="author_id">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  Author
                </th>
                <td
                  mat-cell
                  *matCellDef="let book"
                  class="text-md text-gray-900"
                >
                  {{ book.author_id }}
                </td>
              </ng-container>
              <ng-container matColumnDef="isbn">
                <th mat-header-cell *matHeaderCellDef>ISBN</th>
                <td mat-cell *matCellDef="let book">
                  <span class="text-md font-mono text-gray-600">{{
                    book.isbn
                  }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="genre">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Genre</th>
                <td mat-cell *matCellDef="let book">
                  @if (book.genre) {
                    <span
                      class="inline-flex px-2.5 py-1 text-md font-medium bg-gray-100 text-gray-700 rounded"
                      >{{ book.genre }}</span
                    >
                  }
                </td>
              </ng-container>
              <ng-container matColumnDef="pages">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Pages</th>
                <td
                  mat-cell
                  *matCellDef="let book"
                  class="text-md text-gray-600"
                >
                  {{ book.pages }}
                </td>
              </ng-container>
              <ng-container matColumnDef="available">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  Status
                </th>
                <td mat-cell *matCellDef="let book">
                  @if (book.available) {
                    <span
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 text-md font-medium text-green-700 bg-green-50 rounded"
                      ><span class="w-2 h-2 bg-green-600 rounded-full"></span
                      >Active</span
                    >
                  } @else {
                    <span
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 text-md font-medium text-gray-700 bg-gray-100 rounded"
                      ><span class="w-2 h-2 bg-gray-400 rounded-full"></span
                      >Inactive</span
                    >
                  }
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="text-right w-20">
                  Actions
                </th>
                <td mat-cell *matCellDef="let book" class="text-right">
                  <button
                    mat-icon-button
                    [matMenuTriggerFor]="actionMenu"
                    matTooltip="Actions"
                    matTooltipPosition="above"
                    aria-label="More actions"
                  >
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #actionMenu="matMenu" [hasBackdrop]="false">
                    <button mat-menu-item (click)="onEditBook(book)">
                      <mat-icon>edit</mat-icon><span>Edit</span>
                    </button>
                    <button mat-menu-item (click)="onViewBook(book)">
                      <mat-icon>visibility</mat-icon><span>View Details</span>
                    </button>
                    <button mat-menu-item (click)="onDeleteBook(book)">
                      <mat-icon class="text-red-600">delete</mat-icon
                      ><span>Delete</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr
                mat-row
                *matRowDef="let row; columns: displayedColumns"
                class="hover:bg-gray-50"
                [attr.data-book-id]="row.id"
              ></tr>
            </table>
          </div>

          <!-- Paginator -->
          <mat-paginator
            [length]="booksService.totalBook()"
            [pageSize]="25"
            [pageSizeOptions]="[10, 25, 50, 100]"
            [pageIndex]="0"
            showFirstLastButtons
            class="border-t border-gray-200"
          ></mat-paginator>
        </div>

        <!-- Empty State: show below table if no data and not loading/error -->
        @if (
          !booksService.loading() &&
          !booksService.error() &&
          dataSource.data.length === 0
        ) {
          <!-- Empty State Message -->
          <div
            class="bg-white rounded-lg border border-gray-200 p-12 text-center"
          >
            <mat-icon class="!text-4xl !w-12 !h-12 text-gray-400 mx-auto"
              >menu_book</mat-icon
            >
            <h3 class="text-lg font-medium text-gray-900 mt-4">
              No books found
            </h3>
            <p class="text-sm text-gray-600 mt-2">
              @if (hasActiveFilters()) {
                Try adjusting your search or filters
              } @else {
                Get started by adding your first book
              }
            </p>
            @if (hasActiveFilters()) {
              <button
                (click)="clearAllFilters()"
                class="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Clear filters
              </button>
            } @else {
              <button
                (click)="openCreateDialog()"
                class="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Add your first book
              </button>
            }
          </div>
        }
        <!-- Removed extra closing div -->
      </div>
    </div>
  `,
  styles: [
    `
      /* Tremor-style Material Table */
      ::ng-deep .tremor-table {
        .mat-mdc-table {
          background: white;
        }

        .mat-mdc-header-row {
          background-color: #f3f4f6;
          border-bottom: 2px solid #d1d5db;
        }

        .mat-mdc-header-cell {
          color: #1f2937;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.75rem 1.25rem;
          border-bottom: none;
        }

        .mat-mdc-cell {
          padding: 0.5rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          color: #111827;
        }

        .mat-mdc-row {
          transition: background-color 0.2s ease;
        }

        .mat-mdc-row:nth-child(odd) {
          background-color: #ffffff;
        }

        .mat-mdc-row:nth-child(even) {
          background-color: #f9fafb;
        }

        .mat-mdc-row:hover {
          background-color: #f3f4f6 !important;
        }

        .mat-sort-header-arrow {
          color: #6b7280;
        }

        .mat-mdc-checkbox .mdc-checkbox__background {
          border-color: #d1d5db;
        }

        .mat-mdc-checkbox.mat-mdc-checkbox-checked .mdc-checkbox__background {
          background-color: #2563eb;
          border-color: #2563eb;
        }
      }

      /* Paginator Tremor Style */
      ::ng-deep .mat-mdc-paginator {
        background: white;
        color: #374151;
        font-size: 0.875rem;
      }

      ::ng-deep .mat-mdc-paginator-page-size-label,
      ::ng-deep .mat-mdc-paginator-range-label {
        color: #6b7280;
        font-size: 0.875rem;
      }

      ::ng-deep .mat-mdc-icon-button {
        color: #6b7280;
      }

      ::ng-deep .mat-mdc-icon-button:hover:not([disabled]) {
        color: #111827;
        background-color: #f3f4f6;
      }

      ::ng-deep .mat-mdc-icon-button[disabled] {
        color: #d1d5db;
      }
    `,
  ],
})
export class BooksListComponent {
  booksService = inject(BookService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private axDialog = inject(AxDialogService);
  private cdr = inject(ChangeDetectorRef);

  // Mat-Table setup
  displayedColumns: string[] = [
    'select',
    'title',
    'author_id',
    'isbn',
    'genre',
    'pages',
    'available',
    'actions',
  ];
  dataSource = new MatTableDataSource<Book>([]);
  selection = new SelectionModel<Book>(true, []);

  // Selection for export feature (like authors)
  private selectedIdsSignal = signal<Set<string>>(new Set());
  readonly selectedItems = computed(() =>
    this.booksService
      .booksList()
      .filter((item) => this.selectedIdsSignal().has(item.id)),
  );

  // --- Signals for sort, page, search ---
  sortState = signal<{ active: string; direction: SortDirection }>({
    active: '',
    direction: '',
  });
  pageState = signal<{ index: number; size: number }>({ index: 0, size: 25 });

  // Search & Filter Signals
  protected searchTermSignal = signal(''); // Active search term (sent to API)
  protected searchInputSignal = signal(''); // Input field value (not auto-searched)

  // Advanced filter INPUT signals (not sent to API until Apply is clicked)
  protected genreInputSignal = signal('');
  protected authorIdInputSignal = signal('');
  protected availableInputSignal = signal<boolean | undefined>(undefined);

  // Advanced filter ACTIVE signals (sent to API)
  protected genreFilterSignal = signal('');
  protected authorIdFilterSignal = signal('');
  protected availableFilterSignal = signal<boolean | undefined>(undefined);

  // Holds current MatSort subscription
  private matSortSubscription?: import('rxjs').Subscription;

  /**
   * Angular Material sort event subscription
   * Ensures only one subscription at a time
   */
  @ViewChild(MatSort)
  set matSort(sort: MatSort | undefined) {
    this.unsubscribeMatSort();
    if (sort) {
      this.matSortSubscription = this.subscribeMatSort(sort);
    }
  }

  /**
   * Subscribe to MatSort.sortChange and update sortState
   */
  private subscribeMatSort(sort: MatSort): import('rxjs').Subscription {
    return fromEventPattern<Sort>((h) => sort.sortChange.subscribe(h))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((s) => {
        console.log('[BooksList] DEBUG sortChange:', s);
        // Reset page to 0 on sort change
        if (this.paginator) this.paginator.pageIndex = 0;
        this.sortState.set({ active: s.active, direction: s.direction });
      });
  }

  /**
   * Unsubscribe previous MatSort subscription if exists
   */
  private unsubscribeMatSort() {
    if (this.matSortSubscription) {
      this.matSortSubscription.unsubscribe();
      this.matSortSubscription = undefined;
    }
  }

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  private destroyRef = inject(DestroyRef);

  // Search & Filter UI State
  quickFilter: 'all' | 'active' | 'unavailable' = 'all';
  showAdvancedFilters = signal(false);

  // Computed signal for advanced filter INPUTS (for display in form)
  advancedFilters = computed(() => ({
    available: this.availableInputSignal(),
    genre: this.genreInputSignal(),
    author_id: this.authorIdInputSignal(),
  }));

  // Two-way binding helpers (for ngModel)
  get searchTerm() {
    return this.searchInputSignal();
  }
  set searchTerm(value: string) {
    this.searchInputSignal.set(value);
    // Note: Does NOT trigger search automatically
    // User must click Search button or press Enter
  }

  // Getters/setters for advanced filter INPUTS (form binding)
  get genreFilter() {
    return this.genreInputSignal();
  }
  set genreFilter(value: string) {
    this.genreInputSignal.set(value);
  }

  get authorIdFilter() {
    return this.authorIdInputSignal();
  }
  set authorIdFilter(value: string) {
    this.authorIdInputSignal.set(value);
  }

  get availableFilter() {
    return this.availableInputSignal();
  }
  set availableFilter(value: boolean | undefined) {
    this.availableInputSignal.set(value);
  }

  // Stats from API (should come from dedicated stats endpoint)
  stats = computed(() => ({
    total: this.booksService.totalBook(),
    available: this.booksService.availableCount(),
    unavailable: this.booksService.unavailableCount(),
    recentWeek: this.booksService.thisWeekCount(),
  }));

  // Export configuration
  exportServiceAdapter: ExportService = {
    export: (options: ExportOptions) => this.booksService.exportBook(options),
  };

  availableExportFields = [
    { key: 'id', label: 'Id' },
    { key: 'title', label: 'Title' },
    { key: 'author_id', label: 'Author ID' },
    { key: 'isbn', label: 'ISBN' },
    { key: 'genre', label: 'Genre' },
    { key: 'pages', label: 'Pages' },
    { key: 'available', label: 'Available' },
    { key: 'created_at', label: 'Created at' },
    { key: 'updated_at', label: 'Updated at' },
  ];

  queryParams: Partial<ListBookQuery> = {
    page: 1,
    limit: 25,
  };

  subscriptionsInitialized = false;

  ngAfterViewInit() {
    this.cdr.detectChanges();
    // Subscribe paginator changes to update pageState
    if (this.paginator) {
      fromEventPattern<{ pageIndex: number; pageSize: number }>((h) =>
        this.paginator.page.subscribe(h),
      )
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((event) => {
          this.pageState.set({ index: event.pageIndex, size: event.pageSize });
        });
    }
  }

  // --- Effect: reload books on sort/page/search/filter change ---
  constructor() {
    // Sync export selection state
    effect(() => {
      const ids = new Set(this.selection.selected.map((b) => b.id));
      this.selectedIdsSignal.set(ids);
    });

    // Reload data when signals change (no auto-search on typing)
    effect(async () => {
      const sort = this.sortState();
      const page = this.pageState();
      const search = this.searchTermSignal();
      const available = this.availableFilterSignal();
      const genre = this.genreFilterSignal();
      const authorId = this.authorIdFilterSignal();

      const params: Partial<ListBookQuery> = {
        page: (page?.index ?? 0) + 1,
        limit: page?.size ?? 25,
        sort:
          sort.active && sort.direction
            ? `${sort.active}:${sort.direction}`
            : undefined,
        search: search?.trim() || undefined,
        available: available,
        genre: genre?.trim() || undefined,
        author_id: authorId?.trim() || undefined,
      };
      Object.keys(params).forEach(
        (k) =>
          params[k as keyof typeof params] === undefined &&
          delete params[k as keyof typeof params],
      );

      console.log('[BooksList] DEBUG params to API:', params);

      await this.booksService.loadBookList(params);
      this.dataSource.data = this.booksService.booksList();
      if (this.paginator) {
        this.paginator.length = this.booksService.totalBook();
      }
    });
  }

  // Search & Filter Methods

  search() {
    // Apply search when user clicks Search button or presses Enter
    const searchValue = this.searchInputSignal().trim();
    this.searchTermSignal.set(searchValue);
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  refresh() {
    // Clear all inputs
    this.searchInputSignal.set('');
    this.searchTermSignal.set('');
    this.genreInputSignal.set('');
    this.authorIdInputSignal.set('');
    this.availableInputSignal.set(undefined);

    // Clear all active filters
    this.quickFilter = 'all';
    this.availableFilterSignal.set(undefined);
    this.genreFilterSignal.set('');
    this.authorIdFilterSignal.set('');

    if (this.paginator) this.paginator.pageIndex = 0;
  }

  applyFilterImmediate() {
    // Apply advanced filter inputs to active filters
    // This triggers the effect to reload data
    this.genreFilterSignal.set(this.genreInputSignal().trim());
    this.authorIdFilterSignal.set(this.authorIdInputSignal().trim());
    this.availableFilterSignal.set(this.availableInputSignal());

    // Reset pagination
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  clearSearch() {
    this.searchInputSignal.set('');
    this.searchTermSignal.set('');
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  setQuickFilter(filter: 'all' | 'active' | 'unavailable') {
    this.quickFilter = filter;

    // Update both input and active signals for quick filters
    if (filter === 'all') {
      this.availableInputSignal.set(undefined);
      this.availableFilterSignal.set(undefined);
    } else if (filter === 'active') {
      this.availableInputSignal.set(true);
      this.availableFilterSignal.set(true);
    } else if (filter === 'unavailable') {
      this.availableInputSignal.set(false);
      this.availableFilterSignal.set(false);
    }

    if (this.paginator) this.paginator.pageIndex = 0;
  }

  clearAllFilters() {
    // Clear all inputs
    this.searchInputSignal.set('');
    this.genreInputSignal.set('');
    this.authorIdInputSignal.set('');
    this.availableInputSignal.set(undefined);

    // Clear all active filters
    this.searchTermSignal.set('');
    this.quickFilter = 'all';
    this.availableFilterSignal.set(undefined);
    this.genreFilterSignal.set('');
    this.authorIdFilterSignal.set('');

    this.showAdvancedFilters.set(false);
    if (this.paginator) this.paginator.pageIndex = 0;
  }

  // Helper methods for filter UI
  hasActiveFilters(): boolean {
    // Check ACTIVE filters (not inputs)
    return (
      this.searchTermSignal().trim() !== '' ||
      this.availableFilterSignal() !== undefined ||
      this.genreFilterSignal().trim() !== '' ||
      (this.authorIdFilterSignal()?.trim() || '') !== ''
    );
  }

  getActiveFilterCount(): number {
    // Count ACTIVE filters (not inputs)
    let count = 0;
    if (this.searchTermSignal().trim()) count++;
    if (this.availableFilterSignal() !== undefined) count++;
    if (this.genreFilterSignal().trim()) count++;
    if (this.authorIdFilterSignal()?.trim()) count++;
    return count;
  }

  // Selection Methods
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  // CRUD Operations
  openCreateDialog() {
    const dialogRef = this.dialog.open(BookCreateDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        // effect will reload
      }
    });
  }

  onViewBook(book: Book) {
    this.dialog.open(BookViewDialogComponent, {
      width: '600px',
      data: { books: book } as BookViewDialogData,
    });
  }

  onEditBook(book: Book) {
    const dialogRef = this.dialog.open(BookEditDialogComponent, {
      width: '600px',
      data: { books: book } as BookEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        // effect will reload
      }
    });
  }

  onDeleteBook(book: Book) {
    this.axDialog.confirmDelete(book.title).subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.booksService.deleteBook(book.id);
          this.snackBar.open('Book deleted successfully', 'Close', {
            duration: 3000,
          });
          // effect will reload
        } catch {
          this.snackBar.open('Failed to delete book', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  bulkDelete() {
    const count = this.selection.selected.length;
    this.axDialog
      .confirmBulkDelete(count, 'books')
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            const deletePromises = this.selection.selected.map((book) =>
              this.booksService.deleteBook(book.id),
            );

            await Promise.all(deletePromises);
            this.snackBar.open(
              `${count} book(s) deleted successfully`,
              'Close',
              { duration: 3000 },
            );
            this.selection.clear();
            // effect will reload
          } catch {
            this.snackBar.open('Failed to delete some books', 'Close', {
              duration: 3000,
            });
          }
        }
      });
  }

  // ===== EXPORT EVENT HANDLERS =====

  onExportStarted(options: ExportOptions) {
    console.log('Export started:', options);
    this.snackBar.open(
      `Preparing ${options.format.toUpperCase()} export...`,
      '',
      {
        duration: 2000,
      },
    );
  }

  onExportCompleted(result: { success: boolean; format: string }) {
    if (result.success) {
      this.snackBar.open(
        `${result.format.toUpperCase()} export completed successfully!`,
        'Close',
        {
          duration: 3000,
          panelClass: ['success-snackbar'],
        },
      );
    } else {
      this.snackBar.open(
        `${result.format.toUpperCase()} export failed`,
        'Close',
        {
          duration: 5000,
          panelClass: ['error-snackbar'],
        },
      );
    }
  }

  // ===== FILTER HELPERS =====

  filters() {
    return this.advancedFilters;
  }

  getExportFilters(): Record<string, unknown> {
    return {
      searchTerm: this.searchTermSignal(),
      available: this.availableFilterSignal(),
      genre: this.genreFilterSignal(),
      author_id: this.authorIdFilterSignal(),
    };
  }

  activeFiltersCount(): number {
    let count = 0;
    if (this.searchTermSignal().length > 0) count++;
    if (this.availableFilterSignal() !== undefined) count++;
    if (this.genreFilterSignal() !== '') count++;
    if (this.authorIdFilterSignal() !== '') count++;
    return count;
  }

  // Stats Methods
  getPercentage(count: number): number {
    const total = this.stats().total;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  // TrackBy function for performance
  trackByBookId(_index: number, book: Book): string {
    return book.id;
  }
}
