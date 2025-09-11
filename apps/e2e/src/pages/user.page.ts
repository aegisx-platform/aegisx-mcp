import { Page, Locator } from '@playwright/test';

export class UserPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly addUserButton: Locator;
  readonly searchInput: Locator;
  readonly userTable: Locator;
  readonly tableRows: Locator;
  readonly pagination: Locator;
  readonly filterButton: Locator;
  readonly exportButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1:has-text("User Management")');
    this.addUserButton = page.locator('button:has-text("Add User")');
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.userTable = page.locator('mat-table, table.mat-table');
    this.tableRows = page.locator('mat-row, tr.mat-row');
    this.pagination = page.locator('mat-paginator');
    this.filterButton = page.locator('button:has-text("Filter")');
    this.exportButton = page.locator('button:has-text("Export")');
    this.deleteButton = page.locator('button:has-text("Delete")');
  }

  async goto() {
    await this.page.goto('/users');
  }

  async searchUsers(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    // Wait for search results
    await this.page.waitForLoadState('networkidle');
  }

  async clearSearch() {
    await this.searchInput.clear();
    await this.searchInput.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async getUserCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async getUserByEmail(email: string): Promise<Locator> {
    return this.tableRows.filter({ hasText: email });
  }

  async clickAddUser() {
    await this.addUserButton.click();
    // Wait for dialog
    await this.page.waitForSelector('mat-dialog-container');
  }

  async selectUser(email: string) {
    const userRow = await this.getUserByEmail(email);
    const checkbox = userRow.locator('mat-checkbox, input[type="checkbox"]');
    await checkbox.click();
  }

  async clickUserRow(email: string) {
    const userRow = await this.getUserByEmail(email);
    await userRow.click();
  }

  async goToPage(pageNumber: number) {
    const pageButton = this.pagination.locator(`button:has-text("${pageNumber}")`);
    await pageButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getPageSize(): Promise<number> {
    const pageSizeSelect = this.pagination.locator('mat-select');
    const selectedValue = await pageSizeSelect.textContent();
    return parseInt(selectedValue || '10');
  }

  async setPageSize(size: number) {
    const pageSizeSelect = this.pagination.locator('mat-select');
    await pageSizeSelect.click();
    
    const option = this.page.locator(`mat-option:has-text("${size}")`);
    await option.click();
    
    await this.page.waitForLoadState('networkidle');
  }

  async openFilterMenu() {
    await this.filterButton.click();
    await this.page.waitForSelector('.filter-menu, mat-menu');
  }

  async applyFilter(filterType: string, value: string) {
    await this.openFilterMenu();
    
    // Select filter type
    const filterOption = this.page.locator(`button:has-text("${filterType}")`);
    await filterOption.click();
    
    // Enter filter value
    const filterInput = this.page.locator(`input[placeholder*="${filterType}"]`);
    await filterInput.fill(value);
    
    // Apply filter
    const applyButton = this.page.locator('button:has-text("Apply")');
    await applyButton.click();
    
    await this.page.waitForLoadState('networkidle');
  }

  async clearAllFilters() {
    const clearButton = this.page.locator('button:has-text("Clear")');
    if (await clearButton.count() > 0) {
      await clearButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async sortByColumn(columnName: string) {
    const columnHeader = this.page.locator(`mat-header-cell:has-text("${columnName}"), th:has-text("${columnName}")`);
    await columnHeader.click();
    await this.page.waitForTimeout(500); // Wait for sort animation
  }

  async exportUsers(format: 'CSV' | 'Excel' | 'PDF') {
    await this.exportButton.click();
    
    const formatOption = this.page.locator(`button:has-text("${format}")`);
    await formatOption.click();
  }

  async deleteSelectedUsers() {
    await this.deleteButton.click();
    
    // Wait for confirmation dialog
    await this.page.waitForSelector('[role="alertdialog"], mat-dialog-container');
    
    // Confirm deletion
    const confirmButton = this.page.locator('button:has-text("Confirm")');
    await confirmButton.click();
    
    await this.page.waitForLoadState('networkidle');
  }

  async waitForTableToLoad() {
    await this.page.waitForSelector('mat-table, table.mat-table');
    await this.page.waitForSelector('mat-row, tr.mat-row');
    
    // Wait for any loading spinners to disappear
    await this.page.waitForSelector('mat-spinner', { state: 'hidden', timeout: 5000 }).catch(() => {
      // Ignore timeout - spinners may not appear
    });
  }
}

export class UserFormDialog {
  readonly page: Page;
  readonly dialog: Locator;
  readonly emailInput: Locator;
  readonly usernameInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly roleSelect: Locator;
  readonly statusToggle: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly formErrors: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.locator('mat-dialog-container');
    this.emailInput = this.dialog.locator('input[formControlName="email"]');
    this.usernameInput = this.dialog.locator('input[formControlName="username"]');
    this.firstNameInput = this.dialog.locator('input[formControlName="firstName"]');
    this.lastNameInput = this.dialog.locator('input[formControlName="lastName"]');
    this.roleSelect = this.dialog.locator('mat-select[formControlName="role"]');
    this.statusToggle = this.dialog.locator('mat-slide-toggle[formControlName="status"]');
    this.saveButton = this.dialog.locator('button:has-text("Save")');
    this.cancelButton = this.dialog.locator('button:has-text("Cancel")');
    this.formErrors = this.dialog.locator('mat-error');
  }

  async fillForm(userData: {
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    isActive?: boolean;
  }) {
    if (userData.email) {
      await this.emailInput.fill(userData.email);
    }
    
    if (userData.username) {
      await this.usernameInput.fill(userData.username);
    }
    
    if (userData.firstName) {
      await this.firstNameInput.fill(userData.firstName);
    }
    
    if (userData.lastName) {
      await this.lastNameInput.fill(userData.lastName);
    }
    
    if (userData.role) {
      await this.roleSelect.click();
      const roleOption = this.page.locator(`mat-option:has-text("${userData.role}")`);
      await roleOption.click();
    }
    
    if (userData.isActive !== undefined) {
      const isChecked = await this.statusToggle.isChecked();
      if (isChecked !== userData.isActive) {
        await this.statusToggle.click();
      }
    }
  }

  async save() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async getValidationErrors(): Promise<string[]> {
    const errors: string[] = [];
    const errorCount = await this.formErrors.count();
    
    for (let i = 0; i < errorCount; i++) {
      const errorText = await this.formErrors.nth(i).textContent();
      if (errorText) errors.push(errorText);
    }
    
    return errors;
  }

  async waitForClose() {
    await this.dialog.waitFor({ state: 'hidden' });
  }
}

export class UserDetailPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly userInfo: Locator;
  readonly activityTab: Locator;
  readonly permissionsTab: Locator;
  readonly sessionsTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.locator('button:has-text("Back")');
    this.editButton = page.locator('button:has-text("Edit")');
    this.deleteButton = page.locator('button:has-text("Delete")');
    this.userInfo = page.locator('.user-info-card');
    this.activityTab = page.locator('mat-tab-label:has-text("Activity")');
    this.permissionsTab = page.locator('mat-tab-label:has-text("Permissions")');
    this.sessionsTab = page.locator('mat-tab-label:has-text("Sessions")');
  }

  async getUserInfo(): Promise<{
    email?: string;
    username?: string;
    role?: string;
    status?: string;
  }> {
    const info: any = {};
    
    const emailElement = this.userInfo.locator('[data-field="email"]');
    if (await emailElement.count() > 0) {
      info.email = await emailElement.textContent();
    }
    
    const usernameElement = this.userInfo.locator('[data-field="username"]');
    if (await usernameElement.count() > 0) {
      info.username = await usernameElement.textContent();
    }
    
    const roleElement = this.userInfo.locator('[data-field="role"]');
    if (await roleElement.count() > 0) {
      info.role = await roleElement.textContent();
    }
    
    const statusElement = this.userInfo.locator('[data-field="status"]');
    if (await statusElement.count() > 0) {
      info.status = await statusElement.textContent();
    }
    
    return info;
  }

  async clickEdit() {
    await this.editButton.click();
    await this.page.waitForSelector('mat-dialog-container');
  }

  async clickDelete() {
    await this.deleteButton.click();
    await this.page.waitForSelector('[role="alertdialog"]');
  }

  async goBack() {
    await this.backButton.click();
  }

  async selectTab(tabName: 'Activity' | 'Permissions' | 'Sessions') {
    const tab = this.page.locator(`mat-tab-label:has-text("${tabName}")`);
    await tab.click();
  }
}