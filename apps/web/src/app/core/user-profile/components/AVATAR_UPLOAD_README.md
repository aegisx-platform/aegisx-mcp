# Avatar Upload Component

A comprehensive avatar upload component with image cropping, drag & drop support, and real-time progress tracking, designed for Angular Material + TailwindCSS applications.

## Features

### 🖼️ Image Handling
- **File Types**: JPEG, PNG, WebP support
- **Size Limits**: 5MB maximum file size (configurable)
- **Validation**: Client-side file type and size validation
- **Security**: File type validation beyond extension checking

### 🎨 User Experience
- **Drag & Drop**: Intuitive drag and drop file upload
- **Click to Upload**: Traditional file picker integration
- **Visual States**: Hover effects, loading states, error indicators
- **Progress Tracking**: Real-time upload progress with percentage

### ✂️ Image Editing
- **Square Cropping**: Automatic 1:1 aspect ratio for avatars
- **Zoom Control**: Slider-based zoom from 0.1x to 3x
- **Rotation**: 90-degree left/right rotation controls
- **Flip**: Horizontal flip transformation
- **Reset**: One-click reset to original image
- **Preview**: Real-time crop preview

### ♿ Accessibility
- **ARIA Labels**: Comprehensive screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling throughout
- **High Contrast**: Support for high contrast themes

### 📱 Responsive Design
- **Mobile First**: Touch-friendly controls
- **Responsive Dialog**: Adaptive dialog sizing
- **Flexible Layout**: Works on all screen sizes

## Component Architecture

```
AvatarUploadComponent (main component)
├── File validation and drag & drop handling
├── Progress tracking and error management
├── Integration with UserService for uploads
└── AvatarCropDialogComponent (modal dialog)
    ├── ngx-image-cropper integration
    ├── Zoom, rotate, flip controls
    ├── Real-time preview
    └── File output processing
```

## Usage

### Basic Implementation

```typescript
<ax-avatar-upload
  [avatarUrl]="user.avatarUrl"
  [displayName]="user.displayName"
  (avatarChange)="onAvatarChange($event)"
  (uploadComplete)="onUploadComplete($event)"
  (uploadError)="onUploadError($event)"
></ax-avatar-upload>
```

### Advanced Configuration

```typescript
<ax-avatar-upload
  [avatarUrl]="user.avatarUrl"
  [displayName]="user.displayName"
  [disabled]="isEditingDisabled"
  [maxFileSize]="10 * 1024 * 1024"
  [allowedTypes]="['image/jpeg', 'image/png']"
  (avatarChange)="onAvatarChange($event)"
  (uploadStart)="onUploadStart()"
  (uploadComplete)="onUploadComplete($event)"
  (uploadError)="onUploadError($event)"
></ax-avatar-upload>
```

### Event Handling

```typescript
export class ProfileComponent {
  onAvatarChange(avatarUrl: string): void {
    // Update local user data
    this.user.avatarUrl = avatarUrl;
  }

  onUploadStart(): void {
    // Show loading indicator, disable form, etc.
    this.isUploading = true;
  }

  onUploadComplete(avatarUrl: string): void {
    // Handle successful upload
    this.isUploading = false;
    this.snackBar.open('Avatar updated successfully!', 'Close');
  }

  onUploadError(error: string): void {
    // Handle upload error
    this.isUploading = false;
    console.error('Upload failed:', error);
  }
}
```

## Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `avatarUrl` | `string \| null` | `null` | Current avatar image URL |
| `displayName` | `string` | `'User'` | User's display name for accessibility |
| `disabled` | `boolean` | `false` | Disable upload functionality |
| `maxFileSize` | `number` | `5242880` | Maximum file size in bytes (5MB) |
| `allowedTypes` | `string[]` | `['image/jpeg', 'image/png', 'image/webp']` | Allowed MIME types |

## Output Events

| Event | Payload | Description |
|-------|---------|-------------|
| `avatarChange` | `string` | Emitted when avatar URL changes |
| `uploadStart` | `void` | Emitted when upload begins |
| `uploadComplete` | `string` | Emitted when upload succeeds with new URL |
| `uploadError` | `string` | Emitted when upload fails with error message |

## Styling Customization

### CSS Custom Properties

```css
:root {
  --avatar-size: 96px;
  --avatar-border-radius: 50%;
  --upload-progress-color: var(--mat-primary-main);
  --error-color: var(--mat-error-main);
  --success-color: var(--mat-success-main);
}
```

