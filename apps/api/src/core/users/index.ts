export { default as usersPlugin } from './users.plugin';
export type {
  User,
  UserWithRole,
  UserCreateData,
  UserUpdateData,
  UserListOptions,
} from './users.types';
export type {
  ListUsersQuery,
  ListUsersResponse,
  GetUserResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserResponse,
  ChangeUserPasswordRequest,
} from './users.schemas';

// Department assignment types and services
export { UserDepartmentsService } from './user-departments.service';
export { UserDepartmentsRepository } from './user-departments.repository';
export type {
  UserDepartment,
  AssignUserToDepartmentData,
} from './user-departments.repository';
