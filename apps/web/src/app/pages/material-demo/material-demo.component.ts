import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// Material Imports
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import {
  MatBottomSheetModule,
  MatBottomSheet,
} from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { MatNativeDateModule } from '@angular/material/core';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Observable, map, startWith } from 'rxjs';

interface FoodNode {
  name: string;
  children?: FoodNode[];
}

interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'app-material-demo',
  standalone: true,
  styleUrls: ['./material-demo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    DragDropModule,
  ],
  template: `
    <div class="material-demo-wrapper">
      <div class="material-demo-container">
        <h1 class="text-3xl font-bold mb-8">
          Angular Material Components Demo
        </h1>

        <!-- Form Controls Section -->
        <section class="demo-section">
          <h2 class="text-2xl font-semibold mb-6">Form Controls</h2>

          <!-- Autocomplete -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Autocomplete</h3>
            <mat-form-field appearance="outline" class="demo-full-width">
              <mat-label>Choose a state</mat-label>
              <input
                matInput
                [formControl]="stateCtrl"
                [matAutocomplete]="auto"
              />
              <mat-autocomplete #auto="matAutocomplete">
                @for (option of filteredStates | async; track option) {
                  <mat-option [value]="option">{{ option }}</mat-option>
                }
              </mat-autocomplete>
            </mat-form-field>
          </div>

          <!-- Checkbox -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Checkbox</h3>
            <mat-checkbox [formControl]="checkboxCtrl"
              >I agree to terms</mat-checkbox
            >
            <mat-checkbox class="ml-4" [indeterminate]="true"
              >Indeterminate</mat-checkbox
            >
          </div>

          <!-- Date Picker -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Date Picker</h3>
            <mat-form-field appearance="outline" class="demo-full-width">
              <mat-label>Choose a date</mat-label>
              <input
                matInput
                [matDatepicker]="picker"
                [formControl]="dateCtrl"
              />
              <mat-datepicker-toggle
                matIconSuffix
                [for]="picker"
              ></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
          </div>

          <!-- Form Field & Input -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Form Field & Input</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>Input</mat-label>
                <input
                  matInput
                  placeholder="Ex. Pizza"
                  [formControl]="inputCtrl"
                />
                @if (inputCtrl.hasError('required')) {
                  <mat-error>This field is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Fill Input</mat-label>
                <input matInput placeholder="Ex. Burger" />
                <mat-icon matSuffix>sentiment_very_satisfied</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Textarea</mat-label>
                <textarea
                  matInput
                  rows="4"
                  placeholder="Ex. It's a great day..."
                ></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Select</mat-label>
                <mat-select [formControl]="selectCtrl">
                  <mat-option value="option1">Option 1</mat-option>
                  <mat-option value="option2">Option 2</mat-option>
                  <mat-option value="option3">Option 3</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <!-- Radio Button -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Radio Button</h3>
            <mat-radio-group [formControl]="radioCtrl">
              <mat-radio-button value="1" class="mr-4"
                >Option 1</mat-radio-button
              >
              <mat-radio-button value="2" class="mr-4"
                >Option 2</mat-radio-button
              >
              <mat-radio-button value="3">Option 3</mat-radio-button>
            </mat-radio-group>
          </div>

          <!-- Slide Toggle -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Slide Toggle</h3>
            <mat-slide-toggle [formControl]="slideToggleCtrl"
              >Slide me!</mat-slide-toggle
            >
          </div>

          <!-- Slider -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Slider</h3>
            <mat-slider min="0" max="100" step="1" class="demo-full-width">
              <input matSliderThumb [formControl]="sliderCtrl" />
            </mat-slider>
            <p>Value: {{ sliderCtrl.value }}</p>
          </div>
        </section>

        <!-- Navigation Section -->
        <section class="demo-section">
          <h2 class="text-2xl font-semibold mb-6">Navigation</h2>

          <!-- Menu -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Menu</h3>
            <button
              mat-raised-button
              color="primary"
              [matMenuTriggerFor]="menu"
            >
              Menu
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item>
                <mat-icon>dialpad</mat-icon>
                <span>Redial</span>
              </button>
              <button mat-menu-item disabled>
                <mat-icon>voicemail</mat-icon>
                <span>Check voice mail</span>
              </button>
              <button mat-menu-item>
                <mat-icon>notifications_off</mat-icon>
                <span>Disable alerts</span>
              </button>
            </mat-menu>
          </div>

          <!-- Sidenav -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Sidenav (Mini Example)</h3>
            <mat-drawer-container class="demo-sidenav-container">
              <mat-drawer #drawer mode="side">
                <p class="p-4">Drawer content</p>
                <button mat-button (click)="drawer.close()">Close</button>
              </mat-drawer>
              <mat-drawer-content class="p-4">
                <button
                  mat-raised-button
                  color="primary"
                  (click)="drawer.open()"
                >
                  Open Drawer
                </button>
              </mat-drawer-content>
            </mat-drawer-container>
          </div>

          <!-- Toolbar -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Toolbar</h3>
            <mat-toolbar color="primary">
              <button mat-icon-button>
                <mat-icon>menu</mat-icon>
              </button>
              <span>My Application</span>
              <span class="flex-1"></span>
              <button mat-icon-button>
                <mat-icon>favorite</mat-icon>
              </button>
              <button mat-icon-button>
                <mat-icon>share</mat-icon>
              </button>
            </mat-toolbar>
          </div>
        </section>

        <!-- Layout Section -->
        <section class="demo-section">
          <h2 class="text-2xl font-semibold mb-6">Layout</h2>

          <!-- Card -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Card</h3>
            <mat-card class="max-w-md">
              <mat-card-header>
                <mat-card-title>Shiba Inu</mat-card-title>
                <mat-card-subtitle>Dog Breed</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p>
                  The Shiba Inu is the smallest of the six original and distinct
                  spitz breeds of dog from Japan. A small, agile dog that copes
                  very well with mountainous terrain.
                </p>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button>LIKE</button>
                <button mat-button>SHARE</button>
              </mat-card-actions>
            </mat-card>
          </div>

          <!-- Divider -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Divider</h3>
            <mat-list>
              <mat-list-item>Item 1</mat-list-item>
              <mat-divider></mat-divider>
              <mat-list-item>Item 2</mat-list-item>
              <mat-divider></mat-divider>
              <mat-list-item>Item 3</mat-list-item>
            </mat-list>
          </div>

          <!-- Expansion Panel -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Expansion Panel</h3>
            <mat-accordion>
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>Personal data</mat-panel-title>
                  <mat-panel-description
                    >Type your name and age</mat-panel-description
                  >
                </mat-expansion-panel-header>
                <p>This is the primary content of the panel.</p>
              </mat-expansion-panel>
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>Self aware panel</mat-panel-title>
                  <mat-panel-description
                    >Currently I am
                    {{
                      panelOpenState ? 'open' : 'closed'
                    }}</mat-panel-description
                  >
                </mat-expansion-panel-header>
                <p>I'm visible because I am open</p>
              </mat-expansion-panel>
            </mat-accordion>
          </div>

          <!-- Grid List -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Grid List</h3>
            <mat-grid-list cols="4" rowHeight="100px">
              <mat-grid-tile
                [colspan]="1"
                [rowspan]="1"
                [style.background]="'lightblue'"
              >
                One
              </mat-grid-tile>
              <mat-grid-tile
                [colspan]="2"
                [rowspan]="1"
                [style.background]="'lightgreen'"
              >
                Two
              </mat-grid-tile>
              <mat-grid-tile
                [colspan]="1"
                [rowspan]="2"
                [style.background]="'lightpink'"
              >
                Three
              </mat-grid-tile>
              <mat-grid-tile
                [colspan]="1"
                [rowspan]="1"
                [style.background]="'#DDBDF1'"
              >
                Four
              </mat-grid-tile>
            </mat-grid-list>
          </div>

          <!-- List -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">List</h3>
            <mat-list>
              <mat-list-item>
                <mat-icon matListItemIcon>folder</mat-icon>
                <span matListItemTitle>Photos</span>
                <span matListItemLine>Jan 9, 2023</span>
              </mat-list-item>
              <mat-list-item>
                <mat-icon matListItemIcon>folder</mat-icon>
                <span matListItemTitle>Documents</span>
                <span matListItemLine>Jan 7, 2023</span>
              </mat-list-item>
              <mat-list-item>
                <mat-icon matListItemIcon>folder</mat-icon>
                <span matListItemTitle>Music</span>
                <span matListItemLine>Jan 3, 2023</span>
              </mat-list-item>
            </mat-list>
          </div>

          <!-- Stepper -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Stepper</h3>
            <mat-stepper linear #stepper>
              <mat-step [stepControl]="firstFormGroup">
                <form [formGroup]="firstFormGroup">
                  <ng-template matStepLabel>Fill out your name</ng-template>
                  <mat-form-field appearance="outline">
                    <mat-label>Name</mat-label>
                    <input
                      matInput
                      placeholder="Last name, First name"
                      formControlName="firstCtrl"
                      required
                    />
                  </mat-form-field>
                  <div>
                    <button mat-button matStepperNext>Next</button>
                  </div>
                </form>
              </mat-step>
              <mat-step [stepControl]="secondFormGroup">
                <form [formGroup]="secondFormGroup">
                  <ng-template matStepLabel>Fill out your address</ng-template>
                  <mat-form-field appearance="outline">
                    <mat-label>Address</mat-label>
                    <input
                      matInput
                      formControlName="secondCtrl"
                      placeholder="Ex. 1 Main St, New York, NY"
                      required
                    />
                  </mat-form-field>
                  <div>
                    <button mat-button matStepperPrevious>Back</button>
                    <button mat-button matStepperNext>Next</button>
                  </div>
                </form>
              </mat-step>
              <mat-step>
                <ng-template matStepLabel>Done</ng-template>
                <p>You are now done.</p>
                <div>
                  <button mat-button matStepperPrevious>Back</button>
                  <button mat-button (click)="stepper.reset()">Reset</button>
                </div>
              </mat-step>
            </mat-stepper>
          </div>

          <!-- Tabs -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Tabs</h3>
            <mat-tab-group animationDuration="0ms">
              <mat-tab label="First">Content 1</mat-tab>
              <mat-tab label="Second">Content 2</mat-tab>
              <mat-tab label="Third">Content 3</mat-tab>
            </mat-tab-group>
          </div>
        </section>

        <!-- Buttons & Indicators Section -->
        <section class="demo-section">
          <h2 class="text-2xl font-semibold mb-6">Buttons & Indicators</h2>

          <!-- Button -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Button</h3>
            <div class="flex flex-wrap gap-2">
              <button mat-button>Basic</button>
              <button mat-raised-button>Raised</button>
              <button mat-stroked-button>Stroked</button>
              <button mat-flat-button>Flat</button>
              <button mat-icon-button>
                <mat-icon>favorite</mat-icon>
              </button>
              <button mat-fab>
                <mat-icon>add</mat-icon>
              </button>
              <button mat-mini-fab>
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-raised-button color="primary">Primary</button>
              <button mat-raised-button color="accent">Accent</button>
              <button mat-raised-button color="warn">Warn</button>
            </div>
          </div>

          <!-- Button Toggle -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Button Toggle</h3>
            <mat-button-toggle-group name="fontStyle" aria-label="Font Style">
              <mat-button-toggle value="bold">Bold</mat-button-toggle>
              <mat-button-toggle value="italic">Italic</mat-button-toggle>
              <mat-button-toggle value="underline">Underline</mat-button-toggle>
            </mat-button-toggle-group>
          </div>

          <!-- Badge -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Badge</h3>
            <div class="flex gap-4">
              <span matBadge="4" matBadgeOverlap="false" class="p-2"
                >Text with a badge</span
              >
              <button
                mat-raised-button
                color="primary"
                matBadge="8"
                matBadgePosition="before"
                matBadgeColor="accent"
              >
                Action
              </button>
              <mat-icon matBadge="15" matBadgeColor="warn">home</mat-icon>
            </div>
          </div>

          <!-- Chips -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Chips</h3>
            <mat-chip-listbox>
              <mat-chip-option>One fish</mat-chip-option>
              <mat-chip-option>Two fish</mat-chip-option>
              <mat-chip-option color="accent" selected
                >Accent fish</mat-chip-option
              >
              <mat-chip-option color="warn">Warn fish</mat-chip-option>
            </mat-chip-listbox>
          </div>

          <!-- Icon -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Icon</h3>
            <div class="flex gap-2">
              <mat-icon>home</mat-icon>
              <mat-icon>favorite</mat-icon>
              <mat-icon>delete</mat-icon>
              <mat-icon>shopping_cart</mat-icon>
              <mat-icon>settings</mat-icon>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Progress Bar</h3>
            <mat-progress-bar mode="determinate" value="40"></mat-progress-bar>
            <mat-progress-bar
              mode="indeterminate"
              class="mt-2"
            ></mat-progress-bar>
            <mat-progress-bar
              mode="buffer"
              value="40"
              bufferValue="60"
              class="mt-2"
            ></mat-progress-bar>
            <mat-progress-bar mode="query" class="mt-2"></mat-progress-bar>
          </div>

          <!-- Progress Spinner -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Progress Spinner</h3>
            <div class="flex gap-4">
              <mat-spinner [diameter]="40"></mat-spinner>
              <mat-progress-spinner
                mode="determinate"
                value="75"
                [diameter]="40"
              ></mat-progress-spinner>
            </div>
          </div>
        </section>

        <!-- Popups & Modals Section -->
        <section class="demo-section">
          <h2 class="text-2xl font-semibold mb-6">Popups & Modals</h2>

          <!-- Dialog -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Dialog</h3>
            <button mat-raised-button color="primary" (click)="openDialog()">
              Open Dialog
            </button>
          </div>

          <!-- Bottom Sheet -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Bottom Sheet</h3>
            <button
              mat-raised-button
              color="primary"
              (click)="openBottomSheet()"
            >
              Open Bottom Sheet
            </button>
          </div>

          <!-- Snackbar -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Snackbar</h3>
            <button mat-raised-button color="primary" (click)="openSnackBar()">
              Open Snackbar
            </button>
          </div>

          <!-- Tooltip -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Tooltip</h3>
            <button mat-raised-button matTooltip="Info about the action">
              Action with Tooltip
            </button>
            <button
              mat-raised-button
              matTooltip="This tooltip has a custom position"
              matTooltipPosition="above"
              class="ml-2"
            >
              Above
            </button>
            <button
              mat-raised-button
              matTooltip="This tooltip will be shown after a delay"
              matTooltipShowDelay="1000"
              class="ml-2"
            >
              Delayed
            </button>
          </div>
        </section>

        <!-- Data Table Section -->
        <section class="demo-section">
          <h2 class="text-2xl font-semibold mb-6">Data Table</h2>

          <!-- Table -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Table</h3>
            <table
              mat-table
              [dataSource]="dataSource"
              class="mat-elevation-z8 demo-full-width"
            >
              <!-- Position Column -->
              <ng-container matColumnDef="position">
                <th mat-header-cell *matHeaderCellDef>No.</th>
                <td mat-cell *matCellDef="let element">
                  {{ element.position }}
                </td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let element">{{ element.name }}</td>
              </ng-container>

              <!-- Weight Column -->
              <ng-container matColumnDef="weight">
                <th mat-header-cell *matHeaderCellDef>Weight</th>
                <td mat-cell *matCellDef="let element">{{ element.weight }}</td>
              </ng-container>

              <!-- Symbol Column -->
              <ng-container matColumnDef="symbol">
                <th mat-header-cell *matHeaderCellDef>Symbol</th>
                <td mat-cell *matCellDef="let element">{{ element.symbol }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>

          <!-- Paginator -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Paginator</h3>
            <mat-paginator
              [length]="100"
              [pageSize]="10"
              [pageSizeOptions]="[5, 10, 25, 100]"
              aria-label="Select page"
            >
            </mat-paginator>
          </div>

          <!-- Sort Header -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Sort Header</h3>
            <table matSort class="mat-elevation-z8 demo-full-width">
              <tr>
                <th mat-sort-header="name">Dessert</th>
                <th mat-sort-header="calories">Calories</th>
                <th mat-sort-header="fat">Fat</th>
                <th mat-sort-header="carbs">Carbs</th>
                <th mat-sort-header="protein">Protein</th>
              </tr>
              <tr>
                <td>Frozen yogurt</td>
                <td>159</td>
                <td>6</td>
                <td>24</td>
                <td>4</td>
              </tr>
            </table>
          </div>
        </section>

        <!-- Tree Section -->
        <section class="demo-section">
          <h2 class="text-2xl font-semibold mb-6">Tree</h2>

          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Tree</h3>
            <mat-tree
              [dataSource]="dataSourceTree"
              [treeControl]="treeControl"
              class="example-tree"
            >
              <!-- This is the tree node template for expandable nodes -->
              <mat-tree-node *matTreeNodeDef="let node" matTreeNodeToggle>
                {{ node.name }}
              </mat-tree-node>
              <!-- This is the tree node template for expandable nodes -->
              <mat-nested-tree-node *matTreeNodeDef="let node; when: hasChild">
                <div class="mat-tree-node">
                  <button
                    mat-icon-button
                    matTreeNodeToggle
                    [attr.aria-label]="'Toggle ' + node.name"
                  >
                    <mat-icon class="mat-icon-rtl-mirror">
                      {{
                        treeControl.isExpanded(node)
                          ? 'expand_more'
                          : 'chevron_right'
                      }}
                    </mat-icon>
                  </button>
                  {{ node.name }}
                </div>
                <div
                  [class.example-tree-invisible]="!treeControl.isExpanded(node)"
                  class="example-tree-nested"
                >
                  <ng-container matTreeNodeOutlet></ng-container>
                </div>
              </mat-nested-tree-node>
            </mat-tree>
          </div>
        </section>

        <!-- CDK Section -->
        <section class="demo-section">
          <h2 class="text-2xl font-semibold mb-6">CDK (Component Dev Kit)</h2>

          <!-- Drag and Drop -->
          <div class="demo-item">
            <h3 class="text-xl font-medium mb-4">Drag and Drop</h3>
            <div
              cdkDropList
              class="example-list"
              (cdkDropListDropped)="drop($event)"
            >
              @for (item of dragItems; track item) {
                <div class="example-box" cdkDrag>{{ item }}</div>
              }
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
})
export class MaterialDemoComponent {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private bottomSheet = inject(MatBottomSheet);
  private snackBar = inject(MatSnackBar);

  // Form Controls
  stateCtrl = new FormControl('');
  checkboxCtrl = new FormControl(false);
  dateCtrl = new FormControl('');
  inputCtrl = new FormControl('', [Validators.required]);
  selectCtrl = new FormControl('option1');
  radioCtrl = new FormControl('1');
  slideToggleCtrl = new FormControl(false);
  sliderCtrl = new FormControl(50);

  // Stepper Forms
  firstFormGroup = this.fb.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this.fb.group({
    secondCtrl: ['', Validators.required],
  });

  // Autocomplete
  states: string[] = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
  ];
  filteredStates: Observable<string[]>;

  // Table
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource: PeriodicElement[] = [
    { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
    { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
    { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
    { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
    { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  ];

  // Tree
  treeControl = new NestedTreeControl<FoodNode>((node) => node.children);
  dataSourceTree = new MatTreeNestedDataSource<FoodNode>();

  // Drag and Drop
  dragItems = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];

  // Other
  panelOpenState = false;

  constructor() {
    this.filteredStates = this.stateCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterStates(value || '')),
    );

    this.dataSourceTree.data = [
      {
        name: 'Fruit',
        children: [
          { name: 'Apple' },
          { name: 'Banana' },
          { name: 'Fruit loops' },
        ],
      },
      {
        name: 'Vegetables',
        children: [
          {
            name: 'Green',
            children: [{ name: 'Broccoli' }, { name: 'Brussels sprouts' }],
          },
          {
            name: 'Orange',
            children: [{ name: 'Pumpkins' }, { name: 'Carrots' }],
          },
        ],
      },
    ];
  }

  private _filterStates(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.states.filter((state) =>
      state.toLowerCase().includes(filterValue),
    );
  }

  openDialog(): void {
    // You would typically create a separate dialog component
    // For demo purposes, we'll just log
    console.log('Dialog would open here');
  }

  openBottomSheet(): void {
    // You would typically create a separate bottom sheet component
    // For demo purposes, we'll just log
    console.log('Bottom sheet would open here');
  }

  openSnackBar(): void {
    this.snackBar.open('This is a snackbar message!', 'Close', {
      duration: 3000,
    });
  }

  hasChild = (_: number, node: FoodNode) =>
    !!node.children && node.children.length > 0;

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.dragItems, event.previousIndex, event.currentIndex);
  }
}
