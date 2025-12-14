import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Types - Note: These types are defined locally for this deprecated service
// This service will be removed in future refactoring
interface UserDepartment {
  id?: number;
  userId?: string;
  departmentId: number;
  isPrimary?: boolean;
  assignedAt?: string;
  [key: string]: any;
}

interface DepartmentUser {
  id?: string;
  userId: string;
  departmentId: number;
  isPrimary?: boolean;
  [key: string]: any;
}

interface AssignDepartmentRequest {
  departmentId: number;
  isPrimary?: boolean;
}

/**
 * Service for managing user-department relationships
 *
 * Handles all API calls for:
 * - Assigning departments to users
 * - Managing primary department assignments
 * - Viewing user-department relationships
 * - Managing departments
 *
 * Note: All endpoints use base URL '/api' (not '/api/admin/system-init')
 */
@Injectable({
  providedIn: 'root',
})
export class UserDepartmentsService {
  private readonly baseUrl = '/api';
  private http = inject(HttpClient);

  /**
   * Get all departments assigned to a user
   *
   * @param userId - The user ID
   * @returns Observable of array of user departments
   *
   * @example
   * this.userDepartmentsService.getUserDepartments('user-123')
   *   .subscribe(departments => {
   *     console.log(`User is assigned to ${departments.length} departments`);
   *   });
   */
  getUserDepartments(userId: string): Observable<UserDepartment[]> {
    return this.http
      .get<{
        departments: UserDepartment[];
      }>(`${this.baseUrl}/users/${userId}/departments`)
      .pipe(
        map((response) => response.departments),
        catchError((err) => {
          console.error('Failed to fetch user departments', err);
          throw err;
        }),
      );
  }

  /**
   * Assign a department to a user
   *
   * Creates a new user-department relationship. Can optionally
   * set this as the user's primary department.
   *
   * @param userId - The user ID
   * @param data - Request data including departmentId and optional isPrimary
   * @returns Observable of the created UserDepartment
   *
   * @example
   * this.userDepartmentsService.assignDepartment('user-123', {
   *   departmentId: 5,
   *   isPrimary: true
   * }).subscribe(
   *   (dept) => console.log('Department assigned:', dept),
   *   (err) => console.error('Assignment failed:', err)
   * );
   */
  assignDepartment(
    userId: string,
    data: AssignDepartmentRequest,
  ): Observable<UserDepartment> {
    return this.http
      .post<UserDepartment>(`${this.baseUrl}/users/${userId}/departments`, data)
      .pipe(
        catchError((err) => {
          console.error('Failed to assign department', err);
          throw err;
        }),
      );
  }

  /**
   * Remove a department assignment from a user
   *
   * Deletes the relationship between a user and a department.
   * Note: Cannot remove a user's primary department unless
   * another department has been set as primary first.
   *
   * @param userId - The user ID
   * @param deptId - The department ID to remove
   * @returns Observable that completes when removal is done
   *
   * @example
   * this.userDepartmentsService.removeDepartment('user-123', 5)
   *   .subscribe(
   *     () => console.log('Department removed'),
   *     (err) => console.error('Removal failed:', err)
   *   );
   */
  removeDepartment(userId: string, deptId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/users/${userId}/departments/${deptId}`)
      .pipe(
        catchError((err) => {
          console.error('Failed to remove department', err);
          throw err;
        }),
      );
  }

  /**
   * Set a department as the user's primary department
   *
   * Only one department per user can be marked as primary.
   * Setting a new primary department automatically unsets the previous one.
   *
   * @param userId - The user ID
   * @param deptId - The department ID to set as primary
   * @returns Observable that completes when update is done
   *
   * @example
   * this.userDepartmentsService.setPrimaryDepartment('user-123', 5)
   *   .subscribe(
   *     () => console.log('Primary department updated'),
   *     (err) => console.error('Update failed:', err)
   *   );
   */
  setPrimaryDepartment(userId: string, deptId: number): Observable<void> {
    return this.http
      .put<void>(
        `${this.baseUrl}/users/${userId}/departments/${deptId}/primary`,
        {}, // Empty body
      )
      .pipe(
        catchError((err) => {
          console.error('Failed to set primary department', err);
          throw err;
        }),
      );
  }

  /**
   * Get all users assigned to a specific department
   *
   * Returns list of users and their assignment details for a department.
   *
   * @param deptId - The department ID
   * @returns Observable of array of department users
   *
   * @example
   * this.userDepartmentsService.getDepartmentUsers(5)
   *   .subscribe(users => {
   *     console.log(`Department has ${users.length} assigned users`);
   *   });
   */
  getDepartmentUsers(deptId: number): Observable<DepartmentUser[]> {
    return this.http
      .get<{
        users: DepartmentUser[];
      }>(`${this.baseUrl}/departments/${deptId}/users`)
      .pipe(
        map((response) => response.users),
        catchError((err) => {
          console.error('Failed to fetch department users', err);
          throw err;
        }),
      );
  }

  /**
   * Get the primary department for a user
   *
   * Returns the user's primary department, or null if not set.
   * Handles 404 responses gracefully by returning null.
   *
   * @param userId - The user ID
   * @returns Observable of primary department or null
   *
   * @example
   * this.userDepartmentsService.getPrimaryDepartment('user-123')
   *   .subscribe(primaryDept => {
   *     if (primaryDept) {
   *       console.log('Primary department:', primaryDept.name);
   *     } else {
   *       console.log('User has no primary department assigned');
   *     }
   *   });
   */
  getPrimaryDepartment(userId: string): Observable<UserDepartment | null> {
    return this.http
      .get<UserDepartment>(
        `${this.baseUrl}/users/${userId}/departments/primary`,
      )
      .pipe(
        catchError((err) => {
          // Return null if no primary department found (404)
          if (err.status === 404) {
            return of(null);
          }
          console.error('Failed to fetch primary department', err);
          throw err;
        }),
      );
  }
}
