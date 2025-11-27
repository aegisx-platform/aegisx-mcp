import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import {
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface PeriodicElement {
  position: number;
  name: string;
  weight: number;
  symbol: string;
}

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

export interface Agent {
  name: string;
  capacity: number; // 0-100 percentage
  called: number;
  booked: number;
}

@Component({
  selector: 'app-components-demo',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatExpansionModule,
    MatListModule,
    MatTableModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatButtonToggleModule,
    MatStepperModule,
    MatMenuModule,
    MatToolbarModule,
    MatGridListModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatBottomSheetModule,
    MatSortModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
  ],
  templateUrl: './components-demo.component.html',
  styleUrls: ['./components-demo.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ComponentsDemoComponent implements OnInit {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private bottomSheet = inject(MatBottomSheet);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Basic table data
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  tableData: PeriodicElement[] = [
    { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
    { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
    { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
    { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
    { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
    { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
    { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
    { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
    { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
    { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
  ];

  // Agent Performance Table (Tremor style with donut charts)
  agentDisplayedColumns: string[] = ['name', 'capacity'];
  agentsData: Agent[] = [
    { name: 'Emma Johnson', capacity: 48, called: 3062, booked: 6340 },
    { name: 'Liam Martinez', capacity: 80, called: 2245, booked: 2797 },
    { name: 'Olivia Brown', capacity: 84, called: 4787, booked: 5676 },
    { name: 'Noah Davis', capacity: 53, called: 4097, booked: 7692 },
    { name: 'Ava Wilson', capacity: 80, called: 2847, booked: 3576 },
    { name: 'Elijah Moore', capacity: 62, called: 3156, booked: 4892 },
    { name: 'Sophia Taylor', capacity: 91, called: 5234, booked: 6128 },
    { name: 'James Anderson', capacity: 45, called: 2678, booked: 5934 },
  ];

  // Advanced table with sorting and pagination
  displayedColumnsWithActions: string[] = [
    'position',
    'name',
    'weight',
    'symbol',
    'actions',
  ];
  dataSource = new MatTableDataSource(this.tableData);

  // Table with selection
  displayedColumnsWithSelect: string[] = [
    'select',
    'position',
    'name',
    'weight',
    'symbol',
  ];
  selectionData = this.tableData;
  selection = new SelectionModel<PeriodicElement>(true, []);

  // Grid list tiles
  tiles: Tile[] = [
    { text: '1', cols: 1, rows: 1, color: 'lightblue' },
    { text: '2', cols: 1, rows: 1, color: 'lightgreen' },
    { text: '3', cols: 1, rows: 1, color: 'lightpink' },
    { text: '4', cols: 1, rows: 1, color: '#DDBDF1' },
    { text: '5', cols: 2, rows: 1, color: '#f4a261' },
    { text: '6', cols: 1, rows: 1, color: '#2a9d8f' },
    { text: '7', cols: 1, rows: 1, color: '#e76f51' },
  ];

  // Datepicker min/max dates
  minDate = new Date(2020, 0, 1);
  maxDate = new Date(2025, 11, 31);

  // Datepicker filter functions
  weekendFilter = (date: Date | null): boolean => {
    if (!date) return true;
    const day = date.getDay();
    // Disable weekends (0 = Sunday, 6 = Saturday)
    return day !== 0 && day !== 6;
  };

  evenDateFilter = (date: Date | null): boolean => {
    if (!date) return true;
    // Only allow even dates
    return date.getDate() % 2 === 0;
  };

  // Autocomplete data with reactive forms
  stateControl = new FormControl('');
  filteredStates$!: Observable<string[]>;
  allStates: string[] = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
  ];

  countryControl = new FormControl('');
  filteredCountries$!: Observable<string[]>;
  allCountries: string[] = [
    'United States',
    'Canada',
    'Mexico',
    'United Kingdom',
    'France',
    'Germany',
    'Italy',
    'Spain',
    'Japan',
    'China',
    'India',
    'Australia',
  ];

  // Chips - Selectable (single)
  selectedChip = '';

  // Chips - Selectable (multiple)
  selectedFruits: string[] = [];

  // Chips - Removable (stacked)
  keywords: string[] = ['JavaScript', 'TypeScript', 'Angular', 'React'];

  // Chips - With Input (stacked)
  inputKeywords: string[] = ['HTML', 'CSS', 'SCSS'];

  // Tags autocomplete
  tagInput = '';
  selectedTags: string[] = ['Angular', 'Material'];
  availableTags: string[] = [
    'Angular',
    'React',
    'Vue',
    'Svelte',
    'Material',
    'Bootstrap',
    'Tailwind',
    'TypeScript',
    'JavaScript',
    'HTML',
    'CSS',
    'Node.js',
  ];

  ngOnInit() {
    // Initialize autocomplete filtering
    this.filteredStates$ = this.stateControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterStates(value || '')),
    );

    this.filteredCountries$ = this.countryControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterCountries(value || '')),
    );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Table filter method
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Selection methods
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.selectionData.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.selectionData);
  }

  // Dialog method
  openDialog(): void {
    const dialogRef = this.dialog.open(ExampleDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Dialog closed with result: ' + result, 'Close', {
          duration: 3000,
        });
      }
    });
  }

  // Snackbar method
  openSnackbar(message: string, type: 'success' | 'error' | 'info'): void {
    const panelClass =
      type === 'success'
        ? 'snackbar-success'
        : type === 'error'
          ? 'snackbar-error'
          : 'snackbar-info';

    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass],
    });
  }

  // Bottom sheet method
  openBottomSheet(): void {
    this.bottomSheet.open(BottomSheetComponent);
  }

  // Tag methods
  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.selectedTags.includes(value)) {
      this.selectedTags.push(value);
    }
    event.chipInput!.clear();
    this.tagInput = '';
  }

  removeTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
    }
  }

  selectTag(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    if (!this.selectedTags.includes(value)) {
      this.selectedTags.push(value);
    }
    this.tagInput = '';
  }

  // Chips methods - Removable
  removeKeyword(keyword: string): void {
    const index = this.keywords.indexOf(keyword);
    if (index >= 0) {
      this.keywords.splice(index, 1);
    }
  }

  // Chips methods - With Input
  addKeyword(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.inputKeywords.includes(value)) {
      this.inputKeywords.push(value);
    }
    event.chipInput!.clear();
  }

  removeInputKeyword(keyword: string): void {
    const index = this.inputKeywords.indexOf(keyword);
    if (index >= 0) {
      this.inputKeywords.splice(index, 1);
    }
  }

  // Datepicker selection handlers
  setMonthAndYear(normalizedMonthAndYear: Date, datepicker: any): void {
    const ctrlValue = normalizedMonthAndYear;
    ctrlValue.setDate(1);
    datepicker.select(ctrlValue);
    datepicker.close();
  }

  setYear(normalizedYear: Date, datepicker: any): void {
    const ctrlValue = normalizedYear;
    datepicker.select(ctrlValue);
    datepicker.close();
  }

  // Scroll navigation methods
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Private filter methods for autocomplete
  private _filterStates(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allStates.filter((state) =>
      state.toLowerCase().includes(filterValue),
    );
  }

  private _filterCountries(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allCountries.filter((country) =>
      country.toLowerCase().includes(filterValue),
    );
  }
}

