# Avatar Display Testing Guide

This guide provides comprehensive testing for the avatar display functionality across the Angular application, covering both navigation bar and profile page avatar implementations.

## 🎯 Test Coverage Overview

The avatar display tests verify the following functionality:

### Navigation Bar Avatar
- ✅ Avatar displays in top navigation bar
- ✅ Avatar is circular with correct dimensions (32x32px)
- ✅ Avatar shows in user dropdown menu (48x48px)
- ✅ Both avatars use the same image source
- ✅ Fallback to default avatar when image fails to load
- ✅ Proper accessibility attributes (alt text, role)

### Profile Page Avatar
- ✅ Avatar displays in profile info section
- ✅ Avatar component (`ax-avatar-upload`) renders correctly
- ✅ Same avatar as navigation bar
- ✅ Proper styling and circular display

### Error Handling & Fallbacks
- ✅ Network errors (404, 500) gracefully handled
- ✅ Missing avatar URL falls back to default image
- ✅ Slow network loading doesn't break UI
- ✅ API errors don't prevent avatar display

### Visual & Accessibility Testing
- ✅ Visual regression testing with screenshots
- ✅ Proper CSS styling (border-radius, object-fit)
- ✅ Accessibility compliance (alt text, ARIA attributes)
- ✅ Responsive behavior across different screen sizes

## 🚀 Quick Test Execution

### Prerequisites

1. **Services Running:**
   ```bash
   # API Server
   npm run serve api  # localhost:3333
   
   # Web Server  
   npm run serve web  # localhost:4200
   ```

2. **Test User Available:**
   - Email: `admin@aegisx.local`
   - Password: `Admin123!`
   - Avatar: Should be uploaded and accessible

3. **Avatar File Present:**
   ```
   uploads/avatars/2c9fe167-a9e0-4709-8e12-39e699d97754_95113282-dd26-4392-8cb1-1f9aa945d549.png
   ```

### Run Avatar Tests

```bash
# Run all avatar tests with our custom script
./test-avatar-display.sh

# Or run Playwright tests directly
cd apps/e2e
npx playwright test src/specs/avatar-display.spec.ts --headed

# Run specific test groups
npx playwright test src/specs/avatar-display.spec.ts --grep "Navigation Bar Avatar"
npx playwright test src/specs/avatar-display.spec.ts --grep "Profile Page Avatar"
npx playwright test src/specs/avatar-display.spec.ts --grep "Avatar Visual Testing"
```

## 📋 Manual Test Checklist

### Navigation Bar Tests
- [ ] Login with admin credentials
- [ ] Verify avatar appears in top-right corner
- [ ] Check avatar is circular (32x32px)
- [ ] Click user menu - avatar should appear in dropdown (48x48px)
- [ ] Both avatars should show the same image
- [ ] Check alt text is meaningful

### Profile Page Tests
- [ ] Navigate to `/profile` page
- [ ] Verify `ax-avatar-upload` component displays
- [ ] Check avatar matches navigation bar avatar
- [ ] Verify avatar is circular and properly styled
- [ ] Test avatar upload functionality (if available)

### Error Scenario Tests
- [ ] Block avatar image URL → should show default avatar
- [ ] Slow network → should handle gracefully
- [ ] Invalid avatar URL → should fallback properly
- [ ] Missing avatar in profile data → should use default

## 🔧 Test Implementation Details

### Test Files Structure

```
apps/e2e/src/
├── specs/
│   └── avatar-display.spec.ts       # Main avatar test suite
├── pages/
│   ├── navigation.page.ts           # Enhanced with avatar methods
│   ├── profile.page.ts              # Enhanced with avatar methods
│   └── login.page.ts                # For authentication
└── fixtures/
    └── test-data.ts                 # Test user data
```

### Key Test Cases

#### 1. Navigation Avatar Display
```typescript
test('should display user avatar in navigation bar after login', async ({ page }) => {
  await loginPage.login('admin@aegisx.local', 'Admin123!');
  
  const userMenuButton = page.locator('button[mat-icon-button][matMenuTriggerFor="userMenu"]');
  const avatar = userMenuButton.locator('img');
  
  await expect(avatar).toBeVisible();
  await expect(avatar).toHaveCSS('border-radius', '50%');
  await expect(avatar).toHaveCSS('width', '32px');
});
```

#### 2. Profile Avatar Display  
```typescript
test('should display avatar on profile page', async ({ page }) => {
  await loginPage.login('admin@aegisx.local', 'Admin123!');
  await page.goto('/profile');
  
  const avatarComponent = page.locator('ax-avatar-upload');
  const profileAvatar = avatarComponent.locator('img');
  
  await expect(avatarComponent).toBeVisible();
  await expect(profileAvatar).toBeVisible();
});
```

