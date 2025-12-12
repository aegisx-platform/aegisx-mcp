import {
  Component,
  Inject,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { TmtService } from './tmt.service';
import { AxTmtHierarchyComponent } from './ax-tmt-hierarchy.component';
import {
  TmtConcept,
  TmtHierarchy,
  RelatedDrug,
  TmtLevel,
  getTmtLevelConfig,
} from './tmt.types';

export interface TmtDetailDialogData {
  concept?: TmtConcept;
  tmtId?: number;
  tmtCode?: string;
  level?: TmtLevel;
}

@Component({
  selector: 'ax-tmt-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    AxTmtHierarchyComponent,
  ],
  template: `
    <div class="tmt-detail-dialog">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b bg-gray-50">
        <div class="flex items-center gap-3">
          <mat-icon class="text-blue-600">medication_liquid</mat-icon>
          <h2 class="text-lg font-semibold m-0">TMT Concept Detail</h2>
        </div>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div
        class="dialog-content overflow-auto"
        style="max-height: calc(90vh - 130px);"
      >
        @if (loading()) {
          <div class="flex items-center justify-center p-8">
            <mat-spinner [diameter]="40"></mat-spinner>
          </div>
        } @else if (error()) {
          <div
            class="flex flex-col items-center justify-center p-8 text-gray-500"
          >
            <mat-icon class="!text-5xl mb-4">error_outline</mat-icon>
            <p class="text-lg font-medium">ไม่พบข้อมูล TMT</p>
            <p class="text-sm">
              รหัส "{{ data.tmtCode || data.tmtId }}" ไม่มีในระบบ
            </p>
          </div>
        } @else if (concept()) {
          <div class="p-4 space-y-4">
            <!-- Basic Info -->
            <div class="bg-white border rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-500 uppercase mb-3">
                Basic Information
              </h3>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="text-gray-500">TMT ID</span>
                  <div class="flex items-center gap-2 font-mono font-medium">
                    {{ concept()!.tmt_id }}
                    <button
                      mat-icon-button
                      class="!w-6 !h-6"
                      (click)="copyToClipboard(concept()!.tmt_id.toString())"
                      matTooltip="คัดลอก"
                    >
                      <mat-icon class="!text-sm !w-4 !h-4"
                        >content_copy</mat-icon
                      >
                    </button>
                  </div>
                </div>
                <div>
                  <span class="text-gray-500">Concept Code</span>
                  <div class="flex items-center gap-2 font-mono font-medium">
                    {{ concept()!.concept_code }}
                    <button
                      mat-icon-button
                      class="!w-6 !h-6"
                      (click)="copyToClipboard(concept()!.concept_code)"
                      matTooltip="คัดลอก"
                    >
                      <mat-icon class="!text-sm !w-4 !h-4"
                        >content_copy</mat-icon
                      >
                    </button>
                  </div>
                </div>
                <div>
                  <span class="text-gray-500">Level</span>
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                      [class]="
                        levelConfig().bgClass + ' ' + levelConfig().colorClass
                      "
                    >
                      <mat-icon class="!text-sm !w-4 !h-4">{{
                        levelConfig().icon
                      }}</mat-icon>
                      {{ concept()!.level }}
                    </span>
                    <span class="text-gray-600">{{
                      levelConfig().labelTh
                    }}</span>
                  </div>
                </div>
                <div>
                  <span class="text-gray-500">Status</span>
                  <div>
                    @if (concept()!.is_active) {
                      <span
                        class="inline-flex items-center gap-1 text-green-600"
                      >
                        <mat-icon class="!text-sm !w-4 !h-4"
                          >check_circle</mat-icon
                        >
                        Active
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1 text-red-600">
                        <mat-icon class="!text-sm !w-4 !h-4">cancel</mat-icon>
                        Inactive
                      </span>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Names -->
            <div class="bg-white border rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-500 uppercase mb-3">
                <mat-icon class="!text-base align-text-bottom mr-1"
                  >text_fields</mat-icon
                >
                Names
              </h3>
              <div class="space-y-2 text-sm">
                <div>
                  <span class="text-gray-500">FSN (English)</span>
                  <div class="font-medium">{{ concept()!.fsn || '-' }}</div>
                </div>
                <div>
                  <span class="text-gray-500">Thai Name</span>
                  <div class="font-medium">
                    {{ concept()!.preferred_term || '-' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Properties -->
            @if (concept()!.strength || concept()!.dosage_form) {
              <div class="bg-white border rounded-lg p-4">
                <h3 class="text-sm font-semibold text-gray-500 uppercase mb-3">
                  <mat-icon class="!text-base align-text-bottom mr-1"
                    >medication</mat-icon
                  >
                  Properties
                </h3>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  @if (concept()!.strength) {
                    <div>
                      <span class="text-gray-500">Strength</span>
                      <div class="font-medium">{{ concept()!.strength }}</div>
                    </div>
                  }
                  @if (concept()!.dosage_form) {
                    <div>
                      <span class="text-gray-500">Dosage Form</span>
                      <div class="font-medium">
                        {{ concept()!.dosage_form }}
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Hierarchy -->
            <div class="bg-white border rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-500 uppercase mb-3">
                <mat-icon class="!text-base align-text-bottom mr-1"
                  >account_tree</mat-icon
                >
                Hierarchy
              </h3>
              <ax-tmt-hierarchy
                [tmtId]="concept()!.id"
                [expandedByDefault]="true"
                [maxDepth]="3"
              ></ax-tmt-hierarchy>
            </div>

            <!-- Related Drugs -->
            @if (relatedDrugs().length > 0) {
              <div class="bg-white border rounded-lg p-4">
                <h3 class="text-sm font-semibold text-gray-500 uppercase mb-3">
                  <mat-icon class="!text-base align-text-bottom mr-1"
                    >link</mat-icon
                  >
                  Related Drugs in System ({{ relatedDrugs().length }})
                </h3>
                <div class="space-y-2">
                  @for (drug of relatedDrugs(); track drug.id) {
                    <div
                      class="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm"
                    >
                      <mat-icon class="!text-base text-gray-400">
                        {{
                          drug.source === 'drug_generics'
                            ? 'medication'
                            : 'local_pharmacy'
                        }}
                      </mat-icon>
                      <div class="flex-1">
                        <div class="font-medium">{{ drug.name }}</div>
                        <div class="text-xs text-gray-500">
                          Code: {{ drug.code }} | Source: {{ drug.source }}
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- TMT Levels Reference -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-blue-700 uppercase mb-3">
                <mat-icon class="!text-base align-text-bottom mr-1"
                  >info</mat-icon
                >
                TMT Levels Reference
              </h3>
              <div class="grid grid-cols-1 gap-2 text-xs">
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center justify-center w-12 px-2 py-0.5 rounded font-medium bg-purple-100 text-purple-700"
                    >VTM</span
                  >
                  <span class="text-gray-600"
                    >สารออกฤทธิ์ (Virtual Therapeutic Moiety)</span
                  >
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center justify-center w-12 px-2 py-0.5 rounded font-medium bg-blue-100 text-blue-700"
                    >GP</span
                  >
                  <span class="text-gray-600">ยาสามัญ (Generic Product)</span>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center justify-center w-12 px-2 py-0.5 rounded font-medium bg-green-100 text-green-700"
                    >GPU</span
                  >
                  <span class="text-gray-600"
                    >ยาสามัญ+หน่วย (Generic Product Unit)</span
                  >
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center justify-center w-12 px-2 py-0.5 rounded font-medium bg-amber-100 text-amber-700"
                    >TP</span
                  >
                  <span class="text-gray-600">ยาการค้า (Trade Product)</span>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center justify-center w-12 px-2 py-0.5 rounded font-medium bg-red-100 text-red-700"
                    >TPU</span
                  >
                  <span class="text-gray-600"
                    >ยาการค้า+หน่วย (Trade Product Unit)</span
                  >
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-2 p-4 border-t bg-gray-50">
        <button mat-button (click)="close()">ปิด</button>
      </div>
    </div>
  `,
  styles: [
    `
      .tmt-detail-dialog {
        display: flex;
        flex-direction: column;
        min-width: 500px;
      }
      .dialog-content {
        flex: 1;
        background: #f9fafb;
      }
    `,
  ],
})
export class AxTmtDetailDialogComponent implements OnInit {
  private tmtService = inject(TmtService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<AxTmtDetailDialogComponent>);

