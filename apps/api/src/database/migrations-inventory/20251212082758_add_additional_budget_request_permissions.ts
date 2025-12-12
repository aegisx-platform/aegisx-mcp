import { Knex } from 'knex';
import {
  createPermissions,
  removePermissions,
  createRoleIfNotExists,
} from '../migrations/helpers/permission-helper.js';

const NEW_PERMISSIONS = [
  {
    resource: 'inventory:budgetRequests',
    action: 'create',
    description: 'Create new budget requests',
  },
  {
    resource: 'inventory:budgetRequests',
    action: 'view_dept',
    description: 'View department budget requests (collaborative)',
  },
  {
    resource: 'inventory:budgetRequests',
    action: 'view_all',
    description: 'View all budget requests (finance/admin)',
  },
  {
    resource: 'inventory:budgetRequests',
    action: 'edit_dept',
    description: 'Edit department budget requests (DRAFT only, collaborative)',
  },
  {
    resource: 'inventory:budgetRequests',
    action: 'submit',
    description: 'Submit budget requests for validation',
  },
  {
    resource: 'inventory:budgetRequests',
    action: 'delete',
    description: 'Delete budget requests',
  },
  {
    resource: 'inventory:budgetRequests',
    action: 'validate',
    description: 'Validate budget requests before submit',
  },
];

export async function up(knex: Knex): Promise<void> {
  console.log(
    '[Migration] Ensuring roles exist and creating additional budgetRequests permissions...',
  );

  // Ensure the roles exist before assigning permissions.
  // These functions are idempotent.
  await createRoleIfNotExists(
    knex,
    'inventory.pharmacist',
    'Inventory Pharmacist Role',
    'admin',
  );
  await createRoleIfNotExists(
    knex,
    'inventory.department_head',
    'Inventory Department Head Role',
    'admin',
  );
  await createRoleIfNotExists(
    knex,
    'inventory.finance_manager',
    'Inventory Finance Manager Role',
    'admin',
  );

  // The helper function createPermissions is idempotent and can be run safely multiple times.
  // It also handles role assignments in the same transaction.
  await createPermissions(knex, NEW_PERMISSIONS, {
    roleAssignments: [
      // Pharmacists get collaborative permissions
      {
        roleId: 'inventory.pharmacist',
        permissions: [
          { resource: 'inventory:budgetRequests', action: 'create' },
          { resource: 'inventory:budgetRequests', action: 'view_dept' },
          { resource: 'inventory:budgetRequests', action: 'edit_dept' },
          { resource: 'inventory:budgetRequests', action: 'submit' },
          { resource: 'inventory:budgetRequests', action: 'delete' },
          { resource: 'inventory:budgetRequests', action: 'validate' },
        ],
      },
      // Department heads can also view department requests
      {
        roleId: 'inventory.department_head',
        permissions: [
          { resource: 'inventory:budgetRequests', action: 'view_dept' },
        ],
      },
      // Finance managers get view_all for cross-department visibility
      {
        roleId: 'inventory.finance_manager',
        permissions: [
          { resource: 'inventory:budgetRequests', action: 'view_all' },
        ],
      },
    ],
  });

  console.log(
    '[Migration] Additional budgetRequests permissions created and assigned successfully.',
  );
}

export async function down(knex: Knex): Promise<void> {
  console.log('[Migration] Removing additional budgetRequests permissions...');

  // The removePermissions helper will also remove the role_permissions links.
  await removePermissions(knex, NEW_PERMISSIONS);

  console.log(
    '[Migration] Additional budgetRequests permissions removed successfully.',
  );
}
