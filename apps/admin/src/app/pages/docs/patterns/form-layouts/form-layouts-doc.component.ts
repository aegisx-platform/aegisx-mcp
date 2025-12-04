import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
} from '../../../../components/docs';

@Component({
  selector: 'app-form-layouts-doc',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDividerModule,
    MatRadioModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatSliderModule,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
  ],
  template: `
    <div class="form-layouts-doc">
      <ax-doc-header
        title="Form Layouts"
        icon="grid_view"
        description="Common form layout patterns for different use cases including registration, settings, and dialogs."
        [breadcrumbs]="[
          { label: 'Patterns', link: '/docs/patterns/form-sizes' },
          { label: 'Form Layouts' },
        ]"
        status="stable"
        version="1.0.0"
        [showImport]="false"
      ></ax-doc-header>

      <!-- Tabs -->
      <mat-tab-group class="docs-tabs" animationDuration="200ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="py-6">
            <section class="mb-8">
              <h2 class="text-2xl font-semibold mb-4">Introduction</h2>
              <p class="text-on-surface-variant mb-4">
                AegisX provides several form layout patterns optimized for
                different scenarios. All layouts use
                <code class="bg-surface-container px-2 py-1 rounded"
                  >.form-compact</code
                >
                for consistent Tremor-style sizing and are designed for
                enterprise applications.
              </p>
            </section>

            <!-- Layout Patterns Overview -->
            <section class="mb-8">
              <h3 class="text-xl font-semibold mb-4">Available Patterns</h3>
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (pattern of layoutPatterns; track pattern.name) {
                  <mat-card appearance="outlined" class="p-4">
                    <div class="flex items-center gap-3 mb-2">
                      <mat-icon class="text-primary">{{
                        pattern.icon
                      }}</mat-icon>
                      <h4 class="font-semibold">{{ pattern.name }}</h4>
                    </div>
                    <p class="text-sm text-on-surface-variant">
                      {{ pattern.description }}
                    </p>
                  </mat-card>
                }
              </div>
            </section>

            <!-- Basic Structure -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Basic Structure</h3>
              <mat-card appearance="outlined">
                <div class="p-4 bg-surface-container-lowest">
                  <pre
                    class="text-sm overflow-x-auto"
                  ><code>&lt;!-- Basic form layout structure --&gt;
&lt;div class="form-compact"&gt;
  &lt;form class="flex flex-col gap-4"&gt;
    &lt;!-- Form header --&gt;
    &lt;div class="mb-6"&gt;
      &lt;h2 class="h4"&gt;Form Title&lt;/h2&gt;
      &lt;p class="text-secondary"&gt;Description text&lt;/p&gt;
    &lt;/div&gt;

    &lt;!-- Form fields --&gt;
    &lt;mat-form-field appearance="outline"&gt;
      &lt;mat-label&gt;Field Label&lt;/mat-label&gt;
      &lt;input matInput&gt;
    &lt;/mat-form-field&gt;

    &lt;!-- Actions --&gt;
    &lt;div class="flex gap-2"&gt;
      &lt;button mat-flat-button color="primary"&gt;Submit&lt;/button&gt;
      &lt;button mat-stroked-button&gt;Cancel&lt;/button&gt;
    &lt;/div&gt;
  &lt;/form&gt;
&lt;/div&gt;</code></pre>
                </div>
              </mat-card>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="py-6 space-y-8">
            <!-- Single Column -->
            <section>
              <h3 class="text-xl font-semibold mb-4">
                1. Single Column Layout
              </h3>
              <p class="text-on-surface-variant mb-4">
                Use for simple forms like registration, login, or contact forms.
              </p>
              <ax-live-preview title="Create Account Form">
                <div class="max-w-md mx-auto">
                  <mat-card appearance="outlined">
                    <mat-card-header>
                      <mat-card-title>Create Account</mat-card-title>
                      <mat-card-subtitle
                        >Enter your details below</mat-card-subtitle
                      >
                    </mat-card-header>
                    <mat-card-content class="form-compact">
                      <div class="space-y-4 pt-4">
                        <mat-form-field appearance="outline" class="w-full">
                          <mat-label>Full Name</mat-label>
                          <mat-icon matPrefix>person</mat-icon>
                          <input matInput placeholder="John Doe" />
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                          <mat-label>Email</mat-label>
                          <mat-icon matPrefix>email</mat-icon>
                          <input matInput placeholder="john@example.com" />
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                          <mat-label>Password</mat-label>
                          <mat-icon matPrefix>lock</mat-icon>
                          <input
                            matInput
                            type="password"
                            placeholder="••••••••"
                          />
                        </mat-form-field>
                      </div>
                    </mat-card-content>
                    <mat-card-actions align="end">
                      <button mat-stroked-button>Cancel</button>
                      <button mat-flat-button color="primary">
                        Create Account
                      </button>
                    </mat-card-actions>
                  </mat-card>
                </div>
              </ax-live-preview>
              <ax-code-tabs [tabs]="singleColumnCode" />
            </section>

            <!-- Multi-Column -->
            <section>
              <h3 class="text-xl font-semibold mb-4">2. Multi-Column Layout</h3>
              <p class="text-on-surface-variant mb-4">
                Use for settings pages, profiles, or forms with many fields.
              </p>
              <ax-live-preview title="Personal Information Form">
                <mat-card appearance="outlined">
                  <mat-card-header>
                    <mat-card-title>Personal Information</mat-card-title>
                    <mat-card-subtitle
                      >Update your personal details</mat-card-subtitle
                    >
                  </mat-card-header>
                  <mat-card-content class="form-compact">
                    <div class="grid md:grid-cols-2 gap-4 pt-4">
                      <mat-form-field appearance="outline">
                        <mat-label>First Name</mat-label>
                        <input matInput placeholder="John" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Last Name</mat-label>
                        <input matInput placeholder="Doe" />
                      </mat-form-field>
                      <mat-form-field
                        appearance="outline"
                        class="md:col-span-2"
                      >
                        <mat-label>Email Address</mat-label>
                        <mat-icon matPrefix>email</mat-icon>
                        <input matInput placeholder="john@example.com" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Phone</mat-label>
                        <mat-icon matPrefix>phone</mat-icon>
                        <input matInput placeholder="+1 (555) 000-0000" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Country</mat-label>
                        <mat-icon matPrefix>public</mat-icon>
                        <mat-select>
                          <mat-option value="us">United States</mat-option>
                          <mat-option value="uk">United Kingdom</mat-option>
                          <mat-option value="ca">Canada</mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <button mat-stroked-button>Cancel</button>
                    <button mat-flat-button color="primary">
                      Save Changes
                    </button>
                  </mat-card-actions>
                </mat-card>
              </ax-live-preview>
              <ax-code-tabs [tabs]="multiColumnCode" />
            </section>

            <!-- Sectioned Form -->
            <section>
              <h3 class="text-xl font-semibold mb-4">3. Sectioned Form</h3>
              <p class="text-on-surface-variant mb-4">
                Use for complex forms with multiple categories of information.
              </p>
              <ax-live-preview title="Account Settings with Sections">
                <mat-card appearance="outlined">
                  <mat-card-header>
                    <mat-card-title>Account Settings</mat-card-title>
                    <mat-card-subtitle
                      >Manage your account preferences</mat-card-subtitle
                    >
                  </mat-card-header>
                  <mat-card-content class="form-compact">
                    <!-- Section 1 -->
                    <div class="mb-6 pt-4">
                      <h4 class="font-semibold mb-1">Account Details</h4>
                      <p class="text-sm text-on-surface-variant mb-4">
                        Your login credentials
                      </p>
                      <div class="grid md:grid-cols-2 gap-4">
                        <mat-form-field appearance="outline">
                          <mat-label>Username</mat-label>
                          <input matInput />
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Email</mat-label>
                          <input matInput type="email" />
                        </mat-form-field>
                      </div>
                    </div>

                    <mat-divider></mat-divider>

                    <!-- Section 2 -->
                    <div class="my-6">
                      <h4 class="font-semibold mb-1">Preferences</h4>
                      <p class="text-sm text-on-surface-variant mb-4">
                        Notification settings
                      </p>
                      <div class="space-y-3">
                        <mat-checkbox>Email notifications</mat-checkbox>
                        <mat-checkbox>Weekly summary</mat-checkbox>
                        <mat-checkbox checked>Security alerts</mat-checkbox>
                      </div>
                    </div>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <button mat-stroked-button>Cancel</button>
                    <button mat-flat-button color="primary">
                      Save Settings
                    </button>
                  </mat-card-actions>
                </mat-card>
              </ax-live-preview>
              <ax-code-tabs [tabs]="sectionedFormCode" />
            </section>

            <!-- Dialog Form -->
            <section>
              <h3 class="text-xl font-semibold mb-4">4. Dialog Form</h3>
              <p class="text-on-surface-variant mb-4">
                Compact form layout for dialogs with limited space.
              </p>
              <ax-live-preview title="Add Item Dialog">
                <div class="max-w-md mx-auto">
                  <mat-card appearance="outlined">
                    <div
                      class="p-4 border-b border-outline-variant flex items-center justify-between"
                    >
                      <div class="flex items-center gap-2">
                        <mat-icon class="text-primary">add_circle</mat-icon>
                        <span class="font-semibold">Add New Item</span>
                      </div>
                      <button mat-icon-button>
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                    <div class="p-4 form-compact">
                      <div class="space-y-4">
                        <mat-form-field appearance="outline" class="w-full">
                          <mat-label>Item Name</mat-label>
                          <input matInput placeholder="Enter name" />
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="w-full">
                          <mat-label>Category</mat-label>
                          <mat-select>
                            <mat-option value="product">Product</mat-option>
                            <mat-option value="service">Service</mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>
                    </div>
                    <div
                      class="p-4 border-t border-outline-variant flex justify-end gap-2"
                    >
                      <button mat-stroked-button>Cancel</button>
                      <button mat-flat-button color="primary">Add Item</button>
                    </div>
                  </mat-card>
                </div>
              </ax-live-preview>
              <ax-code-tabs [tabs]="dialogFormCode" />
            </section>

            <!-- With Selection -->
            <section>
              <h3 class="text-xl font-semibold mb-4">5. Form with Selection</h3>
              <p class="text-on-surface-variant mb-4">
                Use for forms with plan or option selection (e.g., subscription
                plans, payment methods).
              </p>
              <ax-live-preview title="Subscription Plan Selection">
                <mat-card appearance="outlined">
                  <mat-card-header>
                    <mat-card-title>Choose Your Plan</mat-card-title>
                    <mat-card-subtitle
                      >Select a plan that fits your needs</mat-card-subtitle
                    >
                  </mat-card-header>
                  <mat-card-content class="form-compact">
                    <mat-radio-group class="flex flex-col gap-3 pt-4">
                      @for (plan of plans; track plan.id) {
                        <mat-card
                          appearance="outlined"
                          class="p-4 cursor-pointer hover:border-primary transition-colors"
                          [class.border-primary]="selectedPlan === plan.id"
                        >
                          <mat-radio-button
                            [value]="plan.id"
                            (change)="selectedPlan = plan.id"
                          >
                            <div
                              class="flex justify-between items-center w-full"
                            >
                              <div>
                                <span class="font-semibold">{{
                                  plan.name
                                }}</span>
                                <p class="text-sm text-on-surface-variant">
                                  {{ plan.description }}
                                </p>
                              </div>
                              <span
                                class="text-lg font-semibold text-primary"
                                >{{ plan.price }}</span
                              >
                            </div>
                          </mat-radio-button>
                        </mat-card>
                      }
                    </mat-radio-group>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <button mat-stroked-button>Cancel</button>
                    <button mat-flat-button color="primary">Continue</button>
                  </mat-card-actions>
                </mat-card>
              </ax-live-preview>
              <ax-code-tabs [tabs]="selectionFormCode" />
            </section>

            <!-- Inline Filters -->
            <section>
              <h3 class="text-xl font-semibold mb-4">6. Inline Filters</h3>
              <p class="text-on-surface-variant mb-4">
                Use for table filters and search forms that need to be compact
                and horizontal.
              </p>
              <ax-live-preview title="Data Table Filters">
                <mat-card appearance="outlined">
                  <mat-card-content class="form-compact">
                    <div class="flex flex-wrap items-center gap-4 pt-4">
                      <mat-form-field
                        appearance="outline"
                        subscriptSizing="dynamic"
                        class="flex-1 min-w-[200px]"
                      >
                        <mat-label>Search</mat-label>
                        <mat-icon matPrefix>search</mat-icon>
                        <input
                          matInput
                          placeholder="Search by name or email..."
                        />
                      </mat-form-field>
                      <mat-form-field
                        appearance="outline"
                        subscriptSizing="dynamic"
                        class="w-40"
                      >
                        <mat-label>Status</mat-label>
                        <mat-select>
                          <mat-option value="">All</mat-option>
                          <mat-option value="active">Active</mat-option>
                          <mat-option value="inactive">Inactive</mat-option>
                          <mat-option value="pending">Pending</mat-option>
                        </mat-select>
                      </mat-form-field>
                      <mat-form-field
                        appearance="outline"
                        subscriptSizing="dynamic"
                        class="w-40"
                      >
                        <mat-label>Date Range</mat-label>
                        <input
                          matInput
                          [matDatepicker]="picker"
                          placeholder="Select date"
                        />
                        <mat-datepicker-toggle
                          matSuffix
                          [for]="picker"
                        ></mat-datepicker-toggle>
                        <mat-datepicker #picker></mat-datepicker>
                      </mat-form-field>
                      <div class="flex gap-2">
                        <button mat-flat-button color="primary">
                          <mat-icon>filter_list</mat-icon>
                          Apply
                        </button>
                        <button mat-stroked-button>
                          <mat-icon>clear</mat-icon>
                          Clear
                        </button>
                      </div>
                    </div>
                    <div class="mt-4 flex flex-wrap gap-2">
                      <mat-chip-set>
                        <mat-chip
                          >Status: Active
                          <mat-icon matChipRemove>cancel</mat-icon></mat-chip
                        >
                        <mat-chip
                          >Date: Last 7 days
                          <mat-icon matChipRemove>cancel</mat-icon></mat-chip
                        >
                      </mat-chip-set>
                    </div>
                  </mat-card-content>
                </mat-card>
              </ax-live-preview>
              <ax-code-tabs [tabs]="inlineFiltersCode" />
            </section>

            <!-- Comprehensive Input Test -->
            <section>
              <h3 class="text-xl font-semibold mb-4">
                7. Comprehensive Input Test (Dark Mode)
              </h3>
              <p class="text-on-surface-variant mb-4">
                ทดสอบ Input ทุกประเภทเพื่อตรวจสอบ visibility ใน dark mode - ทั้ง
                border, placeholder, label และ states ต่างๆ
              </p>
              <ax-live-preview
                title="All Input Types - Dark Mode Visibility Test"
              >
                <mat-card appearance="outlined">
                  <mat-card-header>
                    <mat-card-title>Input Visibility Test</mat-card-title>
                    <mat-card-subtitle>
                      ตรวจสอบว่า border, placeholder, label อ่านได้ชัดเจนหรือไม่
                    </mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content class="form-compact">
                    <div class="space-y-6 pt-4">
                      <!-- Section 1: Text Inputs -->
                      <div>
                        <h4 class="font-semibold mb-3 text-primary">
                          1. Text Inputs
                        </h4>
                        <div class="grid md:grid-cols-2 gap-4">
                          <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Text Input</mat-label>
                            <input matInput placeholder="Enter text here..." />
                            <mat-hint>Helper text for guidance</mat-hint>
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Email Input</mat-label>
                            <mat-icon matPrefix>email</mat-icon>
                            <input
                              matInput
                              type="email"
                              placeholder="your@email.com"
                            />
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Password Input</mat-label>
                            <mat-icon matPrefix>lock</mat-icon>
                            <input
                              matInput
                              type="password"
                              placeholder="Enter password..."
                            />
                            <mat-icon matSuffix>visibility_off</mat-icon>
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Number Input</mat-label>
                            <mat-icon matPrefix>tag</mat-icon>
                            <input
                              matInput
                              type="number"
                              placeholder="Enter number..."
                            />
                          </mat-form-field>
                        </div>
                      </div>

                      <mat-divider></mat-divider>

                      <!-- Section 2: Textarea -->
                      <div>
                        <h4 class="font-semibold mb-3 text-primary">
                          2. Textarea
                        </h4>
                        <mat-form-field appearance="outline" class="w-full">
                          <mat-label>Message</mat-label>
                          <textarea
                            matInput
                            rows="3"
                            placeholder="Enter your message here..."
                          ></textarea>
                          <mat-hint align="end">0/500 characters</mat-hint>
                        </mat-form-field>
                      </div>

                      <mat-divider></mat-divider>

                      <!-- Section 3: Select & Datepicker -->
                      <div>
                        <h4 class="font-semibold mb-3 text-primary">
                          3. Select & Date Picker
                        </h4>
                        <div class="grid md:grid-cols-2 gap-4">
                          <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Select Option</mat-label>
                            <mat-select placeholder="Choose an option...">
                              <mat-option value="option1">Option 1</mat-option>
                              <mat-option value="option2">Option 2</mat-option>
                              <mat-option value="option3">Option 3</mat-option>
                            </mat-select>
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Date Picker</mat-label>
                            <input
                              matInput
                              [matDatepicker]="testPicker"
                              placeholder="Select date..."
                            />
                            <mat-datepicker-toggle
                              matSuffix
                              [for]="testPicker"
                            ></mat-datepicker-toggle>
                            <mat-datepicker #testPicker></mat-datepicker>
                          </mat-form-field>
                        </div>
                      </div>

                      <mat-divider></mat-divider>

                      <!-- Section 4: Disabled States -->
                      <div>
                        <h4 class="font-semibold mb-3 text-primary">
                          4. Disabled States
                        </h4>
                        <div class="grid md:grid-cols-2 gap-4">
                          <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Disabled Input</mat-label>
                            <input matInput disabled value="This is disabled" />
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Disabled Select</mat-label>
                            <mat-select disabled placeholder="Disabled...">
                              <mat-option value="1">Option 1</mat-option>
                            </mat-select>
                          </mat-form-field>
                        </div>
                      </div>

                      <mat-divider></mat-divider>

                      <!-- Section 5: Error States -->
                      <div>
                        <h4 class="font-semibold mb-3 text-primary">
                          5. Error States
                        </h4>
                        <div class="grid md:grid-cols-2 gap-4">
                          <mat-form-field
                            appearance="outline"
                            class="w-full error-demo"
                          >
                            <mat-label>Required Field</mat-label>
                            <input matInput required />
                            <mat-error>This field is required</mat-error>
                          </mat-form-field>

                          <mat-form-field
                            appearance="outline"
                            class="w-full error-demo"
                          >
                            <mat-label>Invalid Email</mat-label>
                            <input
                              matInput
                              type="email"
                              value="invalid-email"
                            />
                            <mat-error>Please enter a valid email</mat-error>
                          </mat-form-field>
                        </div>
                      </div>

                      <mat-divider></mat-divider>

                      <!-- Section 6: Checkboxes & Radio -->
                      <div>
                        <h4 class="font-semibold mb-3 text-primary">
                          6. Checkboxes & Radio Buttons
                        </h4>
                        <div class="grid md:grid-cols-2 gap-4">
                          <div class="space-y-2">
                            <p class="text-sm text-on-surface-variant mb-2">
                              Checkboxes:
                            </p>
                            <mat-checkbox>Unchecked checkbox</mat-checkbox>
                            <mat-checkbox checked
                              >Checked checkbox</mat-checkbox
                            >
                            <mat-checkbox disabled
                              >Disabled checkbox</mat-checkbox
                            >
                            <mat-checkbox disabled checked
                              >Disabled checked</mat-checkbox
                            >
                          </div>

                          <div class="space-y-2">
                            <p class="text-sm text-on-surface-variant mb-2">
                              Radio Buttons:
                            </p>
                            <mat-radio-group class="flex flex-col gap-2">
                              <mat-radio-button value="1"
                                >Radio option 1</mat-radio-button
                              >
                              <mat-radio-button value="2" checked
                                >Radio option 2</mat-radio-button
                              >
                              <mat-radio-button value="3" disabled
                                >Disabled option</mat-radio-button
                              >
                            </mat-radio-group>
                          </div>
                        </div>
                      </div>

                      <mat-divider></mat-divider>

                      <!-- Section 7: Toggle & Slider -->
                      <div>
                        <h4 class="font-semibold mb-3 text-primary">
                          7. Slide Toggle & Slider
                        </h4>
                        <div class="grid md:grid-cols-2 gap-4">
                          <div class="space-y-3">
                            <p class="text-sm text-on-surface-variant mb-2">
                              Slide Toggles:
                            </p>
                            <mat-slide-toggle>Toggle off</mat-slide-toggle>
                            <mat-slide-toggle checked
                              >Toggle on</mat-slide-toggle
                            >
                            <mat-slide-toggle disabled
                              >Disabled toggle</mat-slide-toggle
                            >
                          </div>

                          <div class="space-y-3">
                            <p class="text-sm text-on-surface-variant mb-2">
                              Slider:
                            </p>
                            <mat-slider
                              min="0"
                              max="100"
                              step="1"
                              class="w-full"
                            >
                              <input matSliderThumb value="50" />
                            </mat-slider>
                            <mat-slider
                              min="0"
                              max="100"
                              step="1"
                              disabled
                              class="w-full"
                            >
                              <input matSliderThumb value="30" />
                            </mat-slider>
                          </div>
                        </div>
                      </div>

                      <mat-divider></mat-divider>

                      <!-- Section 8: Chips -->
                      <div>
                        <h4 class="font-semibold mb-3 text-primary">
                          8. Chips
                        </h4>
                        <mat-chip-set>
                          <mat-chip>Default chip</mat-chip>
                          <mat-chip highlighted>Highlighted chip</mat-chip>
                          <mat-chip disabled>Disabled chip</mat-chip>
                          <mat-chip>
                            With icon
                            <mat-icon matChipRemove>cancel</mat-icon>
                          </mat-chip>
                        </mat-chip-set>
                      </div>
                    </div>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <button mat-stroked-button>Reset All</button>
                    <button mat-flat-button color="primary">
                      Submit Test Form
                    </button>
                  </mat-card-actions>
                </mat-card>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="py-6 space-y-8">
            <!-- Grid Classes -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Layout Grid Classes</h3>
              <mat-card appearance="outlined">
                <table mat-table [dataSource]="gridClassesData" class="w-full">
                  <ng-container matColumnDef="class">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">
                      Class
                    </th>
                    <td mat-cell *matCellDef="let row">
                      <code class="text-sm text-primary">{{ row.class }}</code>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">
                      Description
                    </th>
                    <td mat-cell *matCellDef="let row">
                      {{ row.description }}
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="useCase">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">
                      Use Case
                    </th>
                    <td mat-cell *matCellDef="let row">{{ row.useCase }}</td>
                  </ng-container>
                  <tr
                    mat-header-row
                    *matHeaderRowDef="['class', 'description', 'useCase']"
                  ></tr>
                  <tr
                    mat-row
                    *matRowDef="
                      let row;
                      columns: ['class', 'description', 'useCase']
                    "
                  ></tr>
                </table>
              </mat-card>
            </section>

            <!-- Spacing Classes -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Spacing Utilities</h3>
              <mat-card appearance="outlined">
                <table
                  mat-table
                  [dataSource]="spacingClassesData"
                  class="w-full"
                >
                  <ng-container matColumnDef="class">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">
                      Class
                    </th>
                    <td mat-cell *matCellDef="let row">
                      <code class="text-sm text-primary">{{ row.class }}</code>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="value">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">
                      Value
                    </th>
                    <td mat-cell *matCellDef="let row">{{ row.value }}</td>
                  </ng-container>
                  <ng-container matColumnDef="use">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold">
                      Recommended Use
                    </th>
                    <td mat-cell *matCellDef="let row">{{ row.use }}</td>
                  </ng-container>
                  <tr
                    mat-header-row
                    *matHeaderRowDef="['class', 'value', 'use']"
                  ></tr>
                  <tr
                    mat-row
                    *matRowDef="let row; columns: ['class', 'value', 'use']"
                  ></tr>
                </table>
              </mat-card>
            </section>

            <!-- Field Width Classes -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Field Width Utilities</h3>
              <mat-card appearance="outlined">
                <div class="p-4 bg-surface-container-lowest">
                  <pre
                    class="text-sm overflow-x-auto"
                  ><code>/* Full width field */
&lt;mat-form-field class="w-full"&gt;...&lt;/mat-form-field&gt;

/* Span 2 columns in grid */
&lt;mat-form-field class="md:col-span-2"&gt;...&lt;/mat-form-field&gt;

/* Fixed width */
&lt;mat-form-field class="w-40"&gt;...&lt;/mat-form-field&gt;  /* 160px */
&lt;mat-form-field class="w-48"&gt;...&lt;/mat-form-field&gt;  /* 192px */
&lt;mat-form-field class="w-64"&gt;...&lt;/mat-form-field&gt;  /* 256px */

/* Flex grow */
&lt;mat-form-field class="flex-1"&gt;...&lt;/mat-form-field&gt;</code></pre>
                </div>
              </mat-card>
            </section>
          </div>
        </mat-tab>

        <!-- Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="py-6 space-y-8">
            <!-- Form Layout Tokens -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Form Layout CSS</h3>
              <mat-card appearance="outlined">
                <div class="p-4 bg-surface-container-lowest">
                  <pre
                    class="text-sm overflow-x-auto"
                  ><code>/* Form container */
.form-compact {{'{'}}
  --mdc-outlined-text-field-container-height: 40px;
{{'}'}}

/* Section header */
.section-title {{'{'}}
  font-size: 1rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
{{'}'}}

.section-description {{'{'}}
  font-size: 0.875rem;
  color: var(--md-sys-color-on-surface-variant);
{{'}'}}

/* Required field asterisk */
.required-asterisk {{'{'}}
  color: var(--md-sys-color-error);
{{'}'}}

/* Action buttons */
.form-actions {{'{'}}
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
{{'}'}}</code></pre>
                </div>
              </mat-card>
            </section>

            <!-- Responsive Breakpoints -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Responsive Breakpoints</h3>
              <div class="grid md:grid-cols-2 gap-4">
                @for (bp of breakpoints; track bp.name) {
                  <mat-card appearance="outlined" class="p-4">
                    <h4 class="font-semibold mb-2">{{ bp.name }}</h4>
                    <div class="space-y-1 text-sm">
                      <div class="flex justify-between">
                        <code>{{ bp.prefix }}</code>
                        <span class="text-on-surface-variant">{{
                          bp.width
                        }}</span>
                      </div>
                      <p class="text-on-surface-variant text-xs mt-2">
                        {{ bp.description }}
                      </p>
                    </div>
                  </mat-card>
                }
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="py-6 space-y-8">
            <!-- Best Practices -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Best Practices</h3>
              <div class="grid md:grid-cols-2 gap-6">
                <mat-card appearance="outlined" class="p-4">
                  <h4
                    class="font-semibold text-success mb-3 flex items-center gap-2"
                  >
                    <mat-icon>check_circle</mat-icon>
                    Do
                  </h4>
                  <ul class="space-y-2 text-sm text-on-surface-variant">
                    <li>
                      Use <code>.form-compact</code> wrapper for consistent
                      sizing
                    </li>
                    <li>Mark required fields with red asterisks</li>
                    <li>Use <code>mat-hint</code> for helper text</li>
                    <li>Group related fields using grid layouts</li>
                    <li>Separate sections with <code>mat-divider</code></li>
                    <li>Place primary action on the right</li>
                  </ul>
                </mat-card>

                <mat-card appearance="outlined" class="p-4">
                  <h4
                    class="font-semibold text-error mb-3 flex items-center gap-2"
                  >
                    <mat-icon>cancel</mat-icon>
                    Don't
                  </h4>
                  <ul class="space-y-2 text-sm text-on-surface-variant">
                    <li>Mix different form sizes in same form</li>
                    <li>Create forms with more than 10-12 visible fields</li>
                    <li>Use dialogs for complex multi-section forms</li>
                    <li>Skip labels or use placeholder as label</li>
                    <li>Put important actions in hard-to-reach positions</li>
                    <li>Forget mobile responsiveness</li>
                  </ul>
                </mat-card>
              </div>
            </section>

            <!-- Layout Selection Guide -->
            <section>
              <h3 class="text-xl font-semibold mb-4">
                When to Use Each Layout
              </h3>
              <div class="space-y-4">
                @for (guide of layoutGuide; track guide.layout) {
                  <mat-card appearance="outlined" class="p-4">
                    <h4 class="font-semibold text-primary mb-2">
                      {{ guide.layout }}
                    </h4>
                    <p class="text-sm text-on-surface-variant mb-2">
                      {{ guide.description }}
                    </p>
                    <div class="flex flex-wrap gap-2">
                      @for (use of guide.uses; track use) {
                        <span
                          class="text-xs bg-surface-container px-2 py-1 rounded"
                          >{{ use }}</span
                        >
                      }
                    </div>
                  </mat-card>
                }
              </div>
            </section>

            <!-- Accessibility -->
            <section>
              <h3 class="text-xl font-semibold mb-4">Accessibility</h3>
              <mat-card appearance="outlined" class="p-4">
                <ul class="space-y-3 text-sm text-on-surface-variant">
                  <li class="flex items-start gap-2">
                    <mat-icon class="text-primary text-lg"
                      >accessibility</mat-icon
                    >
                    <span
                      ><strong>Labels:</strong> Every field must have a visible
                      label, never use placeholder alone</span
                    >
                  </li>
                  <li class="flex items-start gap-2">
                    <mat-icon class="text-primary text-lg"
                      >accessibility</mat-icon
                    >
                    <span
                      ><strong>Error messages:</strong> Use
                      <code>mat-error</code> for inline validation
                      feedback</span
                    >
                  </li>
                  <li class="flex items-start gap-2">
                    <mat-icon class="text-primary text-lg"
                      >accessibility</mat-icon
                    >
                    <span
                      ><strong>Required fields:</strong> Indicate required
                      fields both visually and with
                      <code>required</code> attribute</span
                    >
                  </li>
                  <li class="flex items-start gap-2">
                    <mat-icon class="text-primary text-lg"
                      >accessibility</mat-icon
                    >
                    <span
                      ><strong>Focus order:</strong> Ensure logical tab order
                      through form fields</span
                    >
                  </li>
                  <li class="flex items-start gap-2">
                    <mat-icon class="text-primary text-lg"
                      >accessibility</mat-icon
                    >
                    <span
                      ><strong>Button labels:</strong> Use descriptive button
                      text ("Save Changes" not just "Submit")</span
                    >
                  </li>
                </ul>
              </mat-card>
            </section>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .docs-tabs ::ng-deep .mat-mdc-tab-body-wrapper {
        flex: 1;
      }

      pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
      }

      code {
        font-family: 'Fira Code', 'Consolas', monospace;
      }
    `,
  ],
})
export class FormLayoutsDocComponent {
  selectedPlan = 'pro';

