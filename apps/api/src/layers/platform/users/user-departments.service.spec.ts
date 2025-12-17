import type { Knex } from 'knex';
import { UserDepartmentsService } from './user-departments.service';
import { UserDepartmentsRepository } from './user-departments.repository';
import { DepartmentsRepository } from '../departments/departments.repository';
import { AppError } from '../../../shared/errors/app-error';

/**
 * Helper to create a chainable mock that resolves to a value
 */
function createMockQuery<T>(resolveValue: T) {
  const chain: any = {};

  chain.select = jest.fn().mockReturnValue(chain);
  chain.where = jest.fn().mockReturnValue(chain);
  chain.whereNull = jest.fn().mockReturnValue(chain);
  chain.whereRaw = jest.fn().mockReturnValue(chain);
  chain.whereIn = jest.fn().mockReturnValue(chain);
  chain.orderBy = jest.fn().mockReturnValue(chain);
  chain.first = jest.fn().mockReturnValue(chain);
  chain.count = jest.fn().mockReturnValue(chain);
  chain.insert = jest.fn().mockReturnValue(chain);
  chain.update = jest.fn().mockReturnValue(chain);
  chain.innerJoin = jest.fn().mockReturnValue(chain);
  chain.returning = jest.fn().mockReturnValue(chain);
  chain.then = jest.fn((resolve) => resolve(resolveValue));

  return chain;
}

