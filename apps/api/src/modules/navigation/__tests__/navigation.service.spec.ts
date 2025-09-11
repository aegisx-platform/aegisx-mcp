import { NavigationService } from '../services/navigation.service';
import { NavigationRepository } from '../navigation.repository';
import { NavigationItemWithChildren } from '../navigation.types';

// Mock FastifyInstance
const mockFastify = {
  knex: {},
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  },
  log: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
};

// Mock NavigationRepository
jest.mock('../navigation.repository');

const mockNavigationRepository = {
  getNavigationItems: jest.fn(),
  getUserNavigationItems: jest.fn(),
  getNavigationItemByKey: jest.fn(),
  filterByType: jest.fn(),
};

// Mock navigation data
const mockNavigationItems: NavigationItemWithChildren[] = [
  {
    id: '1',
    parent_id: null,
    key: 'dashboard',
    title: 'Dashboard',
    type: 'item',
    icon: 'heroicons_outline:chart-pie',
    link: '/dashboard',
    target: '_self',
    sort_order: 1,
    disabled: false,
    hidden: false,
    exact_match: false,
    badge_title: 'New',
    badge_variant: 'primary',
    show_in_default: true,
    show_in_compact: true,
    show_in_horizontal: true,
    show_in_mobile: true,
    meta: null,
    created_at: new Date(),
    updated_at: new Date(),
    children: [],
    permissions: ['dashboard.view'],
  },
  {
    id: '2',
    parent_id: null,
    key: 'users',
    title: 'User Management',
    type: 'collapsible',
    icon: 'heroicons_outline:users',
    link: null,
    target: '_self',
    sort_order: 2,
    disabled: false,
    hidden: false,
    exact_match: false,
    badge_title: null,
    badge_variant: null,
    show_in_default: true,
    show_in_compact: false,
    show_in_horizontal: false,
    show_in_mobile: true,
    meta: null,
    created_at: new Date(),
    updated_at: new Date(),
    children: [
      {
        id: '3',
        parent_id: '2',
        key: 'users-list',
        title: 'Users List',
        type: 'item',
        icon: 'heroicons_outline:user-group',
        link: '/users',
        target: '_self',
        sort_order: 1,
        disabled: false,
        hidden: false,
        exact_match: false,
        badge_title: null,
        badge_variant: null,
        show_in_default: true,
        show_in_compact: false,
        show_in_horizontal: false,
        show_in_mobile: true,
        meta: null,
        created_at: new Date(),
        updated_at: new Date(),
        children: [],
        permissions: ['users.read'],
      },
    ],
    permissions: ['users.read'],
  },
];

