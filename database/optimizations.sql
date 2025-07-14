-- Optimizaciones de base de datos para mejor rendimiento

-- Índices para mejoras de consultas
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity);

-- Índices compuestos para consultas complejas
CREATE INDEX IF NOT EXISTS idx_products_category_price ON products(category, price);
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_product_quantity ON inventory(product_id, quantity);

-- Vistas materializadas para reportes rápidos (PostgreSQL)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_product_sales_summary AS
SELECT 
    p.id,
    p.name,
    p.category,
    COALESCE(SUM(oi.quantity), 0) as total_sold,
    COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
    COUNT(DISTINCT o.id) as order_count
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days' OR o.created_at IS NULL
GROUP BY p.id, p.name, p.category;

-- Índice en la vista materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_product_sales_id ON mv_product_sales_summary(id);
CREATE INDEX IF NOT EXISTS idx_mv_product_sales_category ON mv_product_sales_summary(category);
CREATE INDEX IF NOT EXISTS idx_mv_product_sales_revenue ON mv_product_sales_summary(total_revenue);

-- Vista para productos con bajo stock
CREATE OR REPLACE VIEW v_low_stock_products AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.category,
    p.price,
    i.quantity,
    p.reorder_level
FROM products p
JOIN inventory i ON p.id = i.product_id
WHERE i.quantity <= p.reorder_level;

-- Vista para estadísticas de órdenes
CREATE OR REPLACE VIEW v_order_statistics AS
SELECT 
    DATE(created_at) as order_date,
    status,
    COUNT(*) as order_count,
    SUM(total) as total_revenue,
    AVG(total) as avg_order_value
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at), status
ORDER BY order_date DESC, status;

-- Procedimiento almacenado para actualización de estadísticas
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW mv_product_sales_summary;
END;
$$ LANGUAGE plpgsql;

-- Trigger para mantener actualizadas las estadísticas
CREATE OR REPLACE FUNCTION trigger_refresh_stats()
RETURNS trigger AS $$
BEGIN
    -- Solo refrescar cada hora para evitar sobrecarga
    IF (EXTRACT(MINUTE FROM NOW()) = 0) THEN
        PERFORM refresh_materialized_views();
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Solo crear el trigger si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_refresh_stats_on_order') THEN
        CREATE TRIGGER tr_refresh_stats_on_order
        AFTER INSERT OR UPDATE ON orders
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_refresh_stats();
    END IF;
END $$;