  plans = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'For individuals',
      price: '$9/mo',
    },
    {
      id: 'pro',
      name: 'Professional',
      description: 'For small teams',
      price: '$29/mo',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      price: '$99/mo',
    },
  ];

  // Code Examples
  singleColumnCode = [
    {
      language: 'html' as const,
      label: 'HTML',
      code: `<div class="max-w-md mx-auto">
  <mat-card appearance="outlined">
    <mat-card-header>
      <mat-card-title>Create Account</mat-card-title>
      <mat-card-subtitle>Enter your details below</mat-card-subtitle>
    </mat-card-header>

    <mat-card-content class="form-compact">
      <div class="space-y-4 pt-4">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Full Name</mat-label>
          <mat-icon matPrefix>person</mat-icon>
          <input matInput placeholder="John Doe">
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Email</mat-label>
          <mat-icon matPrefix>email</mat-icon>
          <input matInput placeholder="john@example.com">
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Password</mat-label>
          <mat-icon matPrefix>lock</mat-icon>
          <input matInput type="password">
        </mat-form-field>
      </div>
    </mat-card-content>

    <mat-card-actions align="end">
      <button mat-stroked-button>Cancel</button>
      <button mat-flat-button color="primary">Create Account</button>
    </mat-card-actions>
  </mat-card>
</div>`,
    },
  ];

  multiColumnCode = [
    {
      language: 'html' as const,
      label: 'HTML',
      code: `<mat-card appearance="outlined">
  <mat-card-header>
    <mat-card-title>Personal Information</mat-card-title>
    <mat-card-subtitle>Update your personal details</mat-card-subtitle>
  </mat-card-header>

  <mat-card-content class="form-compact">
    <div class="grid md:grid-cols-2 gap-4 pt-4">
      <mat-form-field appearance="outline">
        <mat-label>First Name</mat-label>
        <input matInput placeholder="John">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Last Name</mat-label>
        <input matInput placeholder="Doe">
      </mat-form-field>

      <!-- Full width field spanning 2 columns -->
      <mat-form-field appearance="outline" class="md:col-span-2">
        <mat-label>Email Address</mat-label>
        <mat-icon matPrefix>email</mat-icon>
        <input matInput placeholder="john@example.com">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Phone</mat-label>
        <mat-icon matPrefix>phone</mat-icon>
        <input matInput placeholder="+1 (555) 000-0000">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Country</mat-label>
        <mat-select>
          <mat-option value="us">United States</mat-option>
          <mat-option value="uk">United Kingdom</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  </mat-card-content>

  <mat-card-actions align="end">
    <button mat-stroked-button>Cancel</button>
    <button mat-flat-button color="primary">Save Changes</button>
  </mat-card-actions>
</mat-card>`,
    },
  ];

  sectionedFormCode = [
    {
      language: 'html' as const,
      label: 'HTML',
      code: `<mat-card appearance="outlined">
  <mat-card-header>
    <mat-card-title>Account Settings</mat-card-title>
    <mat-card-subtitle>Manage your account preferences</mat-card-subtitle>
  </mat-card-header>

  <mat-card-content class="form-compact">
    <!-- Section 1: Account Details -->
    <div class="mb-6 pt-4">
      <h4 class="font-semibold mb-1">Account Details</h4>
      <p class="text-sm text-on-surface-variant mb-4">Your login credentials</p>
      <div class="grid md:grid-cols-2 gap-4">
        <mat-form-field appearance="outline">
          <mat-label>Username</mat-label>
          <input matInput>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email">
        </mat-form-field>
      </div>
    </div>

    <mat-divider></mat-divider>

    <!-- Section 2: Preferences -->
    <div class="my-6">
      <h4 class="font-semibold mb-1">Preferences</h4>
      <p class="text-sm text-on-surface-variant mb-4">Notification settings</p>
      <div class="space-y-3">
        <mat-checkbox>Email notifications</mat-checkbox>
        <mat-checkbox>Weekly summary</mat-checkbox>
        <mat-checkbox checked>Security alerts</mat-checkbox>
      </div>
    </div>
  </mat-card-content>

  <mat-card-actions align="end">
    <button mat-stroked-button>Cancel</button>
    <button mat-flat-button color="primary">Save Settings</button>
  </mat-card-actions>
</mat-card>`,
    },
  ];

  dialogFormCode = [
    {
      language: 'html' as const,
      label: 'HTML',
      code: `<!-- Using MatDialog -->
<h2 mat-dialog-title>Add New Item</h2>

<mat-dialog-content class="form-compact">
  <div class="space-y-4">
    <mat-form-field appearance="outline" class="w-full">
      <mat-label>Item Name</mat-label>
      <input matInput placeholder="Enter name">
    </mat-form-field>

    <mat-form-field appearance="outline" class="w-full">
      <mat-label>Category</mat-label>
      <mat-select>
        <mat-option value="product">Product</mat-option>
        <mat-option value="service">Service</mat-option>
      </mat-select>
    </mat-form-field>
  </div>
</mat-dialog-content>

<mat-dialog-actions align="end">
  <button mat-stroked-button mat-dialog-close>Cancel</button>
  <button mat-flat-button color="primary" [mat-dialog-close]="data">
    Add Item
  </button>
</mat-dialog-actions>`,
    },
    {
      language: 'typescript' as const,
      label: 'TypeScript',
      code: `import { MatDialog } from '@angular/material/dialog';

@Component({...})
export class MyComponent {
  private dialog = inject(MatDialog);

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddItemDialogComponent, {
      width: '400px',
      data: { name: '', category: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Item added:', result);
      }
    });
  }
}`,
    },
  ];

  selectionFormCode = [
    {
      language: 'html' as const,
      label: 'HTML',
      code: `<mat-card appearance="outlined">
  <mat-card-header>
    <mat-card-title>Choose Your Plan</mat-card-title>
    <mat-card-subtitle>Select a plan that fits your needs</mat-card-subtitle>
  </mat-card-header>

  <mat-card-content class="form-compact">
    <mat-radio-group [(ngModel)]="selectedPlan" class="flex flex-col gap-3 pt-4">
      @for (plan of plans; track plan.id) {
        <mat-card
          appearance="outlined"
          class="p-4 cursor-pointer hover:border-primary transition-colors"
          [class.border-primary]="selectedPlan === plan.id"
        >
          <mat-radio-button [value]="plan.id">
            <div class="flex justify-between items-center w-full">
              <div>
                <span class="font-semibold">{{ plan.name }}</span>
                <p class="text-sm text-on-surface-variant">{{ plan.description }}</p>
              </div>
              <span class="text-lg font-semibold text-primary">{{ plan.price }}</span>
            </div>
          </mat-radio-button>
        </mat-card>
      }
    </mat-radio-group>
  </mat-card-content>

  <mat-card-actions align="end">
    <button mat-stroked-button>Cancel</button>
    <button mat-flat-button color="primary">Continue</button>
  </mat-card-actions>
</mat-card>`,
    },
    {
      language: 'typescript' as const,
      label: 'TypeScript',
      code: `import { MatRadioModule } from '@angular/material/radio';

@Component({
  imports: [MatRadioModule, MatCardModule, FormsModule],
})
export class PlanSelectionComponent {
  selectedPlan = 'pro';

  plans = [
    { id: 'basic', name: 'Basic', description: 'For individuals', price: '$9/mo' },
    { id: 'pro', name: 'Professional', description: 'For small teams', price: '$29/mo' },
    { id: 'enterprise', name: 'Enterprise', description: 'For large organizations', price: '$99/mo' },
  ];
}`,
    },
  ];

  inlineFiltersCode = [
    {
      language: 'html' as const,
      label: 'HTML',
      code: `<mat-card appearance="outlined">
  <mat-card-content class="form-compact">
    <!-- subscriptSizing="dynamic" removes reserved hint/error space for proper alignment -->
    <div class="flex flex-wrap items-center gap-4 pt-4">
      <!-- Search Field -->
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1 min-w-[200px]">
        <mat-label>Search</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput placeholder="Search by name or email..." [(ngModel)]="searchTerm">
      </mat-form-field>

      <!-- Status Filter -->
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-40">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="statusFilter">
          <mat-option value="">All</mat-option>
          <mat-option value="active">Active</mat-option>
          <mat-option value="inactive">Inactive</mat-option>
          <mat-option value="pending">Pending</mat-option>
        </mat-select>
      </mat-form-field>

      <!-- Date Filter -->
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-40">
        <mat-label>Date Range</mat-label>
        <input matInput [matDatepicker]="picker" [(ngModel)]="dateFilter">
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>

      <!-- Action Buttons -->
      <div class="flex gap-2">
        <button mat-flat-button color="primary" (click)="applyFilters()">
          <mat-icon>filter_list</mat-icon>
          Apply
        </button>
        <button mat-stroked-button (click)="clearFilters()">
          <mat-icon>clear</mat-icon>
          Clear
        </button>
      </div>
    </div>

    <!-- Active Filter Chips -->
    <div class="mt-4 flex flex-wrap gap-2">
      <mat-chip-set>
        @for (filter of activeFilters; track filter.key) {
          <mat-chip (removed)="removeFilter(filter.key)">
            {{ filter.label }}
            <mat-icon matChipRemove>cancel</mat-icon>
          </mat-chip>
        }
      </mat-chip-set>
    </div>
  </mat-card-content>
</mat-card>`,
    },
    {
      language: 'typescript' as const,
      label: 'TypeScript',
      code: `import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatChipsModule,
    FormsModule,
  ],
})
export class DataFilterComponent {
  searchTerm = '';
  statusFilter = '';
  dateFilter: Date | null = null;

  activeFilters: { key: string; label: string }[] = [];

  applyFilters(): void {
    this.activeFilters = [];
    if (this.statusFilter) {
      this.activeFilters.push({ key: 'status', label: \`Status: \${this.statusFilter}\` });
    }
    if (this.dateFilter) {
      this.activeFilters.push({ key: 'date', label: \`Date: \${this.dateFilter.toLocaleDateString()}\` });
    }
    // Emit filters to parent or service
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.dateFilter = null;
    this.activeFilters = [];
  }

  removeFilter(key: string): void {
    this.activeFilters = this.activeFilters.filter(f => f.key !== key);
    if (key === 'status') this.statusFilter = '';
    if (key === 'date') this.dateFilter = null;
  }
}`,
    },
  ];

  layoutPatterns = [
    {
      icon: 'view_agenda',
      name: 'Single Column',
      description: 'Simple forms like login, registration',
    },
    {
      icon: 'grid_view',
      name: 'Multi-Column',
      description: 'Settings pages, profiles with many fields',
    },
    {
      icon: 'view_list',
      name: 'Sectioned',
      description: 'Complex forms with multiple categories',
    },
    {
      icon: 'open_in_new',
      name: 'Dialog Form',
      description: 'Quick add, edit, and confirmation dialogs',
    },
    {
      icon: 'credit_card',
      name: 'With Selection',
      description: 'Forms with plan/option selection',
    },
    {
      icon: 'filter_list',
      name: 'Inline Filters',
      description: 'Table filters and search forms',
    },
  ];

  gridClassesData = [
    {
      class: 'grid grid-cols-1',
      description: 'Single column layout',
      useCase: 'Mobile, simple forms',
    },
    {
      class: 'grid md:grid-cols-2',
      description: '2 columns on md screens',
      useCase: 'Most common pattern',
    },
    {
      class: 'grid lg:grid-cols-3',
      description: '3 columns on lg screens',
      useCase: 'Dashboard filters',
    },
    {
      class: 'md:col-span-2',
      description: 'Span 2 columns',
      useCase: 'Full-width fields in grid',
    },
    {
      class: 'flex flex-col',
      description: 'Vertical flex layout',
      useCase: 'Form sections',
    },
    {
      class: 'flex gap-2',
      description: 'Horizontal flex with gap',
      useCase: 'Button groups',
    },
  ];

  spacingClassesData = [
    { class: 'gap-2', value: '0.5rem (8px)', use: 'Between buttons' },
    { class: 'gap-3', value: '0.75rem (12px)', use: 'Between small elements' },
    { class: 'gap-4', value: '1rem (16px)', use: 'Between form fields' },
    { class: 'gap-6', value: '1.5rem (24px)', use: 'Between sections' },
    { class: 'mb-4', value: '1rem margin', use: 'After section headers' },
    { class: 'my-6', value: '1.5rem vertical', use: 'Around dividers' },
  ];

  breakpoints = [
    {
      name: 'Mobile First',
      prefix: '(default)',
      width: '< 640px',
      description: 'Single column layout',
    },
    {
      name: 'Small',
      prefix: 'sm:',
      width: '≥ 640px',
      description: 'Tablet portrait',
    },
    {
      name: 'Medium',
      prefix: 'md:',
      width: '≥ 768px',
      description: 'Tablet landscape, multi-column',
    },
    {
      name: 'Large',
      prefix: 'lg:',
      width: '≥ 1024px',
      description: 'Desktop, 3+ columns',
    },
  ];

  layoutGuide = [
    {
      layout: 'Single Column',
      description: 'Best for focused user journeys and mobile-first forms.',
      uses: ['Login', 'Registration', 'Contact forms', 'Simple dialogs'],
    },
    {
      layout: 'Multi-Column (2 cols)',
      description: 'Efficient use of space for forms with related field pairs.',
      uses: ['Profile settings', 'Address forms', 'User management'],
    },
    {
      layout: 'Sectioned Forms',
      description: 'For complex data entry with logical groupings.',
      uses: ['Account settings', 'Configuration pages', 'Onboarding wizards'],
    },
    {
      layout: 'Dialog Forms',
      description: "Quick actions that don't require full page navigation.",
      uses: ['Quick add', 'Edit records', 'Confirmations', 'Simple settings'],
    },
  ];
}
