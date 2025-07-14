-- V2__Insert_sample_data.sql
-- Insertar usuario administrador
INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES
('admin@ecommerce.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Admin', 'System', '+1234567890', 'ADMIN'),
('user@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Test', 'User', '+0987654321', 'USER');

-- Insertar productos de muestra
INSERT INTO products (name, description, price, stock, min_stock, category, featured) VALUES
('Laptop Gaming', 'Laptop de alto rendimiento para gaming', 1299.99, 15, 5, 'Electronics', true),
('Smartphone Pro', 'Tel�fono inteligente de �ltima generaci�n', 899.99, 25, 10, 'Electronics', true),
('Camiseta Casual', 'Camiseta 100% algod�n', 29.99, 100, 20, 'Clothing', false),
('Zapatillas Running', 'Zapatillas para correr profesionales', 129.99, 50, 15, 'Sports', false),
('Libro Programaci�n', 'Gu�a completa de desarrollo web', 45.99, 30, 5, 'Books', false),
('Auriculares Bluetooth', 'Auriculares inal�mbricos con cancelaci�n de ruido', 199.99, 40, 10, 'Electronics', true),
('Mesa de Oficina', 'Mesa ergon�mica para trabajo', 299.99, 20, 5, 'Furniture', false),
('Cafetera Express', 'Cafetera autom�tica profesional', 159.99, 12, 3, 'Home', false);