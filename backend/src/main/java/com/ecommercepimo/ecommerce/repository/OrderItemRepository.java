package com.ecommercepimo.ecommerce.repository;

import com.ecommercepimo.ecommerce.entity.OrderItem;
import com.ecommercepimo.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    /**
     * Buscar items por producto
     */
    List<OrderItem> findByProduct(Product product);

    /**
     * Obtener productos más vendidos en un período
     */
    @Query("SELECT oi.product, SUM(oi.quantity) as totalSold FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.createdAt BETWEEN :startDate AND :endDate " +
           "AND o.status = 'DELIVERED' " +
           "GROUP BY oi.product " +
           "ORDER BY totalSold DESC")
    List<Object[]> findTopSellingProductsBetweenDates(@Param("startDate") LocalDateTime startDate,
                                                     @Param("endDate") LocalDateTime endDate);

    /**
     * Calcular total de unidades vendidas de un producto
     */
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE oi.product.id = :productId AND o.status = 'DELIVERED'")
    Long getTotalSoldQuantityByProduct(@Param("productId") Long productId);

    /**
     * Obtener productos comprados por un usuario
     */
    @Query("SELECT DISTINCT oi.product FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.user.id = :userId AND o.status = 'DELIVERED'")
    List<Product> findProductsPurchasedByUser(@Param("userId") Long userId);
}