#### 3. Avatar Consistency
```typescript
test('should show same avatar in both navigation and profile page', async ({ page }) => {
  // Get navigation avatar src
  const navAvatarSrc = await navigationPage.getNavigationAvatarSrc();
  
  // Get profile avatar src
  await page.goto('/profile');
  const profileAvatarSrc = await profilePage.getAvatarSrc();
  
  expect(navAvatarSrc).toEqual(profileAvatarSrc);
});
```

#### 4. Error Handling
```typescript
test('should handle avatar loading errors with fallback', async ({ page }) => {
  // Mock 404 error for avatar requests
  await page.route('**/uploads/avatars/**', route => {
    route.fulfill({ status: 404 });
  });
  
  await loginPage.login('admin@aegisx.local', 'Admin123!');
  
  const avatar = await navigationPage.getNavigationAvatar();
  const avatarSrc = await avatar.getAttribute('src');
  
  expect(avatarSrc).toContain('/assets/images/avatars/default.png');
});
```

## 🎨 Visual Testing

### Screenshot Comparison
The tests automatically capture screenshots for visual regression testing:

- `navigation-avatar.png` - Navigation bar with avatar
- `user-menu-avatar.png` - User dropdown menu with avatar  
- `profile-avatar.png` - Profile page avatar section

### CSS Verification
Tests verify proper styling:
- `border-radius: 50%` for circular shape
- Correct dimensions (32px navigation, 48px dropdown)
- `object-fit: cover` for proper image scaling
- Proper positioning and layout

## 🚨 Common Issues & Troubleshooting

### Avatar Not Displaying
1. **Check API Response:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3333/api/profile
   ```
   
2. **Verify Avatar File:**
   ```bash
   ls -la uploads/avatars/
   ```
   
3. **Check Network Requests:**
   - Open DevTools → Network tab
   - Look for failed avatar requests
   - Check CORS headers

### Test Failures
1. **Timing Issues:**
   - Add wait times for profile loading
   - Use `waitForTimeout(2000)` after login
   
2. **Element Not Found:**
   - Check CSS selectors in page objects
   - Verify component structure hasn't changed
   
3. **Image Loading:**
   - Ensure avatar files are accessible
   - Check static file serving configuration

### Fallback Behavior
1. **Default Avatar Missing:**
   ```bash
   ls -la apps/web/public/assets/images/avatars/default.png
   ```
   
2. **Auth Service Fallback:**
   - Check `loadUserProfile()` method in `auth.service.ts`
   - Verify fallback logic in `app.ts` template

## 📊 Expected Test Results

### All Tests Passing
```
✅ Navigation Bar Avatar
  - should display user avatar in navigation bar after login
  - should show avatar in user dropdown menu  
  - should handle avatar loading errors with fallback

✅ Profile Page Avatar
  - should display avatar on profile page
  - should show same avatar in both navigation and profile page

✅ Avatar Visual Testing
  - should take visual snapshots of avatar display

✅ Avatar Error Handling
  - should handle API errors gracefully
  - should handle missing avatar URL in profile data
```

### Performance Metrics
- Avatar load time: < 1 second
- Page load with avatar: < 3 seconds  
- Fallback response: < 500ms

## 🔄 Continuous Integration

### GitHub Actions Integration
Add to your CI pipeline:

```yaml
- name: Run Avatar Display Tests
  run: |
    npm run serve api &
    npm run serve web &
    sleep 10
    ./test-avatar-display.sh
```

### Test Reporting
- Screenshots stored in `apps/e2e/test-results/`
- HTML reports generated by Playwright
- Visual diff comparisons for regression testing

## 📝 Maintenance

### Regular Checks
- [ ] Update test data when user structure changes
- [ ] Refresh screenshots when UI updates
- [ ] Verify new avatar upload functionality
- [ ] Test across different browsers and devices

### Test Data Updates
When the avatar URL or user data changes:

1. Update the expected avatar URL in tests
2. Refresh visual regression screenshots
3. Update page object selectors if needed
4. Verify accessibility attributes

---

## 🎯 Summary

This comprehensive avatar testing suite ensures:

1. **Functional Testing** - Avatars display correctly in both locations
2. **Visual Testing** - Proper styling and layout maintained  
3. **Error Handling** - Graceful fallbacks when images fail to load
4. **Accessibility** - Proper alt text and ARIA attributes
5. **Consistency** - Same avatar shown across different UI components
6. **Performance** - Fast loading and responsive behavior

Run `./test-avatar-display.sh` to execute the full test suite and verify avatar functionality is working correctly across your application.