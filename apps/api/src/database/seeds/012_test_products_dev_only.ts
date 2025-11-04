import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 🛡️ PRODUCTION SAFETY: Skip in production
  const isDevelopment =
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

  if (!isDevelopment) {
    console.log('⏭️  [PROD] Skipping test_products seed');
    return;
  }

  // ⚠️ SKIP: test_products table schema mismatch in seed data
  // The seed data references columns that don't exist in the actual table
  // This seed is skipped until the test_products table schema is verified
  console.log('⏭️  [DEV] test_products seed skipped due to schema mismatch');
  return;

  // Get category IDs
  const electronics = await knex('test_categories')
    .where({ code: 'ELEC' })
    .first();
  const books = await knex('test_categories').where({ code: 'BOOK' }).first();
  const furniture = await knex('test_categories')
    .where({ code: 'FURN' })
    .first();

  if (!electronics || !books || !furniture) {
    console.log('⚠️  [DEV] Categories not found, skipping product seed');
    return;
  }

  // Clear existing data
  await knex('test_products').del();

  // Insert test products
  const products = await knex('test_products').insert(
    [
      // Electronics
      {
        sku: 'LAPTOP-MB16-001',
        name: 'MacBook Pro 16"',
        barcode: '1234567890123',
        manufacturer: 'Apple',
        description: 'Powerful laptop for professionals',
        long_description:
          'The MacBook Pro 16-inch delivers exceptional performance...',
        specifications: 'M3 Pro chip, 32GB RAM, 1TB SSD',
        quantity: 10,
        min_quantity: 2,
        max_quantity: 50,
        price: 2499.99,
        cost: 2000.0,
        weight: 2.14,
        discount_percentage: 5.0,
        is_active: true,
        is_featured: true,
        is_taxable: true,
        is_shippable: true,
        status: 'active',
        condition: 'new',
        availability: 'in_stock',
        launch_date: '2024-01-15',
        category_id: electronics.id,
        attributes: JSON.stringify({
          color: 'Space Gray',
          ram: '32GB',
          storage: '1TB',
          screen_size: '16"',
          processor: 'M3 Pro',
        }),
        tags: JSON.stringify(['laptop', 'featured', 'premium', 'apple']),
        images: JSON.stringify([
          {
            url: '/images/macbook-1.jpg',
            alt: 'MacBook Pro front view',
            order: 1,
          },
          {
            url: '/images/macbook-2.jpg',
            alt: 'MacBook Pro side view',
            order: 2,
          },
        ]),
        pricing_tiers: JSON.stringify([
          { min_qty: 1, max_qty: 4, price: 2499.99 },
          { min_qty: 5, max_qty: 9, price: 2399.99 },
          { min_qty: 10, max_qty: null, price: 2299.99 },
        ]),
        dimensions: JSON.stringify({
          width: 35.79,
          height: 1.62,
          depth: 24.59,
          unit: 'cm',
        }),
        seo_metadata: JSON.stringify({
          title: 'MacBook Pro 16" - Ultimate Professional Laptop',
          description: 'Buy MacBook Pro 16" with M3 Pro chip...',
          keywords: ['macbook', 'laptop', 'apple', 'professional'],
        }),
      },

      // Book
      {
        sku: 'BOOK-PROG-001',
        name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        barcode: '9780132350884',
        manufacturer: 'Prentice Hall',
        description: 'Essential reading for software developers',
        quantity: 25,
        min_quantity: 5,
        price: 39.99,
        cost: 25.0,
        weight: 0.68,
        is_active: true,
        is_featured: true,
        is_taxable: false,
        is_shippable: true,
        status: 'active',
        condition: 'new',
        availability: 'in_stock',
        launch_date: '2008-08-01',
        category_id: books.id,
        attributes: JSON.stringify({
          author: 'Robert C. Martin',
          pages: 464,
          language: 'English',
          isbn: '9780132350884',
        }),
        tags: JSON.stringify([
          'programming',
          'bestseller',
          'software-engineering',
        ]),
        dimensions: JSON.stringify({
          width: 17.8,
          height: 2.5,
          depth: 23.1,
          unit: 'cm',
        }),
      },

      // Furniture
      {
        sku: 'DESK-ERGO-001',
        name: 'Ergonomic Standing Desk',
        manufacturer: 'ErgoDesk Inc.',
        description: 'Adjustable height standing desk',
        quantity: 5,
        min_quantity: 1,
        max_quantity: 20,
        price: 599.0,
        cost: 400.0,
        weight: 35.5,
        discount_percentage: 10.0,
        is_active: true,
        is_featured: false,
        is_taxable: true,
        is_shippable: true,
        status: 'active',
        condition: 'new',
        availability: 'in_stock',
        category_id: furniture.id,
        attributes: JSON.stringify({
          material: 'Bamboo',
          color: 'Natural Wood',
          adjustable: true,
          motor: 'Dual Motor',
        }),
        tags: JSON.stringify(['furniture', 'desk', 'ergonomic', 'standing']),
        dimensions: JSON.stringify({
          width: 140,
          height_min: 70,
          height_max: 120,
          depth: 70,
          unit: 'cm',
        }),
      },
    ],
    ['id'],
  );

  console.log('✅ [DEV] Seeded test_products with 3 records');

  // Create a variant product (self-referencing FK test)
  await knex('test_products').insert({
    sku: 'LAPTOP-MB16-002',
    name: 'MacBook Pro 16" (Silver)',
    manufacturer: 'Apple',
    description: 'Silver variant of MacBook Pro',
    quantity: 8,
    price: 2499.99,
    cost: 2000.0,
    weight: 2.14,
    is_active: true,
    status: 'active',
    condition: 'new',
    availability: 'in_stock',
    category_id: electronics.id,
    parent_product_id: products[0].id, // ✅ Self-referencing FK
    attributes: JSON.stringify({
      color: 'Silver',
      ram: '32GB',
      storage: '1TB',
    }),
    tags: JSON.stringify(['laptop', 'apple', 'variant']),
  });

  console.log('✅ [DEV] Created product variant with self-referencing FK');
}
