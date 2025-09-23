import { Injectable, signal, computed, effect, inject, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, merge } from 'rxjs';
import { WebSocketService, WebSocketMessage } from '../services/websocket.service';

export interface FormState {
  formId: string;
  entityId: string | number;
  data: any;
  timestamp: Date;
  userId: string;
  version: number;
}

export interface FormLock {
  formId: string;
  entityId: string | number;
  userId: string;
  userDisplayName: string;
  timestamp: Date;
  lockType: 'editing' | 'viewing';
}

export interface FormSyncOptions {
  feature: string;
  entity: string;
  formId: string;
  entityId: string | number;
  userId: string;
  userDisplayName: string;
  enableRealTimeSync?: boolean;
  enableLocking?: boolean;
  syncDebounceMs?: number;
  conflictResolution?: 'auto' | 'manual';
}

@Injectable()
export class RealtimeFormManager implements OnDestroy {
  private websocketService = inject(WebSocketService);
  private destroy$ = new Subject<void>();
  
  // Configuration
  private options!: FormSyncOptions;
  private formGroup!: FormGroup;
  
  // State signals
  private _isLocked = signal(false);
  private _lockedBy = signal<FormLock | null>(null);
  private _isSyncing = signal(false);
  private _hasConflicts = signal(false);
  private _lastSync = signal<Date | null>(null);
  private _collaborators = signal<FormLock[]>([]);
  private _formVersion = signal(0);
  
  // Computed properties
  readonly isLocked = computed(() => this._isLocked());
  readonly lockedBy = computed(() => this._lockedBy());
  readonly isSyncing = computed(() => this._isSyncing());
  readonly hasConflicts = computed(() => this._hasConflicts());
  readonly lastSync = computed(() => this._lastSync());
  readonly collaborators = computed(() => this._collaborators());
  readonly formVersion = computed(() => this._formVersion());
  readonly canEdit = computed(() => !this.isLocked() || this.isLockedByCurrentUser());
  
  // Form change tracking
  private formChanges$ = new Subject<any>();
  private isReceivingUpdate = false;
  
  constructor() {
    console.log('📝 RealtimeFormManager initialized');
  }
  
  ngOnDestroy(): void {
    this.cleanup();
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Initialize the form manager with a FormGroup
   */
  initialize(formGroup: FormGroup, options: FormSyncOptions): void {
    this.formGroup = formGroup;
    this.options = {
      enableRealTimeSync: true,
      enableLocking: true,
      syncDebounceMs: 1000,
      conflictResolution: 'manual',
      ...options
    };
    
    this.setupFormWatching();
    this.setupWebSocketSubscriptions();
    
    if (this.options.enableLocking) {
      this.acquireLock();
    }
    
    console.log(`📝 Form manager initialized for ${this.options.feature}.${this.options.entity}:${this.options.entityId}`);
  }
  
  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.options?.enableLocking) {
      this.releaseLock();
    }
    
