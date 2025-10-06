-- Comprehensive Test Table with All PostgreSQL Data Types
-- This tests the CRUD generator's full capability

-- Drop table if exists (for regeneration)
DROP TABLE IF EXISTS comprehensive_tests CASCADE;

-- Create comprehensive test table
CREATE TABLE comprehensive_tests (
  -- Primary Key (UUID)
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Text & String Types
  title VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(100) UNIQUE,
  short_code CHAR(10),
  
  -- Numeric Types
  price DECIMAL(10,2),
  quantity INTEGER DEFAULT 0,
  weight FLOAT,
  rating DOUBLE PRECISION,
  
  -- Boolean Types
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  
  -- Date & Time Types
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  expires_at DATE,
  start_time TIME,
  
  -- JSON & Advanced Types
  metadata JSONB,
  tags TEXT[],
  coordinates POINT,
  
  -- Network & Special Types
  ip_address INET,
  mac_address MACADDR,
  website_url VARCHAR(500),
  email_address VARCHAR(255),
  
  -- Foreign Key Relationships
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Enum-like fields (using constraints)
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Large text fields
  content TEXT,
  notes TEXT,
  
  -- Additional constraints
  CONSTRAINT valid_price CHECK (price >= 0),
  CONSTRAINT valid_quantity CHECK (quantity >= 0),
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5)
);

-- Create indexes for performance
CREATE INDEX idx_comprehensive_tests_title ON comprehensive_tests(title);
CREATE INDEX idx_comprehensive_tests_slug ON comprehensive_tests(slug);
CREATE INDEX idx_comprehensive_tests_status ON comprehensive_tests(status);
CREATE INDEX idx_comprehensive_tests_category_id ON comprehensive_tests(category_id);
CREATE INDEX idx_comprehensive_tests_author_id ON comprehensive_tests(author_id);
CREATE INDEX idx_comprehensive_tests_is_active ON comprehensive_tests(is_active);
CREATE INDEX idx_comprehensive_tests_created_at ON comprehensive_tests(created_at);
CREATE INDEX idx_comprehensive_tests_metadata ON comprehensive_tests USING GIN(metadata);

-- Add some sample data
INSERT INTO comprehensive_tests (
  title, description, slug, short_code, price, quantity, weight, rating,
  is_active, is_featured, is_available, published_at, expires_at, start_time,
  metadata, tags, ip_address, website_url, email_address, status, priority, content, notes
) VALUES 
(
  'Test Product 1', 
  'A comprehensive test product with all data types',
  'test-product-1',
  'TEST001',
  99.99,
  10,
  1.5,
  4.5,
  true,
  true,
  true,
  '2024-01-01 10:00:00',
  '2024-12-31',
  '09:00:00',
  '{"color": "red", "size": "large", "features": ["waterproof", "durable"]}',
  ARRAY['electronics', 'gadgets', 'premium'],
  '192.168.1.1',
  'https://example.com/product1',
  'product1@example.com',
  'published',
  'high',
  'This is the detailed content for test product 1. It includes comprehensive information about the product features, specifications, and usage instructions.',
  'Internal notes: This product requires special handling during shipping.'
),
(
  'Test Product 2',
  'Another test product with different values',
  'test-product-2', 
  'TEST002',
  149.50,
  5,
  2.8,
  3.8,
  true,
  false,
  true,
  '2024-02-01 14:30:00',
  '2024-11-30',
  '14:30:00',
  '{"color": "blue", "size": "medium", "warranty": "2 years"}',
  ARRAY['tools', 'hardware', 'professional'],
  '10.0.0.1',
  'https://example.com/product2',
  'product2@example.com',
  'draft',
  'medium',
  'Detailed specifications and user manual for test product 2.',
  'Note: Requires assembly upon delivery.'
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_comprehensive_tests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comprehensive_tests_updated_at
  BEFORE UPDATE ON comprehensive_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_comprehensive_tests_updated_at();
EOF < /dev/null