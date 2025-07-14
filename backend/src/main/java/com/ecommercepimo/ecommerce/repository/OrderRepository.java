package com.ecommercepimo.ecommerce.repository;

import com.ecommercepimo.ecommerce.entity.Order;
import com.ecommercepimo.ecommerce.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Buscar orden por n�mero de orden
     */
    Optional<Order> findByOrderNumber(String orderNumber);

    /**
     * Buscar �rdenes por usuario
     */
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    /**
     * Buscar �rdenes por usuario y estado
     */
    List<Order> findByUserAndStatus(User user, Order.OrderStatus status);

    /**
     * Buscar �rdenes por estado
     */
    Page<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus status, Pageable pageable);

    /**
     * Buscar �rdenes en un rango de fechas
     */
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY o.createdAt DESC")
    List<Order> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);

    /**
     * Calcular total de ventas en un per�odo
     */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.status = 'DELIVERED' AND o.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal calculateTotalSalesBetweenDates(@Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);

    /**
     * Contar �rdenes por estado
     */
    Long countByStatus(Order.OrderStatus status);

    /**
     * Obtener �rdenes pendientes de env�o
     */
    @Query("SELECT o FROM Order o WHERE o.status IN ('CONFIRMED', 'PROCESSING') " +
           "ORDER BY o.createdAt ASC")
    List<Order> findPendingShipmentOrders();

    /**
     * Buscar �rdenes de un usuario por ID
     */
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    List<Order> findByUserId(@Param("userId") Long userId);

    /**
     * Obtener estad�sticas de �rdenes del mes actual
     */
    @Query("SELECT COUNT(o), COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE YEAR(o.createdAt) = YEAR(CURRENT_DATE) " +
           "AND MONTH(o.createdAt) = MONTH(CURRENT_DATE)")
    Object[] getCurrentMonthStats();

    /**
     * Buscar �ltimas �rdenes de un usuario
     */
    @Query("SELECT o FROM Order o WHERE o.user = :user " +
           "ORDER BY o.createdAt DESC")
    List<Order> findRecentOrdersByUser(@Param("user") User user, Pageable pageable);
}