  // State
  loading = signal(false);
  error = signal(false);
  concept = signal<TmtConcept | null>(null);
  relatedDrugs = signal<RelatedDrug[]>([]);

  // Computed
  levelConfig = computed(() => {
    const level = this.concept()?.level as TmtLevel;
    return level ? getTmtLevelConfig(level) : getTmtLevelConfig('GPU');
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: TmtDetailDialogData) {}

  ngOnInit() {
    this.loadData();
  }

  private async loadData() {
    // If concept provided directly
    if (this.data.concept) {
      this.concept.set(this.data.concept);
      this.loadRelatedDrugs(this.data.concept.id);
      return;
    }

    this.loading.set(true);
    this.error.set(false);

    try {
      let result: TmtConcept | null = null;

      if (this.data.tmtId) {
        result =
          (await this.tmtService.getById(this.data.tmtId).toPromise()) || null;
      } else if (this.data.tmtCode) {
        result =
          (await this.tmtService.getByCode(this.data.tmtCode).toPromise()) ||
          null;
      }

      if (result) {
        this.concept.set(result);
        this.loadRelatedDrugs(result.id);
      } else {
        this.error.set(true);
      }
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  private loadRelatedDrugs(tmtId: number) {
    this.tmtService.getRelatedDrugs(tmtId).subscribe((drugs) => {
      this.relatedDrugs.set(drugs);
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open(`คัดลอก "${text}" แล้ว`, 'ปิด', { duration: 2000 });
    });
  }

  close() {
    this.dialogRef.close();
  }
}
