import { test, expect } from '@playwright/test';
import { UserPage, UserFormDialog, UserDetailPage } from '../pages/user.page';

test.describe('User Management CRUD Operations', () => {
  let userPage: UserPage;
  let userFormDialog: UserFormDialog;
  let userDetailPage: UserDetailPage;
  const testUser = {
    email: `test.user.${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    firstName: 'Test',
    lastName: 'User',
    role: 'User',
    isActive: true
  };

  test.beforeEach(async ({ page }) => {
    userPage = new UserPage(page);
    userFormDialog = new UserFormDialog(page);
    userDetailPage = new UserDetailPage(page);
    
    await userPage.goto();
    await userPage.waitForTableToLoad();
  });

  test('should display user list with pagination', async ({ page }) => {
    // Verify page title
    await expect(userPage.pageTitle).toBeVisible();
    await expect(userPage.pageTitle).toHaveText('User Management');

    // Verify table is visible
    await expect(userPage.userTable).toBeVisible();

    // Check that users are displayed
    const userCount = await userPage.getUserCount();
    expect(userCount).toBeGreaterThan(0);

    // Verify pagination is present
    await expect(userPage.pagination).toBeVisible();

    // Check page size options
    await userPage.setPageSize(25);
    const newCount = await userPage.getUserCount();
    expect(newCount).toBeGreaterThan(userCount); // Should show more users
  });

  test('should search users', async () => {
    // Get initial user count
    const initialCount = await userPage.getUserCount();

    // Search for admin user
    await userPage.searchUsers('admin');

    // Verify search results
    const searchCount = await userPage.getUserCount();
    expect(searchCount).toBeLessThanOrEqual(initialCount);

    // Verify search results contain admin
    const adminUser = await userPage.getUserByEmail('admin@aegisx.local');
    await expect(adminUser).toBeVisible();

    // Clear search
    await userPage.clearSearch();

    // Verify original list is restored
    const restoredCount = await userPage.getUserCount();
    expect(restoredCount).toBe(initialCount);
  });

  test('should create a new user', async ({ page }) => {
    // Click Add User button
    await userPage.clickAddUser();

    // Verify dialog opened
    await expect(userFormDialog.dialog).toBeVisible();

    // Fill form with test data
    await userFormDialog.fillForm(testUser);

    // Save the user
    await userFormDialog.save();

    // Wait for dialog to close
    await userFormDialog.waitForClose();

    // Search for the new user
    await userPage.searchUsers(testUser.email);

    // Verify user was created
    const newUser = await userPage.getUserByEmail(testUser.email);
    await expect(newUser).toBeVisible();
  });

  test('should validate user form', async ({ page }) => {
    // Open add user dialog
    await userPage.clickAddUser();

    // Try to save without filling required fields
    await userFormDialog.save();

    // Check validation errors
    const errors = await userFormDialog.getValidationErrors();
    expect(errors.length).toBeGreaterThan(0);

    // Fill invalid email
    await userFormDialog.fillForm({
      email: 'invalid-email',
      username: 'test'
    });

    // Check email validation
    await userFormDialog.emailInput.blur();
    const emailErrors = await userFormDialog.getValidationErrors();
    expect(emailErrors.some(e => e.includes('email'))).toBe(true);

    // Cancel form
    await userFormDialog.cancel();
    await userFormDialog.waitForClose();
  });

  test('should view user details', async ({ page }) => {
    // Click on admin user
    await userPage.clickUserRow('admin@aegisx.local');

    // Wait for navigation
    await page.waitForURL(/\/users\/\d+/);

    // Verify user details page
    const userInfo = await userDetailPage.getUserInfo();
    expect(userInfo.email).toContain('admin@aegisx.local');
    expect(userInfo.role).toBeDefined();

    // Check tabs
    await expect(userDetailPage.activityTab).toBeVisible();
    await expect(userDetailPage.permissionsTab).toBeVisible();
    await expect(userDetailPage.sessionsTab).toBeVisible();

    // Navigate through tabs
    await userDetailPage.selectTab('Activity');
    await page.waitForTimeout(500);

    await userDetailPage.selectTab('Permissions');
    await page.waitForTimeout(500);

    await userDetailPage.selectTab('Sessions');
    await page.waitForTimeout(500);

    // Go back to list
    await userDetailPage.goBack();
    await expect(page).toHaveURL(/\/users$/);
  });

  test('should edit user', async ({ page }) => {
    // First create a user to edit
    await userPage.clickAddUser();
    await userFormDialog.fillForm(testUser);
    await userFormDialog.save();
    await userFormDialog.waitForClose();

    // Search for the user
    await userPage.searchUsers(testUser.email);

    // Click on the user to view details
    await userPage.clickUserRow(testUser.email);
    await page.waitForURL(/\/users\/\d+/);

    // Click edit button
    await userDetailPage.clickEdit();

    // Verify edit dialog opened with pre-filled data
    await expect(userFormDialog.dialog).toBeVisible();
    
    // Check pre-filled values
    const emailValue = await userFormDialog.emailInput.inputValue();
    expect(emailValue).toBe(testUser.email);

    // Update user data
    const updatedData = {
      firstName: 'Updated',
      lastName: 'Name',
      role: 'Admin'
    };
    await userFormDialog.fillForm(updatedData);

    // Save changes
    await userFormDialog.save();
    await userFormDialog.waitForClose();

    // Verify changes were saved
    const updatedInfo = await userDetailPage.getUserInfo();
    expect(updatedInfo.role).toContain('Admin');
  });

  test('should delete user', async ({ page }) => {
    // First create a user to delete
    await userPage.clickAddUser();
    
    const deleteUser = {
      email: `delete.user.${Date.now()}@example.com`,
      username: `deleteuser${Date.now()}`,
      firstName: 'Delete',
      lastName: 'User',
      role: 'User'
    };
    
    await userFormDialog.fillForm(deleteUser);
    await userFormDialog.save();
    await userFormDialog.waitForClose();

    // Search for the user
    await userPage.searchUsers(deleteUser.email);

    // Select the user
    await userPage.selectUser(deleteUser.email);

    // Click delete button
    await userPage.deleteSelectedUsers();

    // Confirm deletion
    // The confirmation is handled in the page object

    // Verify user was deleted
    await userPage.searchUsers(deleteUser.email);
    const deletedUser = await userPage.getUserByEmail(deleteUser.email);
    await expect(deletedUser).toHaveCount(0);
  });

  test('should bulk select and delete users', async ({ page }) => {
    // Create multiple test users
    const bulkUsers = [];
    for (let i = 0; i < 3; i++) {
      const user = {
        email: `bulk.user.${i}.${Date.now()}@example.com`,
        username: `bulkuser${i}${Date.now()}`,
        firstName: `Bulk${i}`,
        lastName: 'User',
        role: 'User'
      };
      bulkUsers.push(user);

      await userPage.clickAddUser();
      await userFormDialog.fillForm(user);
      await userFormDialog.save();
      await userFormDialog.waitForClose();
    }

    // Search for bulk users
    await userPage.searchUsers('bulk.user');

    // Select all bulk users
    for (const user of bulkUsers) {
      await userPage.selectUser(user.email);
    }

    // Delete selected users
    await userPage.deleteSelectedUsers();

    // Verify all were deleted
    await userPage.searchUsers('bulk.user');
    const remainingCount = await userPage.getUserCount();
    expect(remainingCount).toBe(0);
  });

  test('should sort users by different columns', async () => {
    // Sort by email
    await userPage.sortByColumn('Email');
    await userPage.page.waitForTimeout(1000);

    // Get first and last user emails
    const firstRow = userPage.tableRows.first();
    const lastRow = userPage.tableRows.last();
    
    const firstEmail = await firstRow.locator('[data-column="email"]').textContent();
    const lastEmail = await lastRow.locator('[data-column="email"]').textContent();

    // Click again to reverse sort
    await userPage.sortByColumn('Email');
    await userPage.page.waitForTimeout(1000);

    const newFirstEmail = await firstRow.locator('[data-column="email"]').textContent();
    const newLastEmail = await lastRow.locator('[data-column="email"]').textContent();

    // Verify sort changed
    expect(firstEmail).not.toBe(newFirstEmail);
  });

  test('should filter users by role', async () => {
    // Get initial count
    const initialCount = await userPage.getUserCount();

    // Apply Admin role filter
    await userPage.applyFilter('Role', 'Admin');

    // Verify filtered results
    const filteredCount = await userPage.getUserCount();
    expect(filteredCount).toBeLessThan(initialCount);

    // Verify all visible users are admins
    const rows = await userPage.tableRows.count();
    for (let i = 0; i < rows; i++) {
      const roleText = await userPage.tableRows.nth(i).locator('[data-column="role"]').textContent();
      expect(roleText?.toLowerCase()).toContain('admin');
    }

    // Clear filters
    await userPage.clearAllFilters();
    const restoredCount = await userPage.getUserCount();
    expect(restoredCount).toBe(initialCount);
  });

  test('should export user data', async ({ page }) => {
    // Set up download promise
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

    // Export as CSV
    await userPage.exportUsers('CSV');

    try {
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/users.*\.csv/i);
    } catch (error) {
      // If download doesn't trigger, check for success message
      const successMessage = page.locator('text=/export.*success/i');
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    }
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Try to create user with existing email
    await userPage.clickAddUser();
    
    await userFormDialog.fillForm({
      email: 'admin@aegisx.local', // Existing admin email
      username: 'newadmin',
      firstName: 'New',
      lastName: 'Admin',
      role: 'Admin'
    });

    await userFormDialog.save();

    // Should show error message
    const errorMessage = page.locator('.error-message, mat-error, .mat-snack-bar');
    await expect(errorMessage).toBeVisible();

    // Dialog should remain open
    await expect(userFormDialog.dialog).toBeVisible();

    // Cancel
    await userFormDialog.cancel();
  });

  test('should maintain filters and search on pagination', async () => {
    // Apply search
    await userPage.searchUsers('user');
    const searchCount = await userPage.getUserCount();

    // If pagination is available
    if (searchCount > 10) {
      // Go to page 2
      await userPage.goToPage(2);

      // Verify search is still applied
      const searchInput = await userPage.searchInput.inputValue();
      expect(searchInput).toBe('user');
    }

    // Apply filter
    await userPage.applyFilter('Status', 'Active');

    // Verify both search and filter are applied
    const filteredSearchCount = await userPage.getUserCount();
    expect(filteredSearchCount).toBeLessThanOrEqual(searchCount);
  });
});

test.describe('User Management Accessibility', () => {
  let userPage: UserPage;

  test.beforeEach(async ({ page }) => {
    userPage = new UserPage(page);
    await userPage.goto();
    await userPage.waitForTableToLoad();
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab to Add User button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Press Enter to open dialog
    await page.keyboard.press('Enter');

    // Verify dialog opened
    const dialog = page.locator('mat-dialog-container');
    await expect(dialog).toBeVisible();

    // Tab through form fields
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    }

    // Escape to close dialog
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check table has proper role
    const table = page.locator('[role="table"], mat-table');
    await expect(table).toBeVisible();

    // Check action buttons have labels
    const addButton = userPage.addUserButton;
    const ariaLabel = await addButton.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();

    // Check form inputs have labels when dialog opens
    await userPage.clickAddUser();
    
    const emailInput = page.locator('input[formControlName="email"]');
    const emailLabel = await emailInput.getAttribute('aria-label') || 
                      await page.locator('label[for*="email"]').textContent();
    expect(emailLabel).toBeTruthy();
  });

  test('should announce status changes', async ({ page }) => {
    // Check for live regions
    const liveRegion = page.locator('[aria-live="polite"], [aria-live="assertive"]');
    
    // Perform action that triggers status
    await userPage.searchUsers('test');

    // Live region should update
    if (await liveRegion.count() > 0) {
      const announcement = await liveRegion.textContent();
      expect(announcement).toBeTruthy();
    }
  });
});