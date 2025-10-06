-- Test table สำหรับทดสอบ PostgreSQL data types ทั้งหมด
CREATE TABLE IF NOT EXISTS test_types (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- String/Text Types
  title VARCHAR(255) NOT NULL,
  description TEXT,
  short_code CHAR(10),
  case_insensitive_text CITEXT,
  
  -- Numeric Types
  small_number SMALLINT,
  regular_number INTEGER,
  big_number BIGINT,
  decimal_price DECIMAL(10,2),
  float_value REAL,
  double_value DOUBLE PRECISION,
  money_amount MONEY,
  auto_increment SERIAL,
  big_auto_increment BIGSERIAL,
  
  -- Boolean
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN,
  
  -- Date/Time Types
  birth_date DATE,
  created_timestamp TIMESTAMP,
  updated_timestamptz TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  daily_time TIME,
  daily_time_tz TIMETZ,
  duration_interval INTERVAL,
  
  -- JSON Types
  metadata JSON,
  settings JSONB,
  xml_content XML,
  
  -- Binary Types
  file_data BYTEA,
  bit_flags BIT(8),
  variable_bits VARBIT(16),
  
  -- Network Types
  ip_address INET,
  network_cidr CIDR,
  mac_address MACADDR,
  mac8_address MACADDR8,
  
  -- Geometric Types
  location_point POINT,
  boundary_line LINE,
  line_segment LSEG,
  rectangle_box BOX,
  route_path PATH,
  area_polygon POLYGON,
  coverage_circle CIRCLE,
  
  -- Array Types
  tags TEXT[],
  scores INTEGER[],
  
  -- Special Types
  search_vector TSVECTOR,
  search_query TSQUERY,
  
  -- Foreign Key สำหรับทดสอบ dropdown
  category_id UUID REFERENCES categories(id),
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table for FK testing
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample categories
INSERT INTO categories (name, description) VALUES 
('Electronics', 'Electronic devices and gadgets'),
('Books', 'Books and publications'),
('Clothing', 'Clothing and accessories'),
('Home & Garden', 'Home and garden items')
ON CONFLICT DO NOTHING;

-- Insert sample test data
INSERT INTO test_types (
  title, 
  description, 
  short_code,
  case_insensitive_text,
  small_number,
  regular_number,
  big_number,
  decimal_price,
  float_value,
  double_value,
  money_amount,
  is_active,
  is_verified,
  birth_date,
  created_timestamp,
  daily_time,
  metadata,
  settings,
  ip_address,
  network_cidr,
  mac_address,
  location_point,
  tags,
  scores,
  category_id
) VALUES (
  'Test Product',
  'This is a comprehensive test of all PostgreSQL data types',
  'TEST001',
  'Case Insensitive Text',
  100,
  50000,
  9223372036854775807,
  99.99,
  3.14159,
  2.718281828459045,
  '$1,234.56',
  true,
  false,
  '1990-01-15',
  '2024-01-01 12:00:00',
  '14:30:00',
  '{"type": "test", "version": 1, "features": ["json", "validation"]}',
  '{"theme": "dark", "language": "en", "notifications": true}',
  '192.168.1.100',
  '192.168.0.0/24',
  '08:00:2b:01:02:03',
  '(10.5, 20.3)',
  ARRAY['electronics', 'gadget', 'test'],
  ARRAY[1, 2, 3, 4, 5],
  (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE test_types IS 'Comprehensive test table for all PostgreSQL data types supported by CRUD generator';