# Settings Feature Implementation

## Overview

This Settings feature provides a complete integration between the Angular frontend and the Fastify backend Settings API. It includes dynamic form generation, optimistic updates, proper error handling, and a comprehensive UI.

## Files Created/Updated

### Core Files

- **`settings.types.ts`** - TypeScript types matching backend schemas
- **`settings.service.ts`** - Main service with HttpClient integration
- **`settings.component.ts`** - Updated main component with real API integration
- **`components/dynamic-settings.component.ts`** - Dynamic form generator based on backend metadata
- **`settings-demo.service.ts`** - Demo service for testing without backend

### Features Implemented

✅ **Real API Integration**

- HttpClient service with proper error handling
- Signal-based state management
- Optimistic updates with rollback on error

✅ **Dynamic Form Generation**

- Forms generated from backend setting metadata
- Support for all data types: string, number, boolean, email, url, json, array, date
- Proper validation based on backend rules
- UI components based on setting configuration

✅ **User Experience**

- Loading states and error handling
- Optimistic updates for immediate feedback
- Auto-save with change tracking
- Visual indicators for modified settings
- Success/error notifications

✅ **Type Safety**

- Complete TypeScript types matching backend schemas
- Strict typing throughout the application
- Error response handling

## How to Use

### Development Mode (Demo)

Currently set to demo mode for development without backend:

```typescript
// In settings.service.ts
private readonly useDemoMode = true; // Set to false for production
```

### Production Mode

To switch to real API:

1. Set `useDemoMode = false` in `settings.service.ts`
2. Ensure your backend API is running at `/api/settings`
3. Verify CORS settings allow frontend requests

### API Endpoints Used

- `GET /api/settings/grouped` - Get settings grouped by category
- `PUT /api/settings/user/:settingId` - Update user-specific setting
- `GET /api/settings/value/:key` - Get individual setting value
- `PUT /api/settings/bulk` - Bulk update multiple settings

### Adding New Setting Categories

The system dynamically generates tabs and forms based on backend data. To add new categories:

1. **Backend**: Add settings with new category values
2. **Frontend**: Update category mappings in `settings.component.ts`:

```typescript
getCategoryDisplayName(category: string): string {
  const categoryNames: Record<string, string> = {
    'your_new_category': 'Your New Category Display Name',
    // ... existing categories
  };
}

getCategoryIcon(category: string): string {
  const categoryIcons: Record<string, string> = {
    'your_new_category': 'your_material_icon',
    // ... existing icons
  };
}
```

### Setting Data Types Supported

| Backend Type | Frontend Component      | Validation                |
| ------------ | ----------------------- | ------------------------- |
| `string`     | Input field or Textarea | Length, pattern, required |
| `number`     | Number input            | Min/max values, required  |
| `boolean`    | Slide toggle            | None                      |
| `email`      | Email input             | Email validation          |
| `url`        | URL input               | URL pattern               |
| `date`       | Date picker             | Date range                |
| `json`       | JSON textarea           | JSON validation           |
| `array`      | JSON textarea           | Array validation          |

### UI Schema Support

The backend can specify UI hints via the `uiSchema` field:

```typescript
{
  component: 'select',           // Component type
  placeholder: 'Choose option', // Placeholder text
  options: [...],               // Select options
  rows: 4,                      // Textarea rows
  suffix: 'icon_name',          // Material icon
  hint: 'Helper text'           // Additional hint
}
```

### Validation Rules

The system supports these validation rules from the backend:

```typescript
{
  required: boolean,
  minLength: number,
  maxLength: number,
  min: number,
  max: number,
  pattern: string,
  enum: any[]
}
```

## Architecture

### State Management

- Uses Angular Signals for reactive state
- Optimistic updates with rollback on error
- Centralized state in `SettingsService`

### Error Handling

- Network errors with user-friendly messages
- Validation errors displayed inline
- Toast notifications for success/failure
- Automatic retry options

### Performance

- Debounced form changes (300ms)
- OnPush change detection strategy
- Lazy loading of setting categories
- Efficient form validation

## Testing

### Demo Service

The `SettingsDemoService` provides realistic mock data for testing:

- Simulates API delays
- Includes various data types and validation rules
- Supports bulk operations

### Integration Testing

To test with real backend:

1. Set `useDemoMode = false`
2. Ensure backend is running
3. Test all CRUD operations
4. Verify error handling

## Future Enhancements

Potential improvements:

- Setting search/filter functionality
- Settings history and audit trail
- Import/export settings
- Settings templates and presets
- Role-based setting visibility
- Settings change notifications

## Troubleshooting

### Common Issues

**Settings not loading:**

- Check `useDemoMode` setting
- Verify backend API is accessible
- Check browser network tab for errors

**Form validation not working:**

- Ensure backend validation rules are properly formatted
- Check console for TypeScript errors

**Optimistic updates failing:**

- Verify setting IDs match between frontend and backend
- Check error handling in browser console