describe('UserDepartmentsService', () => {
  let service: UserDepartmentsService;
  let mockUserDepartmentsRepository: jest.Mocked<UserDepartmentsRepository>;
  let mockDepartmentsRepository: jest.Mocked<DepartmentsRepository>;
  let mockKnex: any;

  const testUserId = 'user-123-abc-def';
  const testDepartmentId = 5;
  const testUserIdNonExistent = 'user-999-xxx-yyy';
  const testDepartmentIdNonExistent = 999;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock UserDepartmentsRepository
    mockUserDepartmentsRepository = {
      findByUserId: jest.fn(),
      findByDepartmentId: jest.fn(),
      getPrimaryDepartment: jest.fn(),
      getActiveDepartments: jest.fn(),
      assignUserToDepartment: jest.fn(),
      removeUserFromDepartment: jest.fn(),
      getAssignment: jest.fn(),
      isAssignedToDepartment: jest.fn(),
      updateAssignment: jest.fn(),
      countActiveDepartments: jest.fn(),
      countActiveDepartmentUsers: jest.fn(),
    } as any;

    // Mock DepartmentsRepository
    mockDepartmentsRepository = {
      findById: jest.fn(),
    } as any;

    // Mock Knex instance - create a function that returns chainable query builders
    mockKnex = jest.fn(function (tableName: string) {
      return createMockQuery(null);
    }) as any;

    service = new UserDepartmentsService(
      mockUserDepartmentsRepository,
      mockDepartmentsRepository,
      mockKnex,
    );
  });

  // =========================================================================
  // Tests: assignUser() method
  // =========================================================================

  describe('assignUser()', () => {
    it('should assign user to department when both exist', async () => {
      // Arrange
      const mockUserExists = { id: testUserId };
      const mockDepartment = {
        id: testDepartmentId,
        dept_code: 'FIN',
        dept_name: 'Finance',
      };
      const mockAssignment = {
        id: 'assign-1',
        userId: testUserId,
        departmentId: testDepartmentId,
        isPrimary: false,
        assignedRole: 'staff',
        validFrom: null,
        validUntil: null,
        assignedBy: null,
        assignedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        hospitalId: null,
      };

      mockKnex.mockImplementation(() => createMockQuery(mockUserExists));
      mockDepartmentsRepository.findById.mockResolvedValue(mockDepartment);
      mockUserDepartmentsRepository.getAssignment.mockResolvedValue(null);
      mockUserDepartmentsRepository.getActiveDepartments.mockResolvedValue([]);
      mockUserDepartmentsRepository.assignUserToDepartment.mockResolvedValue(
        mockAssignment,
      );

      // Act
      const result = await service.assignUser(testUserId, testDepartmentId);

      // Assert
      expect(result).toEqual(mockAssignment);
      expect(result).not.toHaveProperty('canCreateRequests');
      expect(result).not.toHaveProperty('canEditRequests');
      expect(
        mockUserDepartmentsRepository.assignUserToDepartment,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUserId,
          departmentId: testDepartmentId,
        }),
      );
    });

    it('should validate user exists via Knex before assigning', async () => {
      // Arrange
      mockKnex.mockImplementation(() => createMockQuery(null));

      // Act & Assert
      await expect(
        service.assignUser(testUserIdNonExistent, testDepartmentId),
      ).rejects.toThrow(AppError);

      const error = new AppError('', 404, 'USER_NOT_FOUND');
      expect(
        mockUserDepartmentsRepository.assignUserToDepartment,
      ).not.toHaveBeenCalled();
    });

    it('should validate department exists before assigning', async () => {
      // Arrange
      const mockUserExists = { id: testUserId };
      mockKnex.mockImplementation(() => createMockQuery(mockUserExists));
      mockDepartmentsRepository.findById.mockResolvedValue(null as any);

      // Act & Assert
      await expect(
        service.assignUser(testUserId, testDepartmentIdNonExistent),
      ).rejects.toThrow(AppError);
    });

    it('should reject duplicate assignment', async () => {
      // Arrange
      const mockUserExists = { id: testUserId };
      const mockDepartment = {
        id: testDepartmentId,
        dept_code: 'FIN',
        dept_name: 'Finance',
      };
      const mockExistingAssignment = {
        id: 'existing-assign',
        userId: testUserId,
        departmentId: testDepartmentId,
        hospitalId: null,
        isPrimary: false,
        assignedRole: null,
        validFrom: null,
        validUntil: null,
        assignedBy: null,
        assignedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockKnex.mockImplementation(() => createMockQuery(mockUserExists));
      mockDepartmentsRepository.findById.mockResolvedValue(mockDepartment);
      mockUserDepartmentsRepository.getAssignment.mockResolvedValue(
        mockExistingAssignment,
      );

      // Act & Assert
      await expect(
        service.assignUser(testUserId, testDepartmentId),
      ).rejects.toThrow(AppError);
    });

    it('should validate date range logic in options', async () => {
      // Arrange
      const mockUserExists = { id: testUserId };
      const mockDepartment = {
        id: testDepartmentId,
        dept_code: 'FIN',
        dept_name: 'Finance',
      };
      const validFrom = new Date('2025-12-31');
      const validUntil = new Date('2025-01-01'); // Before validFrom

      mockKnex.mockImplementation(() => createMockQuery(mockUserExists));
      mockDepartmentsRepository.findById.mockResolvedValue(mockDepartment);
      mockUserDepartmentsRepository.getAssignment.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.assignUser(testUserId, testDepartmentId, {
          validFrom,
          validUntil,
        }),
      ).rejects.toThrow(AppError);
    });

    it('should pass options to repository correctly', async () => {
      // Arrange
      const mockUserExists = { id: testUserId };
      const mockDepartment = {
        id: testDepartmentId,
        dept_code: 'FIN',
        dept_name: 'Finance',
      };
      const options = {
        isPrimary: true,
        assignedRole: 'manager',
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        assignedBy: 'admin-1',
        notes: 'Test assignment',
      };
      const mockAssignment = {
        id: 'assign-2',
        userId: testUserId,
        departmentId: testDepartmentId,
        isPrimary: true,
        assignedRole: 'manager',
        validFrom: options.validFrom,
        validUntil: options.validUntil,
        assignedBy: 'admin-1',
        assignedAt: new Date(),
        notes: 'Test assignment',
        createdAt: new Date(),
        updatedAt: new Date(),
        hospitalId: null,
      };

      mockKnex.mockImplementation(() => createMockQuery(mockUserExists));
      mockDepartmentsRepository.findById.mockResolvedValue(mockDepartment);
      mockUserDepartmentsRepository.getAssignment.mockResolvedValue(null);
      mockUserDepartmentsRepository.getActiveDepartments.mockResolvedValue([]);
      mockUserDepartmentsRepository.assignUserToDepartment.mockResolvedValue(
        mockAssignment,
      );

      // Act
      await service.assignUser(testUserId, testDepartmentId, options);

      // Assert
      expect(
        mockUserDepartmentsRepository.assignUserToDepartment,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          isPrimary: true,
          assignedRole: 'manager',
          validFrom: options.validFrom,
          validUntil: options.validUntil,
        }),
      );
    });
  });

  // =========================================================================
  // Tests: removeUser() method
  // =========================================================================

  describe('removeUser()', () => {
    it('should remove user from department when assignment exists', async () => {
      // Arrange
      const mockUserExists = { id: testUserId };
      const mockAssignment = {
        id: 'assign-1',
        userId: testUserId,
        departmentId: testDepartmentId,
        isPrimary: false,
        assignedRole: 'staff',
        validFrom: null,
        validUntil: null,
        assignedBy: null,
        assignedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        hospitalId: null,
      };

      mockKnex.mockImplementation(() => createMockQuery(mockUserExists));
      mockUserDepartmentsRepository.getAssignment.mockResolvedValue(
        mockAssignment,
      );
      mockUserDepartmentsRepository.getActiveDepartments.mockResolvedValue([
        mockAssignment,
      ]);
      mockUserDepartmentsRepository.removeUserFromDepartment.mockResolvedValue(
        undefined,
      );

      // Act
      await service.removeUser(testUserId, testDepartmentId);

      // Assert
      expect(
        mockUserDepartmentsRepository.removeUserFromDepartment,
      ).toHaveBeenCalledWith(testUserId, testDepartmentId);
    });

    it('should validate user exists via Knex before removing', async () => {
      // Arrange
      mockKnex.mockImplementation(() => createMockQuery(null));

      // Act & Assert
      await expect(
        service.removeUser(testUserIdNonExistent, testDepartmentId),
      ).rejects.toThrow(AppError);

      expect(
        mockUserDepartmentsRepository.removeUserFromDepartment,
      ).not.toHaveBeenCalled();
    });

    it('should throw error when assignment not found', async () => {
      // Arrange
      const mockUserExists = { id: testUserId };
      mockKnex.mockImplementation(() => createMockQuery(mockUserExists));
      mockUserDepartmentsRepository.getAssignment.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.removeUser(testUserId, testDepartmentId),
      ).rejects.toThrow(AppError);
    });

    it('should prevent removing only primary department', async () => {
      // Arrange
      const mockUserExists = { id: testUserId };
      const mockAssignment = {
        id: 'assign-1',
        userId: testUserId,
        departmentId: testDepartmentId,
        isPrimary: true, // This is the only primary
        assignedRole: 'staff',
        validFrom: null,
        validUntil: null,
        assignedBy: null,
        assignedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        hospitalId: null,
      };

      mockKnex.mockImplementation(() => createMockQuery(mockUserExists));
      mockUserDepartmentsRepository.getAssignment.mockResolvedValue(
        mockAssignment,
      );
      mockUserDepartmentsRepository.getActiveDepartments.mockResolvedValue([
        mockAssignment,
      ]); // Only one active department

      // Act & Assert
      await expect(
        service.removeUser(testUserId, testDepartmentId),
      ).rejects.toThrow(AppError);
    });

    it('should allow removing primary if user has other active departments', async () => {
      // Arrange
      const mockUserExists = { id: testUserId };
      const mockPrimaryAssignment = {
        id: 'assign-1',
        userId: testUserId,
        departmentId: testDepartmentId,
        isPrimary: true,
        assignedRole: 'staff',
        validFrom: null,
        validUntil: null,
        assignedBy: null,
        assignedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        hospitalId: null,
      };
      const mockSecondaryAssignment = {
        id: 'assign-2',
        userId: testUserId,
        departmentId: 6,
        isPrimary: false,
        assignedRole: 'analyst',
        validFrom: null,
        validUntil: null,
        assignedBy: null,
        assignedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        hospitalId: null,
      };

      mockKnex.mockImplementation(() => createMockQuery(mockUserExists));
      mockUserDepartmentsRepository.getAssignment.mockResolvedValue(
        mockPrimaryAssignment,
      );
      mockUserDepartmentsRepository.getActiveDepartments.mockResolvedValue([
        mockPrimaryAssignment,
        mockSecondaryAssignment,
      ]); // Two active departments
      mockUserDepartmentsRepository.removeUserFromDepartment.mockResolvedValue(
        undefined,
      );

      // Act
      await service.removeUser(testUserId, testDepartmentId);

      // Assert
      expect(
        mockUserDepartmentsRepository.removeUserFromDepartment,
      ).toHaveBeenCalledWith(testUserId, testDepartmentId);
    });
  });

  // =========================================================================
  // Tests: getUserDepartments() method
  // =========================================================================

  describe('getUserDepartments()', () => {
    it('should return active departments for user', async () => {
      // Arrange
      const mockUserExists = { id: testUserId };
      const mockDepartments = [
        {
          id: 'assign-1',
          userId: testUserId,
          departmentId: 5,
          isPrimary: true,
          assignedRole: 'manager',
          validFrom: null,
          validUntil: null,
          assignedBy: 'admin-1',
          assignedAt: new Date(),
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          hospitalId: null,
        },
        {
          id: 'assign-2',
          userId: testUserId,
          departmentId: 6,
          isPrimary: false,
          assignedRole: 'analyst',
          validFrom: null,
          validUntil: null,
          assignedBy: 'admin-1',
          assignedAt: new Date(),
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          hospitalId: null,
        },
      ];

      mockKnex.mockImplementation(() => createMockQuery(mockUserExists));
      mockUserDepartmentsRepository.getActiveDepartments.mockResolvedValue(
        mockDepartments,
      );

      // Act
      const result = await service.getUserDepartments(testUserId);

      // Assert
      expect(result).toEqual(mockDepartments);
      expect(result.length).toBe(2);
    });

    it('should validate user exists via Knex', async () => {
      // Arrange
      mockKnex.mockImplementation(() => createMockQuery(null));

      // Act & Assert
      await expect(
        service.getUserDepartments(testUserIdNonExistent),
      ).rejects.toThrow(AppError);

      expect(
        mockUserDepartmentsRepository.getActiveDepartments,
      ).not.toHaveBeenCalled();
    });

    it('should return empty array when user has no active departments', async () => {
      // Arrange
      const mockUserExists = { id: testUserId };
      mockKnex.mockImplementation(() => createMockQuery(mockUserExists));
      mockUserDepartmentsRepository.getActiveDepartments.mockResolvedValue([]);

      // Act
      const result = await service.getUserDepartments(testUserId);

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  // =========================================================================
  // Tests: getDepartmentUsers() method
  // =========================================================================

  describe('getDepartmentUsers()', () => {
    it('should return users in department with user details', async () => {
      // Arrange
      const mockDepartment = {
        id: testDepartmentId,
        dept_code: 'FIN',
        dept_name: 'Finance',
      };

      // Mock raw database rows that will be returned from knex query
      const mockDatabaseRows = [
        {
          id: 'assign-1',
          user_id: 'user-123',
          department_id: testDepartmentId,
          hospital_id: null,
          is_primary: true,
          assigned_role: 'manager',
          valid_from: null,
          valid_until: null,
          assigned_by: null,
          assigned_at: new Date(),
          notes: null,
          created_at: new Date(),
          updated_at: new Date(),
          user_email: 'manager@example.com',
          user_first_name: 'John',
          user_last_name: 'Doe',
        },
        {
          id: 'assign-2',
          user_id: 'user-456',
          department_id: testDepartmentId,
          hospital_id: null,
          is_primary: false,
          assigned_role: 'staff',
          valid_from: null,
          valid_until: null,
          assigned_by: null,
          assigned_at: new Date(),
          notes: null,
          created_at: new Date(),
          updated_at: new Date(),
          user_email: 'staff@example.com',
          user_first_name: 'Jane',
          user_last_name: 'Smith',
        },
      ];

      mockDepartmentsRepository.findById.mockResolvedValue(mockDepartment);
      mockKnex.mockImplementation(() => createMockQuery(mockDatabaseRows));

      // Act
      const result = await service.getDepartmentUsers(testDepartmentId);

      // Assert: Verify transformations occurred (database column names -> camelCase)
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('userEmail');
      expect(result[0]).toHaveProperty('userFirstName');
      expect(result[0]).toHaveProperty('userLastName');
      expect(result[0].userId).toBe('user-123');
      expect(result[0].userEmail).toBe('manager@example.com');
      expect(result[0]).not.toHaveProperty('canCreateRequests');
    });

    it('should validate department exists before fetching users', async () => {
      // Arrange
      mockDepartmentsRepository.findById.mockResolvedValue(null as any);

      // Act & Assert
      await expect(
        service.getDepartmentUsers(testDepartmentIdNonExistent),
      ).rejects.toThrow(AppError);
    });

    it('should use single JOIN query to fetch user details', async () => {
      // Arrange
      const mockDepartment = {
        id: testDepartmentId,
        dept_code: 'FIN',
        dept_name: 'Finance',
      };
      mockDepartmentsRepository.findById.mockResolvedValue(mockDepartment);
      const mockChain = createMockQuery([]);
      mockKnex.mockImplementation(() => mockChain);

      // Act
      await service.getDepartmentUsers(testDepartmentId);

      // Assert
      // Verify that the knex chain includes innerJoin
      expect(mockChain.innerJoin).toHaveBeenCalled();
    });

    it('should return empty array when department has no users', async () => {
      // Arrange
      const mockDepartment = {
        id: testDepartmentId,
        dept_code: 'FIN',
        dept_name: 'Finance',
      };
      mockDepartmentsRepository.findById.mockResolvedValue(mockDepartment);
      mockKnex.mockImplementation(() => createMockQuery([]));

      // Act
      const result = await service.getDepartmentUsers(testDepartmentId);

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  // =========================================================================
  // Tests: setPrimaryDepartment() method
  // =========================================================================

  describe('setPrimaryDepartment()', () => {
    it('should set primary department for user', async () => {
      // Arrange
      const mockUserExists = { id: testUserId };
      const mockAssignment = {
        id: 'assign-1',
        userId: testUserId,
        departmentId: testDepartmentId,
        isPrimary: false,
        assignedRole: 'staff',
        validFrom: null,
        validUntil: null,
        assignedBy: null,
        assignedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        hospitalId: null,
      };
      const mockUpdatedAssignment = {
        ...mockAssignment,
        isPrimary: true,
      };

      mockKnex.mockImplementation(() => createMockQuery(mockUserExists));
      mockUserDepartmentsRepository.getAssignment.mockResolvedValue(
        mockAssignment,
      );
      mockUserDepartmentsRepository.updateAssignment.mockResolvedValue(
        mockUpdatedAssignment,
      );

      // Act
      const result = await service.setPrimaryDepartment(
        testUserId,
        testDepartmentId,
      );

      // Assert
      expect(result.isPrimary).toBe(true);
      expect(
        mockUserDepartmentsRepository.updateAssignment,
      ).toHaveBeenCalledWith(testUserId, testDepartmentId, {
        isPrimary: true,
      });
    });

    it('should validate user exists via Knex', async () => {
      // Arrange
      mockKnex.mockImplementation(() => createMockQuery(null));

      // Act & Assert
      await expect(
        service.setPrimaryDepartment(testUserIdNonExistent, testDepartmentId),
      ).rejects.toThrow(AppError);
    });

    it('should throw error when assignment not found', async () => {
      // Arrange
      const mockUserExists = { id: testUserId };
      mockKnex.mockImplementation(() => createMockQuery(mockUserExists));
      mockUserDepartmentsRepository.getAssignment.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.setPrimaryDepartment(testUserId, testDepartmentId),
      ).rejects.toThrow(AppError);
    });

    it('should reject future assignment as primary', async () => {
      // Arrange
      const mockUserExists = { id: testUserId };
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10); // 10 days in future

      const mockAssignment = {
        id: 'assign-1',
        userId: testUserId,
        departmentId: testDepartmentId,
        isPrimary: false,
        assignedRole: 'staff',
        validFrom: futureDate,
        validUntil: null,
        assignedBy: null,
        assignedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        hospitalId: null,
      };

      mockKnex.mockImplementation(() => createMockQuery(mockUserExists));
      mockUserDepartmentsRepository.getAssignment.mockResolvedValue(
        mockAssignment,
      );

      // Act & Assert
      await expect(
        service.setPrimaryDepartment(testUserId, testDepartmentId),
      ).rejects.toThrow(AppError);
    });

    it('should reject expired assignment as primary', async () => {
      // Arrange
      const mockUserExists = { id: testUserId };
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10); // 10 days in past

      const mockAssignment = {
        id: 'assign-1',
        userId: testUserId,
        departmentId: testDepartmentId,
        isPrimary: false,
        assignedRole: 'staff',
        validFrom: null,
        validUntil: pastDate,
        assignedBy: null,
        assignedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        hospitalId: null,
      };

      mockKnex.mockImplementation(() => createMockQuery(mockUserExists));
      mockUserDepartmentsRepository.getAssignment.mockResolvedValue(
        mockAssignment,
      );

      // Act & Assert
      await expect(
        service.setPrimaryDepartment(testUserId, testDepartmentId),
      ).rejects.toThrow(AppError);
    });
  });

  // =========================================================================
  // Tests: getUserPrimaryDepartment() method
  // =========================================================================

  describe('getUserPrimaryDepartment()', () => {
    it('should return primary department with department details', async () => {
      // Arrange
      const mockUserExists = { id: testUserId };
      const mockPrimaryAssignment = {
        id: 'assign-1',
        userId: testUserId,
        departmentId: testDepartmentId,
        isPrimary: true,
        assignedRole: 'manager',
        validFrom: null,
        validUntil: null,
        assignedBy: null,
        assignedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        hospitalId: null,
      };
      const mockDepartment = {
        id: testDepartmentId,
        dept_code: 'FIN',
        dept_name: 'Finance Department',
      };

      mockKnex.mockImplementation(() => createMockQuery(mockUserExists));
      mockUserDepartmentsRepository.getPrimaryDepartment.mockResolvedValue(
        mockPrimaryAssignment,
      );
      mockDepartmentsRepository.findById.mockResolvedValue(mockDepartment);

      // Act
      const result = await service.getUserPrimaryDepartment(testUserId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.isPrimary).toBe(true);
      expect(result?.departmentCode).toBe('FIN');
      expect(result?.departmentName).toBe('Finance Department');
      expect(result).not.toHaveProperty('canCreateRequests');
    });

    it('should validate user exists via Knex', async () => {
      // Arrange
      mockKnex.mockImplementation(() => createMockQuery(null));

      // Act & Assert
      await expect(
        service.getUserPrimaryDepartment(testUserIdNonExistent),
      ).rejects.toThrow(AppError);
    });

    it('should return null when user has no primary department', async () => {
      // Arrange
      const mockUserExists = { id: testUserId };
      mockKnex.mockImplementation(() => createMockQuery(mockUserExists));
      mockUserDepartmentsRepository.getPrimaryDepartment.mockResolvedValue(
        null,
      );

      // Act
      const result = await service.getUserPrimaryDepartment(testUserId);

      // Assert
      expect(result).toBeNull();
    });
  });

  // =========================================================================
  // Tests: Knex User Validation Pattern
  // =========================================================================

  describe('Knex User Validation Pattern', () => {
    it('should check deleted_at IS NULL in user validation', async () => {
      // Arrange: Create a spy chain to capture method calls
      const mockChain = createMockQuery({ id: testUserId });
      mockKnex.mockImplementation(() => mockChain);

      mockDepartmentsRepository.findById.mockResolvedValue({
        id: testDepartmentId,
        dept_code: 'FIN',
        dept_name: 'Finance',
      });
      mockUserDepartmentsRepository.getAssignment.mockResolvedValue(null);
      mockUserDepartmentsRepository.getActiveDepartments.mockResolvedValue([]);
      mockUserDepartmentsRepository.assignUserToDepartment.mockResolvedValue({
        id: 'new-assign',
        userId: testUserId,
        departmentId: testDepartmentId,
        isPrimary: false,
        assignedRole: null,
        validFrom: null,
        validUntil: null,
        assignedBy: null,
        assignedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        hospitalId: null,
      });

      // Act
      await service.assignUser(testUserId, testDepartmentId);

      // Assert: Verify that Knex was called with 'users' table
      expect(mockKnex).toHaveBeenCalledWith('users');
      // Verify that the chain methods were called in the right sequence
      expect(mockChain.where).toHaveBeenCalledWith('id', testUserId);
      expect(mockChain.whereNull).toHaveBeenCalledWith('deleted_at');
      expect(mockChain.first).toHaveBeenCalled();
    });

    it('should reject deleted users in assignUser', async () => {
      // Arrange: Simulate deleted user (null result from whereNull check)
      mockKnex.mockImplementation(() => createMockQuery(null));

      // Act & Assert
      await expect(
        service.assignUser(testUserId, testDepartmentId),
      ).rejects.toThrow(AppError);
    });

    it('should reject deleted users in removeUser', async () => {
      // Arrange
      mockKnex.mockImplementation(() => createMockQuery(null));

      // Act & Assert
      await expect(
        service.removeUser(testUserId, testDepartmentId),
      ).rejects.toThrow(AppError);
    });

    it('should reject deleted users in getUserDepartments', async () => {
      // Arrange
      mockKnex.mockImplementation(() => createMockQuery(null));

      // Act & Assert
      await expect(service.getUserDepartments(testUserId)).rejects.toThrow(
        AppError,
      );
    });

    it('should reject deleted users in setPrimaryDepartment', async () => {
      // Arrange
      mockKnex.mockImplementation(() => createMockQuery(null));

      // Act & Assert
      await expect(
        service.setPrimaryDepartment(testUserId, testDepartmentId),
      ).rejects.toThrow(AppError);
    });

    it('should reject deleted users in getUserPrimaryDepartment', async () => {
      // Arrange
      mockKnex.mockImplementation(() => createMockQuery(null));

      // Act & Assert
      await expect(
        service.getUserPrimaryDepartment(testUserId),
      ).rejects.toThrow(AppError);
    });
  });

  // =========================================================================
  // Tests: Verify No UsersRepository Usage
  // =========================================================================

  describe('No UsersRepository Dependency', () => {
    it('should NOT use UsersRepository.findById() in assignUser', async () => {
      // Arrange
      const mockUserExists = { id: testUserId };
      mockKnex.mockImplementation(() => createMockQuery(mockUserExists));
      mockDepartmentsRepository.findById.mockResolvedValue({
        id: testDepartmentId,
        dept_code: 'FIN',
        dept_name: 'Finance',
      });
      mockUserDepartmentsRepository.getAssignment.mockResolvedValue(null);
      mockUserDepartmentsRepository.getActiveDepartments.mockResolvedValue([]);
      mockUserDepartmentsRepository.assignUserToDepartment.mockResolvedValue({
        id: 'new-assign',
        userId: testUserId,
        departmentId: testDepartmentId,
        isPrimary: false,
        assignedRole: null,
        validFrom: null,
        validUntil: null,
        assignedBy: null,
        assignedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        hospitalId: null,
      });

      // Act
      await service.assignUser(testUserId, testDepartmentId);

      // Assert: Service should use Knex directly, not repository
      expect(mockKnex).toHaveBeenCalledWith('users');
    });
  });

  // =========================================================================
  // Tests: Helper Methods
  // =========================================================================

  describe('hasActiveDepartmentAssignment()', () => {
    it('should return true when user has active departments', async () => {
      // Arrange
      const mockDepartments = [
        {
          id: 'assign-1',
          userId: testUserId,
          departmentId: 5,
          isPrimary: true,
          assignedRole: 'manager',
          validFrom: null,
          validUntil: null,
          assignedBy: null,
          assignedAt: new Date(),
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          hospitalId: null,
        },
      ];

      mockUserDepartmentsRepository.getActiveDepartments.mockResolvedValue(
        mockDepartments,
      );

      // Act
      const result = await service.hasActiveDepartmentAssignment(testUserId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when user has no active departments', async () => {
      // Arrange
      mockUserDepartmentsRepository.getActiveDepartments.mockResolvedValue([]);

      // Act
      const result = await service.hasActiveDepartmentAssignment(testUserId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('countUserActiveDepartments()', () => {
    it('should return count of active departments', async () => {
      // Arrange
      mockUserDepartmentsRepository.countActiveDepartments.mockResolvedValue(3);

      // Act
      const result = await service.countUserActiveDepartments(testUserId);

      // Assert
      expect(result).toBe(3);
    });
  });

  describe('countDepartmentActiveUsers()', () => {
    it('should return count of active users in department', async () => {
      // Arrange
      mockUserDepartmentsRepository.countActiveDepartmentUsers.mockResolvedValue(
        8,
      );

      // Act
      const result = await service.countDepartmentActiveUsers(testDepartmentId);

      // Assert
      expect(result).toBe(8);
    });
  });
});
