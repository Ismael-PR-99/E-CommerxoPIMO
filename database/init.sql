-- Crear extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categorías
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Productos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id UUID REFERENCES categories(id),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER NOT NULL DEFAULT 10,
    sku VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventario
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL, -- entrada/salida
    reason VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Órdenes
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    status VARCHAR(20) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Items de Órdenes
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Predicciones de Stock
CREATE TABLE stock_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    predicted_demand INTEGER NOT NULL,
    confidence_level DECIMAL(5,2) NOT NULL,
    prediction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_stock_predictions_product ON stock_predictions(product_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar stock
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'entrada' THEN
        UPDATE products 
        SET stock_quantity = stock_quantity + NEW.quantity
        WHERE id = NEW.product_id;
    ELSIF NEW.type = 'salida' THEN
        UPDATE products 
        SET stock_quantity = stock_quantity - NEW.quantity
        WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stock_on_inventory_change
    AFTER INSERT ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock();

-- Insertar datos de prueba en categorías
INSERT INTO categories (id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Electrónicos', 'Dispositivos electrónicos y gadgets'),
('550e8400-e29b-41d4-a716-446655440002', 'Computadoras', 'Laptops, computadoras de escritorio y accesorios'),
('550e8400-e29b-41d4-a716-446655440003', 'Smartphones', 'Teléfonos inteligentes y accesorios'),
('550e8400-e29b-41d4-a716-446655440004', 'Hogar', 'Artículos para el hogar y electrodomésticos'),
('550e8400-e29b-41d4-a716-446655440005', 'Deportes', 'Equipos y artículos deportivos');

-- Insertar productos de prueba
INSERT INTO products (id, name, description, price, stock_quantity, min_stock_level, category_id, sku, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Laptop Dell XPS 13', 'Laptop ultradelgada con procesador Intel Core i7', 999.99, 15, 5, '550e8400-e29b-41d4-a716-446655440002', 'DELL-XPS13-001', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'iPhone 15 Pro', 'Smartphone Apple con chip A17 Pro', 1099.99, 25, 10, '550e8400-e29b-41d4-a716-446655440003', 'APPLE-IP15P-001', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'Samsung Galaxy S24', 'Smartphone Android con cámara de 200MP', 899.99, 20, 8, '550e8400-e29b-41d4-a716-446655440003', 'SAMSUNG-GS24-001', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004', 'MacBook Air M3', 'Laptop Apple con chip M3 y pantalla Retina', 1199.99, 12, 6, '550e8400-e29b-41d4-a716-446655440002', 'APPLE-MBA-M3-001', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440005', 'Monitor LG UltraWide', 'Monitor curvo 34 pulgadas 4K', 599.99, 8, 3, '550e8400-e29b-41d4-a716-446655440002', 'LG-UW34-001', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440006', 'Teclado Mecánico Logitech', 'Teclado gaming con switches Cherry MX', 129.99, 30, 15, '550e8400-e29b-41d4-a716-446655440002', 'LOG-MK-001', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440007', 'Mouse Gaming Razer', 'Mouse óptico para gaming con RGB', 79.99, 45, 20, '550e8400-e29b-41d4-a716-446655440002', 'RAZ-MG-001', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440008', 'Auriculares Sony WH-1000XM5', 'Auriculares con cancelación de ruido', 349.99, 18, 8, '550e8400-e29b-41d4-a716-446655440001', 'SONY-WH1000-001', NOW(), NOW());

-- Insertar usuario administrador de prueba
INSERT INTO users (id, full_name, email, password_hash, role, created_at, updated_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Administrador Sistema', 'admin@ecommerxo.com', '$2a$10$9RZjHGqc5Pj1Y.6mCl7X3uvZKn7GqX6OUhD8.W2A8P9sUm2Kw0kgG', 'ADMIN', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440002', 'Gerente Sistema', 'manager@ecommerxo.com', '$2a$10$9RZjHGqc5Pj1Y.6mCl7X3uvZKn7GqX6OUhD8.W2A8P9sUm2Kw0kgG', 'MANAGER', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440003', 'Cliente Usuario', 'customer@ecommerxo.com', '$2a$10$9RZjHGqc5Pj1Y.6mCl7X3uvZKn7GqX6OUhD8.W2A8P9sUm2Kw0kgG', 'USER', NOW(), NOW());

-- Insertar movimientos de inventario de prueba
INSERT INTO inventory (id, product_id, quantity, type, reason, created_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 15, 'entrada', 'Stock inicial', NOW()),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 25, 'entrada', 'Stock inicial', NOW()),
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 20, 'entrada', 'Stock inicial', NOW()),
('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', 12, 'entrada', 'Stock inicial', NOW()),
('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440005', 8, 'entrada', 'Stock inicial', NOW()),
('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440006', 30, 'entrada', 'Stock inicial', NOW()),
('880e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440007', 45, 'entrada', 'Stock inicial', NOW()),
('880e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440008', 18, 'entrada', 'Stock inicial', NOW());

COMMIT;
