# Inventory Transfer Wizard Component

Multi-step wizard for creating stock transfer requests between locations with validation and review.

## Features

- **4-Step Wizard**: Product selection → Quantity → Destination → Review
- **Product Search**: Autocomplete for quick product lookup
- **Multi-Product**: Transfer multiple products in one request
- **Quantity Validation**: Max = available stock validation
- **Location Picker Integration**: Hierarchical location selection
- **Review & Submit**: Summary table before submission
- **Progress Tracking**: Visual stepper showing current step
- **Validation**: Per-step validation prevents invalid submissions
- **Responsive**: Mobile-friendly stepper and forms

## Installation

```typescript
import { AxTransferWizardComponent } from '@aegisx/ui';
```

## Basic Usage

```html
<ax-transfer-wizard [sourceLocationId]="currentLocation" (onSubmit)="createTransfer($event)" (onCancel)="closeDialog()" />
```

## API Reference

### Inputs

| Property                | Type      | Default      | Description                       |
| ----------------------- | --------- | ------------ | --------------------------------- |
| `sourceLocationId`      | `string`  | **required** | Source location ID (pre-selected) |
| `allowMultipleProducts` | `boolean` | `true`       | Allow selecting multiple products |
| `requiresApproval`      | `boolean` | `false`      | Transfer requires approval        |
| `showNotes`             | `boolean` | `true`       | Show notes field in review step   |

### Outputs

| Event          | Type              | Description                     |
| -------------- | ----------------- | ------------------------------- |
| `onSubmit`     | `TransferRequest` | Emitted when transfer submitted |
| `onCancel`     | `void`            | Emitted when wizard cancelled   |
| `onStepChange` | `number`          | Emitted when step changes       |

### Types

```typescript
export interface TransferRequest {
  sourceLocationId: string;
  destinationLocationId: string;
  items: Array<{
    productId: string;
    quantity: number;
    batchNumber?: string;
  }>;
  notes?: string;
  requiresApproval: boolean;
}

export interface WizardStep {
  id: string;
  title: string;
  component?: any;
}
```

## Wizard Steps

### Step 1: Product Selection

- **Autocomplete Search**: Search products by name or SKU
- **Multi-Select**: Add multiple products to transfer list
- **Remove Products**: Remove products from list
- **Validation**: At least one product required

### Step 2: Quantity Entry

- **Quantity Input**: Enter quantity for each product
- **Available Stock Display**: Shows max available at source
- **Validation**:
  - Min = 1
  - Max = available stock
  - Required for all products

### Step 3: Destination Selection

- **Location Picker**: Hierarchical location tree
- **Source Pre-Selected**: Cannot change source
- **Same Location Prevention**: Cannot select source as destination
- **Validation**: Destination required

### Step 4: Review & Submit

- **Summary Table**: All products, quantities, locations
- **Notes Field**: Optional transfer notes
- **Edit**: Go back to any previous step
- **Submit**: Create transfer request

## Examples

### Basic Transfer

```html
<ax-transfer-wizard [sourceLocationId]="'LOC-WAREHOUSE-A'" (onSubmit)="handleTransfer($event)" />
```

```typescript
handleTransfer(request: TransferRequest) {
  this.transferService.create(request).subscribe({
    next: () => this.snackBar.open('Transfer created'),
    error: (err) => this.snackBar.open('Transfer failed')
  });
}
```

### Single Product Mode

```html
<ax-transfer-wizard [sourceLocationId]="sourceId" [allowMultipleProducts]="false" (onSubmit)="createSingleTransfer($event)" />
```

Allows only one product per transfer.

### With Approval Required

```html
<ax-transfer-wizard [sourceLocationId]="sourceId" [requiresApproval]="true" (onSubmit)="submitForApproval($event)" />
```

```typescript
submitForApproval(request: TransferRequest) {
  console.log('Requires approval:', request.requiresApproval); // true
  this.approvalService.submit(request);
}
```

### In Dialog

```typescript
// Open wizard in dialog
openTransferDialog() {
  const dialogRef = this.dialog.open(TransferWizardDialog, {
    width: '800px',
    data: { sourceLocationId: this.currentLocation }
  });

  dialogRef.componentInstance.onSubmit.subscribe((request) => {
    this.createTransfer(request);
    dialogRef.close();
  });
}
```

## Step Navigation

### Programmatic Navigation

```typescript
@ViewChild(AxTransferWizardComponent) wizard!: AxTransferWizardComponent;

// Go to next step
this.wizard.next();

// Go to previous step
this.wizard.back();

// Go to specific step
this.wizard.goToStep(2);

// Get current step
const current = this.wizard.currentStep;
```

### Validation Before Next

Each step validates automatically before allowing progression:

| Step           | Validation                                 |
| -------------- | ------------------------------------------ |
| 1. Products    | ≥1 product selected                        |
| 2. Quantities  | All quantities valid (1 ≤ qty ≤ available) |
| 3. Destination | Destination selected, ≠ source             |
| 4. Review      | N/A (final step)                           |

## Integration with Location Picker

Step 3 embeds `ax-location-picker` component:

```html
<!-- Internal template (Step 3) -->
<ax-location-picker [locations]="allLocations" [allowedTypes]="['warehouse', 'zone', 'aisle']" [disabledLocations]="[sourceLocationId]" (onSelect)="handleDestinationSelect($event)" />
```

## Accessibility

- **Keyboard Navigation**: Tab through steps, Enter to submit
- **Screen Readers**: Announce step changes and validation errors
- **ARIA**: Proper stepper roles and labels
- **Focus Management**: Auto-focus on first input in each step

## Best Practices

1. **Pre-Select Source**: Always provide `sourceLocationId`
2. **Validate Quantities**: Ensure available stock at source
3. **Handle Errors**: Show clear error messages on submission failure
4. **Confirmation**: Show success message after creation
5. **Batch Transfers**: Consider batch number selection for perishables

## Performance

- **Render**: <100ms per step
- **Step Transition**: <50ms
- **Bundle Size**: ~12KB gzipped

## Related Components

- **AxLocationPickerComponent**: Select transfer locations
- **AxQuantityInputComponent**: Enter transfer quantities
- **AxBatchSelectorComponent**: Select batches for transfer

## Browser Support

- Chrome/Edge 90+, Firefox 88+, Safari 14+, iOS Safari 14+, Android Chrome 90+