### Tailwind Classes Override

```typescript
// Custom avatar size
<ax-avatar-upload class="[&_.avatar-container]:w-32 [&_.avatar-container]:h-32">
```

### Angular Material Theme Integration

The component automatically adapts to your Angular Material theme:
- Primary colors for buttons and progress
- Surface colors for backgrounds
- Error colors for validation messages

## Backend Integration

### Required API Endpoints

#### Upload Avatar
```
POST /api/profile/avatar
Content-Type: multipart/form-data
Body: { avatar: File }

Response:
{
  "success": true,
  "data": {
    "avatar": "https://api.example.com/uploads/avatars/user_123.jpg",
    "thumbnails": {
      "small": "https://api.example.com/uploads/avatars/user_123_small.jpg",
      "medium": "https://api.example.com/uploads/avatars/user_123_medium.jpg",
      "large": "https://api.example.com/uploads/avatars/user_123_large.jpg"
    }
  }
}
```

#### Delete Avatar
```
DELETE /api/profile/avatar

Response:
{
  "success": true,
  "data": {
    "message": "Avatar deleted successfully"
  }
}
```

### UserService Integration

The component integrates with the existing `UserService`:

```typescript
// Upload with progress tracking
uploadAvatar(formData: FormData, progressCallback?: (progress: number) => void)

// Delete avatar
deleteAvatar(): Observable<ApiResponse<{ message: string }>>
```

## Error Handling

### Client-side Validation
- File type validation (MIME type checking)
- File size validation (configurable limit)
- Image dimension validation (minimum size)

### Server-side Error Handling
- HTTP error responses are caught and displayed
- Network errors are handled gracefully
- Upload timeout handling

### User Feedback
- **Success**: Green snackbar with success message
- **Error**: Red snackbar with specific error message
- **Progress**: Visual progress bar during upload
- **Validation**: Inline error messages for invalid files

## Accessibility Features

### Screen Reader Support
- Comprehensive ARIA labels
- Role definitions for interactive elements
- Live regions for status updates

### Keyboard Navigation
- Tab navigation through all controls
- Enter/Space activation for buttons
- Escape to close dialogs

### Visual Accessibility
- High contrast support
- Focus indicators
- Error state indicators
- Loading state announcements

## Performance Considerations

### Bundle Size
- **ngx-image-cropper**: ~50KB (lazy-loaded in dialog)
- **Component Code**: ~15KB
- **Total Impact**: Minimal, with code splitting

### Image Processing
- Client-side resizing reduces upload size
- Progressive image loading
- Thumbnail generation on server
- Lazy loading of cropping library

### Memory Management
- Automatic cleanup of object URLs
- Image buffer disposal after processing
- Dialog cleanup on close

## Browser Support

- **Modern Browsers**: Full support (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- **File API**: Required for file reading
- **Canvas API**: Required for image processing
- **FormData**: Required for file uploads

## Testing

### Unit Tests
```typescript
// Test file validation
it('should reject files that are too large', () => {
  const largeFile = new File([''], 'large.jpg', { type: 'image/jpeg' });
  Object.defineProperty(largeFile, 'size', { value: 10 * 1024 * 1024 });
  
  const result = component.validateFile(largeFile);
  expect(result.valid).toBe(false);
  expect(result.error).toContain('File size must be less than');
});
```

### E2E Tests
```typescript
// Test drag and drop upload
test('should upload avatar via drag and drop', async ({ page }) => {
  await page.goto('/profile');
  
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: /upload avatar/i }).click();
  
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(['test-avatar.jpg']);
  
  await expect(page.getByText(/avatar updated successfully/i)).toBeVisible();
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend allows multipart uploads from your domain
2. **File Size**: Check both client and server size limits
3. **File Types**: Verify MIME type configuration matches between frontend and backend
4. **Progress Not Updating**: Ensure `reportProgress: true` in HTTP request

### Debug Mode

Enable debug logging:
```typescript
// Add to component constructor
if (environment.production === false) {
  console.log('Avatar upload component in debug mode');
}
```

## Dependencies

- `@angular/core`: ^18.0.0
- `@angular/material`: ^18.0.0
- `@angular/common`: ^18.0.0
- `ngx-image-cropper`: ^9.1.5
- `tailwindcss`: ^3.4.0

## License

This component is part of the AegisX platform and follows the project's MIT license.