// Example Dialog Component
@Component({
  selector: 'example-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Example Dialog</h2>
    <mat-dialog-content>
      <p>This is an example dialog using Material Design.</p>
      <p>
        You can put any content here including forms, lists, or other
        components.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [mat-dialog-close]="'confirmed'"
      >
        Confirm
      </button>
    </mat-dialog-actions>
  `,
})
export class ExampleDialogComponent {}

// Bottom Sheet Component
@Component({
  selector: 'bottom-sheet',
  standalone: true,
  imports: [MatListModule, MatIconModule],
  template: `
    <mat-nav-list>
      <h3 mat-subheader>Share this page</h3>
      <a mat-list-item (click)="openLink('https://twitter.com')">
        <mat-icon matListItemIcon>share</mat-icon>
        <span matListItemTitle>Twitter</span>
      </a>
      <a mat-list-item (click)="openLink('https://facebook.com')">
        <mat-icon matListItemIcon>share</mat-icon>
        <span matListItemTitle>Facebook</span>
      </a>
      <a mat-list-item (click)="openLink('https://linkedin.com')">
        <mat-icon matListItemIcon>share</mat-icon>
        <span matListItemTitle>LinkedIn</span>
      </a>
    </mat-nav-list>
  `,
})
export class BottomSheetComponent {
  private bottomSheetRef = inject(MatBottomSheetRef<BottomSheetComponent>);

  openLink(url: string): void {
    this.bottomSheetRef.dismiss();
    // In a real app, you would open the link here
    console.log('Opening:', url);
  }
}
