-- Simple Comprehensive Test Table
DROP TABLE IF EXISTS comprehensive_tests CASCADE;

CREATE TABLE comprehensive_tests (
  -- Primary Key
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
  
  -- Network Types
  ip_address INET,
  website_url VARCHAR(500),
  email_address VARCHAR(255),
  
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

-- Create indexes
CREATE INDEX idx_comprehensive_tests_title ON comprehensive_tests(title);
CREATE INDEX idx_comprehensive_tests_slug ON comprehensive_tests(slug);
CREATE INDEX idx_comprehensive_tests_status ON comprehensive_tests(status);
CREATE INDEX idx_comprehensive_tests_is_active ON comprehensive_tests(is_active);
CREATE INDEX idx_comprehensive_tests_created_at ON comprehensive_tests(created_at);
CREATE INDEX idx_comprehensive_tests_metadata ON comprehensive_tests USING GIN(metadata);

-- Add sample data
INSERT INTO comprehensive_tests (
  title, description, slug, short_code, price, quantity, weight, rating,
  is_active, is_featured, is_available, published_at, expires_at, start_time,
  metadata, tags, ip_address, website_url, email_address, status, priority, content, notes
) VALUES 
(
  'Full Test Product', 
  'A comprehensive test product showcasing all PostgreSQL data types',
  'full-test-product',
  'FTP001',
  199.99,
  25,
  2.5,
  4.8,
  true,
  true,
  true,
  '2024-01-15 10:30:00',
  '2024-12-31',
  '10:30:00',
  '{"category": "electronics", "brand": "TechCorp", "warranty": "2 years", "features": ["waterproof", "wireless", "fast-charge"]}',
  ARRAY['tech', 'premium', 'bestseller', 'new-arrival'],
  '192.168.1.100',
  'https://techcorp.com/full-test-product',
  'sales@techcorp.com',
  'published',
  'high',
  'This is a comprehensive test product designed to showcase all PostgreSQL data types supported by our CRUD generator. It includes various field types from simple strings to complex JSON objects, arrays, and network addresses.',
  'Special handling required: Fragile electronics. Ship with protective packaging.'
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