    this.formChanges$.complete();
  }
  
  /**
   * Setup form value watching
   */
  private setupFormWatching(): void {
    if (!this.options.enableRealTimeSync) return;
    
    // Watch for form changes
    this.formGroup.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(this.options.syncDebounceMs!),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe(value => {
        if (!this.isReceivingUpdate && this.canEdit()) {
          this.broadcastFormState(value);
        }
      });
    
    // Watch for status changes (dirty, touched, etc.)
    const statusChanges$ = merge(
      this.formGroup.statusChanges,
      ...this.getAllControls().map(control => control.statusChanges)
    );
    
    statusChanges$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500)
      )
      .subscribe(() => {
        if (!this.isReceivingUpdate && this.canEdit()) {
          this.broadcastFormStatus();
        }
      });
  }
  
  /**
   * Setup WebSocket subscriptions
   */
  private setupWebSocketSubscriptions(): void {
    // Subscribe to form-specific events
    this.websocketService.subscribeToEvent(
      this.options.feature,
      `form_${this.options.entity}`,
      'state_changed'
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.handleFormStateChanged(data);
    });
    
    // Subscribe to lock events
    if (this.options.enableLocking) {
      this.websocketService.subscribeToEvent(
        this.options.feature,
        `form_${this.options.entity}`,
        'lock_acquired'
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.handleLockAcquired(data);
      });
      
      this.websocketService.subscribeToEvent(
        this.options.feature,
        `form_${this.options.entity}`,
        'lock_released'
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.handleLockReleased(data);
      });
    }
    
    // Subscribe to collaborator events
    this.websocketService.subscribeToEvent(
      this.options.feature,
      `form_${this.options.entity}`,
      'collaborator_joined'
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.handleCollaboratorJoined(data);
    });
    
    this.websocketService.subscribeToEvent(
      this.options.feature,
      `form_${this.options.entity}`,
      'collaborator_left'
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.handleCollaboratorLeft(data);
    });
  }
  
  /**
   * Handle form state changes from other users
   */
  private handleFormStateChanged(data: FormState): void {
    // Ignore our own updates
    if (data.userId === this.options.userId) return;
    
    console.log('📝 Received form state change from:', data.userId);
    
    // Check for conflicts
    if (this._formVersion() > 0 && data.version <= this._formVersion()) {
      this.handleVersionConflict(data);
      return;
    }
    
    // Apply changes without triggering our own change detection
    this.isReceivingUpdate = true;
    
    try {
      this.updateFormFromState(data);
      this._formVersion.set(data.version);
      this._lastSync.set(new Date());
    } finally {
      this.isReceivingUpdate = false;
    }
  }
  
  /**
   * Handle lock acquired events
   */
  private handleLockAcquired(data: FormLock): void {
    if (data.userId === this.options.userId) {
      this._isLocked.set(false); // We acquired the lock
    } else {
      this._isLocked.set(true);
      this._lockedBy.set(data);
      this.makeFormReadonly();
    }
    
    console.log('🔒 Form lock acquired by:', data.userDisplayName);
  }
  
  /**
   * Handle lock released events
   */
  private handleLockReleased(data: { formId: string; userId: string }): void {
    if (this._lockedBy()?.userId === data.userId) {
      this._isLocked.set(false);
      this._lockedBy.set(null);
      this.makeFormEditable();
    }
    
    console.log('🔓 Form lock released by:', data.userId);
  }
  
  /**
   * Handle collaborator events
   */
  private handleCollaboratorJoined(data: FormLock): void {
    const collaborators = this._collaborators();
    if (!collaborators.find(c => c.userId === data.userId)) {
      this._collaborators.set([...collaborators, data]);
    }
    
    console.log('👥 Collaborator joined:', data.userDisplayName);
  }
  
  private handleCollaboratorLeft(data: { userId: string }): void {
    const collaborators = this._collaborators().filter(c => c.userId !== data.userId);
    this._collaborators.set(collaborators);
    
    console.log('👥 Collaborator left:', data.userId);
  }
  
  /**
   * Handle version conflicts
   */
  private handleVersionConflict(incomingState: FormState): void {
    this._hasConflicts.set(true);
    
    console.warn('⚠️ Form version conflict detected');
    
    if (this.options.conflictResolution === 'auto') {
      // Auto-resolve by accepting incoming changes
      this.acceptIncomingChanges(incomingState);
    } else {
      // Manual resolution required
      this.showConflictResolutionDialog?.(incomingState);
    }
  }
  
  /**
   * Broadcast form state to other users
   */
  private broadcastFormState(value: any): void {
    const formState: FormState = {
      formId: this.options.formId,
      entityId: this.options.entityId,
      data: value,
      timestamp: new Date(),
      userId: this.options.userId,
      version: this._formVersion() + 1
    };
    
    this.websocketService.send('form_state_change', {
      feature: this.options.feature,
      entity: `form_${this.options.entity}`,
      action: 'state_changed',
      data: formState
    });
    
    this._formVersion.set(formState.version);
  }
  
  /**
   * Broadcast form status (validation, etc.)
   */
  private broadcastFormStatus(): void {
    const status = {
      formId: this.options.formId,
      entityId: this.options.entityId,
      userId: this.options.userId,
      isValid: this.formGroup.valid,
      errors: this.getFormErrors(),
      timestamp: new Date()
    };
    
    this.websocketService.send('form_status_change', {
      feature: this.options.feature,
      entity: `form_${this.options.entity}`,
      action: 'status_changed',
      data: status
    });
  }
  
  /**
   * Acquire form lock
   */
  private acquireLock(): void {
    const lockData: FormLock = {
      formId: this.options.formId,
      entityId: this.options.entityId,
      userId: this.options.userId,
      userDisplayName: this.options.userDisplayName,
      timestamp: new Date(),
      lockType: 'editing'
    };
    
    this.websocketService.send('acquire_form_lock', {
      feature: this.options.feature,
      entity: `form_${this.options.entity}`,
      action: 'lock_acquired',
      data: lockData
    });
  }
  
  /**
   * Release form lock
   */
  private releaseLock(): void {
    this.websocketService.send('release_form_lock', {
      feature: this.options.feature,
      entity: `form_${this.options.entity}`,
      action: 'lock_released',
      data: {
        formId: this.options.formId,
        entityId: this.options.entityId,
        userId: this.options.userId
      }
    });
  }
  
  /**
   * Update form from incoming state
   */
  private updateFormFromState(state: FormState): void {
    Object.keys(state.data).forEach(key => {
      const control = this.formGroup.get(key);
      if (control && control.value !== state.data[key]) {
        control.setValue(state.data[key], { emitEvent: false });
      }
    });
  }
  
  /**
   * Make form readonly
   */
  private makeFormReadonly(): void {
    this.getAllControls().forEach(control => {
      control.disable({ emitEvent: false });
    });
  }
  
  /**
   * Make form editable
   */
  private makeFormEditable(): void {
    this.getAllControls().forEach(control => {
      control.enable({ emitEvent: false });
    });
  }
  
  /**
   * Get all form controls
   */
  private getAllControls(): AbstractControl[] {
    const controls: AbstractControl[] = [];
    
    const addControls = (group: FormGroup | FormControl) => {
      if (group instanceof FormGroup) {
        Object.values(group.controls).forEach(control => {
          controls.push(control);
          if (control instanceof FormGroup) {
            addControls(control);
          }
        });
      } else {
        controls.push(group);
      }
    };
    
    addControls(this.formGroup);
    return controls;
  }
  
  /**
   * Get form errors
   */
  private getFormErrors(): any {
    const errors: any = {};
    
    Object.keys(this.formGroup.controls).forEach(key => {
      const control = this.formGroup.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    
    return errors;
  }
  
  /**
   * Check if form is locked by current user
   */
  private isLockedByCurrentUser(): boolean {
    return this._lockedBy()?.userId === this.options.userId;
  }
  
  /**
   * Accept incoming changes in conflict resolution
   */
  private acceptIncomingChanges(incomingState: FormState): void {
    this.updateFormFromState(incomingState);
    this._formVersion.set(incomingState.version);
    this._hasConflicts.set(false);
    this._lastSync.set(new Date());
    
    console.log('✅ Accepted incoming changes');
  }
  
  /**
   * Reject incoming changes in conflict resolution
   */
  public rejectIncomingChanges(): void {
    this._hasConflicts.set(false);
    // Force broadcast our current state
    this.broadcastFormState(this.formGroup.value);
    
    console.log('❌ Rejected incoming changes');
  }
  
  /**
   * Force sync with server
   */
  public async forceSync(): Promise<void> {
    this._isSyncing.set(true);
    
    try {
      // TODO: Implement server sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      this._lastSync.set(new Date());
    } finally {
      this._isSyncing.set(false);
    }
  }
  
  // Optional conflict resolution dialog callback
  public showConflictResolutionDialog?: (incomingState: FormState) => void;
}