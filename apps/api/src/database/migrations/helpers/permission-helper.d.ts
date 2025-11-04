import { Knex } from 'knex';

export interface Permission {
  resource: string;
  action: string;
  description?: string;
}

export interface RoleAssignment {
  roleId: string;
  permissions: Permission[];
}

export function createPermissions(
  knex: Knex,
  permissions: Permission[],
  options?: {
    assignToAdmin?: boolean;
    roleAssignments?: RoleAssignment[];
  },
): Promise<void>;

export function createRoleIfNotExists(
  knex: Knex,
  roleName: string,
  description?: string,
  parentRoleName?: string,
): Promise<void>;

export function removePermissions(
  knex: Knex,
  permissions: Permission[],
): Promise<void>;

export function permissionExists(
  knex: Knex,
  resource: string,
  action: string,
): Promise<boolean>;

export function getPermissionId(
  knex: Knex,
  resource: string,
  action: string,
): Promise<string | null>;