describe('NavigationService', () => {
  let service: NavigationService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the NavigationRepository constructor
    (
      NavigationRepository as jest.MockedClass<typeof NavigationRepository>
    ).mockImplementation(() => mockNavigationRepository as any);

    service = new NavigationService(mockFastify as any);
    service['navigationRepository'] = mockNavigationRepository as any;
  });

  describe('getNavigation', () => {
    it('should return complete navigation structure', async () => {
      mockNavigationRepository.getNavigationItems.mockResolvedValue(
        mockNavigationItems,
      );
      mockNavigationRepository.filterByType.mockImplementation(
        (items, type) => {
          return items.filter(
            (item) =>
              item[`show_in_${type}` as keyof NavigationItemWithChildren] ===
              true,
          );
        },
      );

      const result = await service.getNavigation();

      expect(mockNavigationRepository.getNavigationItems).toHaveBeenCalledWith(
        false,
      );
      expect(result).toBeDefined();
      expect(result.default).toBeDefined();
      expect(result.compact).toBeDefined();
      expect(result.horizontal).toBeDefined();
      expect(result.mobile).toBeDefined();
    });

    it('should return specific navigation type when requested', async () => {
      mockNavigationRepository.getNavigationItems.mockResolvedValue(
        mockNavigationItems,
      );
      mockNavigationRepository.filterByType.mockReturnValue([
        mockNavigationItems[0],
      ]);

      const result = await service.getNavigation({ type: 'compact' });

      expect(mockNavigationRepository.filterByType).toHaveBeenCalledWith(
        mockNavigationItems,
        'compact',
      );
      expect(result.compact).toBeDefined();
      expect(result.default).toBeUndefined();
    });

    it('should include disabled items when requested', async () => {
      mockNavigationRepository.getNavigationItems.mockResolvedValue(
        mockNavigationItems,
      );

      await service.getNavigation({ includeDisabled: true });

      expect(mockNavigationRepository.getNavigationItems).toHaveBeenCalledWith(
        true,
      );
    });

    it('should use cache when available', async () => {
      const cachedData = { default: [] };
      mockFastify.redis.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await service.getNavigation();

      expect(mockFastify.redis.get).toHaveBeenCalled();
      expect(
        mockNavigationRepository.getNavigationItems,
      ).not.toHaveBeenCalled();
      expect(result).toEqual(cachedData);
    });

    it('should cache results after database fetch', async () => {
      mockFastify.redis.get.mockResolvedValue(null); // No cache
      mockNavigationRepository.getNavigationItems.mockResolvedValue(
        mockNavigationItems,
      );
      mockNavigationRepository.filterByType.mockImplementation(
        (items, type) => {
          return items.filter(
            (item) =>
              item[`show_in_${type}` as keyof NavigationItemWithChildren] ===
              true,
          );
        },
      );

      await service.getNavigation();

      expect(mockFastify.redis.setex).toHaveBeenCalled();
    });
  });

  describe('getUserNavigation', () => {
    it('should return user-specific navigation', async () => {
      mockNavigationRepository.getUserNavigationItems.mockResolvedValue(
        mockNavigationItems,
      );
      mockNavigationRepository.filterByType.mockImplementation(
        (items, type) => {
          return items.filter(
            (item) =>
              item[`show_in_${type}` as keyof NavigationItemWithChildren] ===
              true,
          );
        },
      );

      const result = await service.getUserNavigation('user-1');

      expect(
        mockNavigationRepository.getUserNavigationItems,
      ).toHaveBeenCalledWith('user-1', undefined, false);
      expect(result).toBeDefined();
    });

    it('should filter by navigation type for users', async () => {
      mockNavigationRepository.getUserNavigationItems.mockResolvedValue(
        mockNavigationItems,
      );
      mockNavigationRepository.filterByType.mockReturnValue([
        mockNavigationItems[0],
      ]);

      const result = await service.getUserNavigation('user-1', {
        type: 'mobile',
      });

      expect(
        mockNavigationRepository.getUserNavigationItems,
      ).toHaveBeenCalledWith('user-1', 'mobile', false);
    });

    it('should use shorter cache TTL for user-specific navigation', async () => {
      mockFastify.redis.get.mockResolvedValue(null);
      mockNavigationRepository.getUserNavigationItems.mockResolvedValue(
        mockNavigationItems,
      );
      mockNavigationRepository.filterByType.mockImplementation(
        (items, type) => {
          return items.filter(
            (item) =>
              item[`show_in_${type}` as keyof NavigationItemWithChildren] ===
              true,
          );
        },
      );

      await service.getUserNavigation('user-1');

      expect(mockFastify.redis.setex).toHaveBeenCalledWith(
        expect.stringContaining('navigation:user:user-1'),
        150, // Half of default TTL (300)
        expect.any(String),
      );
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate all navigation cache', async () => {
      mockFastify.redis.keys.mockResolvedValue([
        'navigation:default:false',
        'navigation:compact:true',
      ]);

      await service.invalidateCache();

      expect(mockFastify.redis.keys).toHaveBeenCalledWith('navigation:*');
      expect(mockFastify.redis.del).toHaveBeenCalledWith(
        'navigation:default:false',
        'navigation:compact:true',
      );
    });

    it('should invalidate user-specific cache', async () => {
      mockFastify.redis.keys.mockResolvedValue([
        'navigation:user:user-1:default',
      ]);

      await service.invalidateCache('user-1');

      expect(mockFastify.redis.keys).toHaveBeenCalledWith(
        'navigation:user:user-1:*',
      );
      expect(mockFastify.redis.del).toHaveBeenCalledWith(
        'navigation:user:user-1:default',
      );
    });
  });

  describe('getNavigationItemByKey', () => {
    it('should return navigation item by key', async () => {
      const mockItem = mockNavigationItems[0];
      mockNavigationRepository.getNavigationItemByKey.mockResolvedValue(
        mockItem,
      );

      const result = await service.getNavigationItemByKey('dashboard');

      expect(
        mockNavigationRepository.getNavigationItemByKey,
      ).toHaveBeenCalledWith('dashboard');
      expect(result).toBeDefined();
      expect(result?.id).toBe('dashboard'); // Transformed to use key as public ID
    });

    it('should return null if item not found', async () => {
      mockNavigationRepository.getNavigationItemByKey.mockResolvedValue(null);

      const result = await service.getNavigationItemByKey('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('transformNavigationItem', () => {
    it('should transform database entity to API format', async () => {
      mockNavigationRepository.getNavigationItems.mockResolvedValue([
        mockNavigationItems[0],
      ]);
      mockNavigationRepository.filterByType.mockReturnValue([
        mockNavigationItems[0],
      ]);

      const result = await service.getNavigation({ type: 'default' });

      const item = result.default?.[0];
      expect(item.id).toBe('dashboard'); // Uses key as public ID
      expect(item.title).toBe('Dashboard');
      expect(item.type).toBe('item');
      expect(item.icon).toBe('heroicons_outline:chart-pie');
      expect(item.link).toBe('/dashboard');
      expect(item.badge).toEqual({
        title: 'New',
        variant: 'primary',
      });
      expect(item.permissions).toEqual(['dashboard.view']);
    });

    it('should handle items with children', async () => {
      mockNavigationRepository.getNavigationItems.mockResolvedValue([
        mockNavigationItems[1],
      ]);
      mockNavigationRepository.filterByType.mockReturnValue([
        mockNavigationItems[1],
      ]);

      const result = await service.getNavigation({ type: 'default' });

      const item = result.default?.[0];
      expect(item.children).toBeDefined();
      expect(item.children?.length).toBe(1);
      expect(item.children?.[0]?.id).toBe('users-list');
    });

    it('should exclude optional fields when not present', async () => {
      const itemWithoutOptionalFields = {
        ...mockNavigationItems[0],
        icon: null,
        badge_title: null,
        permissions: [],
      };

      mockNavigationRepository.getNavigationItems.mockResolvedValue([
        itemWithoutOptionalFields,
      ]);
      mockNavigationRepository.filterByType.mockReturnValue([
        itemWithoutOptionalFields,
      ]);

      const result = await service.getNavigation({ type: 'default' });

      const item = result.default?.[0];
      expect(item.icon).toBeUndefined();
      expect(item.badge).toBeUndefined();
      expect(item.permissions).toBeUndefined();
    });
  });

  describe('caching fallback', () => {
    beforeEach(() => {
      // Remove Redis mock to test in-memory fallback
      mockFastify.redis = undefined as any;
      service = new NavigationService(mockFastify as any);
      service['navigationRepository'] = mockNavigationRepository as any;
    });

    it('should use in-memory cache when Redis is unavailable', async () => {
      mockNavigationRepository.getNavigationItems.mockResolvedValue(
        mockNavigationItems,
      );
      mockNavigationRepository.filterByType.mockImplementation(
        (items, type) => {
          return items.filter(
            (item) =>
              item[`show_in_${type}` as keyof NavigationItemWithChildren] ===
              true,
          );
        },
      );

      // First call should fetch from database
      await service.getNavigation({ type: 'default' });
      expect(mockNavigationRepository.getNavigationItems).toHaveBeenCalledTimes(
        1,
      );

      // Second call should use in-memory cache
      await service.getNavigation({ type: 'default' });
      expect(mockNavigationRepository.getNavigationItems).toHaveBeenCalledTimes(
        1,
      ); // Still 1, not 2
    });
  });

  describe('error handling', () => {
    it('should handle cache errors gracefully', async () => {
      mockFastify.redis = {
        get: jest.fn().mockRejectedValue(new Error('Redis error')),
        setex: jest.fn(),
        del: jest.fn(),
        keys: jest.fn(),
      };

      service = new NavigationService(mockFastify as any);
      service['navigationRepository'] = mockNavigationRepository as any;

      mockNavigationRepository.getNavigationItems.mockResolvedValue(
        mockNavigationItems,
      );
      mockNavigationRepository.filterByType.mockImplementation(
        (items, type) => {
          return items.filter(
            (item) =>
              item[`show_in_${type}` as keyof NavigationItemWithChildren] ===
              true,
          );
        },
      );

      const result = await service.getNavigation();

      expect(mockFastify.log.warn).toHaveBeenCalledWith(
        'Failed to get cached data for key navigation:all:false: Error: Redis error',
      );
      expect(result).toBeDefined();
    });
  });
});
