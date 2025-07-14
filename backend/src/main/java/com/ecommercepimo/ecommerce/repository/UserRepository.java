package com.ecommercepimo.ecommerce.repository;

import com.ecommercepimo.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Buscar usuario por email (usado para autenticación)
     */
    Optional<User> findByEmail(String email);

    /**
     * Verificar si existe un usuario con el email
     */
    boolean existsByEmail(String email);

    /**
     * Buscar usuarios activos
     */
    List<User> findByEnabledTrue();

    /**
     * Buscar usuarios por rol
     */
    List<User> findByRole(User.Role role);

    /**
     * Buscar usuarios creados en un rango de fechas
     */
    @Query("SELECT u FROM User u WHERE u.createdAt BETWEEN :startDate AND :endDate")
    List<User> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                     @Param("endDate") LocalDateTime endDate);

    /**
     * Buscar usuarios con órdenes realizadas
     */
    @Query("SELECT DISTINCT u FROM User u WHERE SIZE(u.orders) > 0")
    List<User> findUsersWithOrders();

    /**
     * Contar usuarios activos
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.enabled = true")
    Long countActiveUsers();
}