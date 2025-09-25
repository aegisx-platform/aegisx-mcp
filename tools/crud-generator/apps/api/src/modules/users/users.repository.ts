import { BaseRepository, BaseListQuery, PaginatedListResult } from '../../shared/repositories/base.repository';
import { Knex } from 'knex';
import {
  type CreateUsers,
  type UpdateUsers,
  type Users,
  type GetUsersQuery,
  type ListUsersQuery,
  type UsersEntity
} from './users.types';

export interface UsersListQuery extends BaseListQuery {
  // Add specific filters for Users

  email?: string;
  

  username?: string;
  

  password?: string;
  

  first_name?: string;
  

  last_name?: string;
  
  is_active?: boolean;
  



  avatar_url?: string;
  

  name?: string;
  

  status?: string;
  
  email_verified?: boolean;
  

  two_factor_enabled?: boolean;
  

  two_factor_secret?: string;
  



  bio?: string;
  

  timezone?: string;
  

  language?: string;
  


  phone?: string;
  

  deletion_reason?: string;
  


  deleted_by_ip?: string;
  

  deleted_by_user_agent?: string;
  
}

export class UsersRepository extends BaseRepository<Users, CreateUsers, UpdateUsers> {

  constructor(knex: Knex) {
    super(
      knex,
      'users',
      [
        // Define searchable fields
        '.email',
        '.username',
        '.password',
        '.first_name',
        '.last_name',
        '.avatar_url',
        '.name',
        '.status',
        '.two_factor_secret',
        '.bio',
        '.timezone',
        '.language',
        '.phone',
        '.deletion_reason',
        '.deleted_by_ip',
        '.deleted_by_user_agent'
      ]
    );
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): Users {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      email: dbRow.email,
      username: dbRow.username,
      password: dbRow.password,
      first_name: dbRow.first_name,
      last_name: dbRow.last_name,
      is_active: dbRow.is_active,
      last_login_at: dbRow.last_login_at,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
      avatar_url: dbRow.avatar_url,
      name: dbRow.name,
      status: dbRow.status,
      email_verified: dbRow.email_verified,
      email_verified_at: dbRow.email_verified_at,
      two_factor_enabled: dbRow.two_factor_enabled,
      two_factor_secret: dbRow.two_factor_secret,
      two_factor_backup_codes: dbRow.two_factor_backup_codes,
      deleted_at: dbRow.deleted_at,
      bio: dbRow.bio,
      timezone: dbRow.timezone,
      language: dbRow.language,
      date_of_birth: dbRow.date_of_birth,
      phone: dbRow.phone,
      deletion_reason: dbRow.deletion_reason,
      recovery_deadline: dbRow.recovery_deadline,
      deleted_by_ip: dbRow.deleted_by_ip,
      deleted_by_user_agent: dbRow.deleted_by_user_agent
    };
  }

  // Transform DTO to database format
  transformToDb(dto: CreateUsers | UpdateUsers): Partial<UsersEntity> {
    const transformed: Partial<UsersEntity> = {};

    if ('email' in dto && dto.email !== undefined) {
      transformed.email = dto.email;
    }
    if ('username' in dto && dto.username !== undefined) {
      transformed.username = dto.username;
    }
    if ('password' in dto && dto.password !== undefined) {
      transformed.password = dto.password;
    }
    if ('first_name' in dto && dto.first_name !== undefined) {
      transformed.first_name = dto.first_name;
    }
    if ('last_name' in dto && dto.last_name !== undefined) {
      transformed.last_name = dto.last_name;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    if ('last_login_at' in dto && dto.last_login_at !== undefined) {
      transformed.last_login_at = typeof dto.last_login_at === 'string' ? new Date(dto.last_login_at) : dto.last_login_at;
    }
    if ('avatar_url' in dto && dto.avatar_url !== undefined) {
      transformed.avatar_url = dto.avatar_url;
    }
    if ('name' in dto && dto.name !== undefined) {
      transformed.name = dto.name;
    }
    if ('status' in dto && dto.status !== undefined) {
      transformed.status = dto.status;
    }
    if ('email_verified' in dto && dto.email_verified !== undefined) {
      transformed.email_verified = dto.email_verified;
    }
    if ('email_verified_at' in dto && dto.email_verified_at !== undefined) {
      transformed.email_verified_at = typeof dto.email_verified_at === 'string' ? new Date(dto.email_verified_at) : dto.email_verified_at;
    }
    if ('two_factor_enabled' in dto && dto.two_factor_enabled !== undefined) {
      transformed.two_factor_enabled = dto.two_factor_enabled;
    }
    if ('two_factor_secret' in dto && dto.two_factor_secret !== undefined) {
      transformed.two_factor_secret = dto.two_factor_secret;
    }
    if ('two_factor_backup_codes' in dto && dto.two_factor_backup_codes !== undefined) {
      transformed.two_factor_backup_codes = dto.two_factor_backup_codes;
    }
    if ('deleted_at' in dto && dto.deleted_at !== undefined) {
      transformed.deleted_at = typeof dto.deleted_at === 'string' ? new Date(dto.deleted_at) : dto.deleted_at;
    }
    if ('bio' in dto && dto.bio !== undefined) {
      transformed.bio = dto.bio;
    }
    if ('timezone' in dto && dto.timezone !== undefined) {
      transformed.timezone = dto.timezone;
    }
    if ('language' in dto && dto.language !== undefined) {
      transformed.language = dto.language;
    }
    if ('date_of_birth' in dto && dto.date_of_birth !== undefined) {
      transformed.date_of_birth = typeof dto.date_of_birth === 'string' ? new Date(dto.date_of_birth) : dto.date_of_birth;
    }
    if ('phone' in dto && dto.phone !== undefined) {
      transformed.phone = dto.phone;
    }
    if ('deletion_reason' in dto && dto.deletion_reason !== undefined) {
      transformed.deletion_reason = dto.deletion_reason;
    }
    if ('recovery_deadline' in dto && dto.recovery_deadline !== undefined) {
      transformed.recovery_deadline = typeof dto.recovery_deadline === 'string' ? new Date(dto.recovery_deadline) : dto.recovery_deadline;
    }
    if ('deleted_by_ip' in dto && dto.deleted_by_ip !== undefined) {
      transformed.deleted_by_ip = dto.deleted_by_ip;
    }
    if ('deleted_by_user_agent' in dto && dto.deleted_by_user_agent !== undefined) {
      transformed.deleted_by_user_agent = dto.deleted_by_user_agent;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('users')
      .select('users.*');
      // Add joins here if needed
      // .leftJoin('other_table', 'users.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: UsersListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific Users filters
    if (filters.email !== undefined) {
      query.where('.email', filters.email);
    }
    if (filters.username !== undefined) {
      query.where('.username', filters.username);
    }
    if (filters.password !== undefined) {
      query.where('.password', filters.password);
    }
    if (filters.first_name !== undefined) {
      query.where('.first_name', filters.first_name);
    }
    if (filters.last_name !== undefined) {
      query.where('.last_name', filters.last_name);
    }
    if (filters.is_active !== undefined) {
      query.where('.is_active', filters.is_active);
    }
    if (filters.last_login_at !== undefined) {
      query.where('.last_login_at', filters.last_login_at);
    }
    if (filters.updated_at !== undefined) {
      query.where('.updated_at', filters.updated_at);
    }
    if (filters.avatar_url !== undefined) {
      query.where('.avatar_url', filters.avatar_url);
    }
    if (filters.name !== undefined) {
      query.where('.name', filters.name);
    }
    if (filters.status !== undefined) {
      query.where('.status', filters.status);
    }
    if (filters.email_verified !== undefined) {
      query.where('.email_verified', filters.email_verified);
    }
    if (filters.email_verified_at !== undefined) {
      query.where('.email_verified_at', filters.email_verified_at);
    }
    if (filters.two_factor_enabled !== undefined) {
      query.where('.two_factor_enabled', filters.two_factor_enabled);
    }
    if (filters.two_factor_secret !== undefined) {
      query.where('.two_factor_secret', filters.two_factor_secret);
    }
    if (filters.two_factor_backup_codes !== undefined) {
      query.where('.two_factor_backup_codes', filters.two_factor_backup_codes);
    }
    if (filters.deleted_at !== undefined) {
      query.where('.deleted_at', filters.deleted_at);
    }
    if (filters.bio !== undefined) {
      query.where('.bio', filters.bio);
    }
    if (filters.timezone !== undefined) {
      query.where('.timezone', filters.timezone);
    }
    if (filters.language !== undefined) {
      query.where('.language', filters.language);
    }
    if (filters.date_of_birth !== undefined) {
      query.where('.date_of_birth', filters.date_of_birth);
    }
    if (filters.phone !== undefined) {
      query.where('.phone', filters.phone);
    }
    if (filters.deletion_reason !== undefined) {
      query.where('.deletion_reason', filters.deletion_reason);
    }
    if (filters.recovery_deadline !== undefined) {
      query.where('.recovery_deadline', filters.recovery_deadline);
    }
    if (filters.deleted_by_ip !== undefined) {
      query.where('.deleted_by_ip', filters.deleted_by_ip);
    }
    if (filters.deleted_by_user_agent !== undefined) {
      query.where('.deleted_by_user_agent', filters.deleted_by_user_agent);
    }
  }

  // Custom sort fields mapping
  protected getSortField(sortBy: string): string {
    const sortFields: Record<string, string> = {
      id: '.id',
      email: '.email',
      username: '.username',
      password: '.password',
      firstName: '.first_name',
      lastName: '.last_name',
      isActive: '.is_active',
      lastLoginAt: '.last_login_at',
      createdAt: '.created_at',
      updatedAt: '.updated_at',
      avatarUrl: '.avatar_url',
      name: '.name',
      status: '.status',
      emailVerified: '.email_verified',
      emailVerifiedAt: '.email_verified_at',
      twoFactorEnabled: '.two_factor_enabled',
      twoFactorSecret: '.two_factor_secret',
      twoFactorBackupCodes: '.two_factor_backup_codes',
      deletedAt: '.deleted_at',
      bio: '.bio',
      timezone: '.timezone',
      language: '.language',
      dateOfBirth: '.date_of_birth',
      phone: '.phone',
      deletionReason: '.deletion_reason',
      recoveryDeadline: '.recovery_deadline',
      deletedByIp: '.deleted_by_ip',
      deletedByUserAgent: '.deleted_by_user_agent'
    };

    return sortFields[sortBy] || 'users.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetUsersQuery = {}
  ): Promise<Users | null> {
    let query = this.getJoinQuery();
    query = query.where('users.id', id);

    // Handle include options
    if (options.include) {
      const includes = Array.isArray(options.include) ? options.include : [options.include];
      includes.forEach(relation => {
        // TODO: Add join logic for relationships
        // Example: if (relation === 'category') query.leftJoin('categories', 'items.category_id', 'categories.id');
      });
    }

    const row = await query.first();
    return row ? this.transformToEntity(row) : null;
  }

  // Extended list method with specific query type
  async list(query: UsersListQuery = {}): Promise<PaginatedListResult<Users>> {
    return super.list(query);
  }

  // Additional business-specific methods
  
  async findByEmail(email: string): Promise<Users | null> {
    const query = this.getJoinQuery();
    const row = await query.where('users.email', email).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByUsername(username: string): Promise<Users | null> {
    const query = this.getJoinQuery();
    const row = await query.where('users.username', username).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByPassword(password: string): Promise<Users | null> {
    const query = this.getJoinQuery();
    const row = await query.where('users.password', password).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByFirstName(firstName: string): Promise<Users | null> {
    const query = this.getJoinQuery();
    const row = await query.where('users.first_name', firstName).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByLastName(lastName: string): Promise<Users | null> {
    const query = this.getJoinQuery();
    const row = await query.where('users.last_name', lastName).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByAvatarUrl(avatarUrl: string): Promise<Users | null> {
    const query = this.getJoinQuery();
    const row = await query.where('users.avatar_url', avatarUrl).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByName(name: string): Promise<Users | null> {
    const query = this.getJoinQuery();
    const row = await query.where('users.name', name).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByStatus(status: string): Promise<Users | null> {
    const query = this.getJoinQuery();
    const row = await query.where('users.status', status).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByTwoFactorSecret(twoFactorSecret: string): Promise<Users | null> {
    const query = this.getJoinQuery();
    const row = await query.where('users.two_factor_secret', twoFactorSecret).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByBio(bio: string): Promise<Users | null> {
    const query = this.getJoinQuery();
    const row = await query.where('users.bio', bio).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByTimezone(timezone: string): Promise<Users | null> {
    const query = this.getJoinQuery();
    const row = await query.where('users.timezone', timezone).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByLanguage(language: string): Promise<Users | null> {
    const query = this.getJoinQuery();
    const row = await query.where('users.language', language).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByPhone(phone: string): Promise<Users | null> {
    const query = this.getJoinQuery();
    const row = await query.where('users.phone', phone).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByDeletionReason(deletionReason: string): Promise<Users | null> {
    const query = this.getJoinQuery();
    const row = await query.where('users.deletion_reason', deletionReason).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByDeletedByIp(deletedByIp: string): Promise<Users | null> {
    const query = this.getJoinQuery();
    const row = await query.where('users.deleted_by_ip', deletedByIp).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByDeletedByUserAgent(deletedByUserAgent: string): Promise<Users | null> {
    const query = this.getJoinQuery();
    const row = await query.where('users.deleted_by_user_agent', deletedByUserAgent).first();
    return row ? this.transformToEntity(row) : null;
  }


  // Statistics and aggregation methods
  async getStats(): Promise<{
    total: number;
    isActiveCount: number;
    emailVerifiedCount: number;
    twoFactorEnabledCount: number;
  }> {
    const stats: any = await this.knex('users')
      .select([
        this.knex.raw('COUNT(*) as total'),
        this.knex.raw('COUNT(*) FILTER (WHERE is_active = true) as isActive_count'),
        this.knex.raw('COUNT(*) FILTER (WHERE email_verified = true) as emailVerified_count'),
        this.knex.raw('COUNT(*) FILTER (WHERE two_factor_enabled = true) as twoFactorEnabled_count')
      ])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
      isActiveCount: parseInt(stats?.isActive_count || '0'),
      emailVerifiedCount: parseInt(stats?.emailVerified_count || '0'),
      twoFactorEnabledCount: parseInt(stats?.twoFactorEnabled_count || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateUsers[]): Promise<Users[]> {
    const transformedData = data.map(item => this.transformToDb(item));
    const rows = await this.knex('users').insert(transformedData).returning('*');
    return rows.map(row => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateUsers): Promise<Users> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('users').insert(transformedData).returning('*');
      return this.transformToEntity(row);
    });
  }
}