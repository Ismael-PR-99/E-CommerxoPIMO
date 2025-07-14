package com.ecommercepimo.ecommerce.controller;

import com.ecommercepimo.ecommerce.dto.UserResponse;
import com.ecommercepimo.ecommerce.entity.User;
import com.ecommercepimo.ecommerce.mapper.UserMapper;
import com.ecommercepimo.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    /**
     * Obtener todos los usuarios
     * GET /api/users
     */
    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @PageableDefault(size = 20) Pageable pageable) {

        log.debug("Getting all users (admin)");
        Page<User> users = userRepository.findAll(pageable);
        Page<UserResponse> userResponses = users.map(userMapper::toUserResponse);
        return ResponseEntity.ok(userResponses);
    }

    /**
     * Obtener usuario por ID
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        log.debug("Getting user by ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return ResponseEntity.ok(userMapper.toUserResponse(user));
    }

    /**
     * Obtener usuarios activos
     * GET /api/users/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<UserResponse>> getActiveUsers() {
        log.debug("Getting active users");

        List<User> users = userRepository.findByEnabledTrue();
        List<UserResponse> userResponses = users.stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(userResponses);
    }

    /**
     * Obtener usuarios por rol
     * GET /api/users/role/{role}
     */
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable User.Role role) {
        log.debug("Getting users by role: {}", role);

        List<User> users = userRepository.findByRole(role);
        List<UserResponse> userResponses = users.stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(userResponses);
    }

    /**
     * Habilitar/deshabilitar usuario
     * PATCH /api/users/{id}/enabled
     */
    @PatchMapping("/{id}/enabled")
    public ResponseEntity<UserResponse> toggleUserEnabled(
            @PathVariable Long id,
            @RequestBody EnableUserRequest request) {

        log.info("Toggling user {} enabled status: {}", id, request.getEnabled());

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setEnabled(request.getEnabled());
        User updatedUser = userRepository.save(user);

        return ResponseEntity.ok(userMapper.toUserResponse(updatedUser));
    }

    /**
     * Cambiar rol de usuario
     * PATCH /api/users/{id}/role
     */
    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponse> changeUserRole(
            @PathVariable Long id,
            @RequestBody ChangeRoleRequest request) {

        log.info("Changing user {} role to: {}", id, request.getRole());

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setRole(request.getRole());
        User updatedUser = userRepository.save(user);

        return ResponseEntity.ok(userMapper.toUserResponse(updatedUser));
    }

    /**
     * Obtener estadísticas de usuarios
     * GET /api/users/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<UserStatsResponse> getUserStats() {
        log.debug("Getting user statistics");

        Long totalUsers = userRepository.count();
        Long activeUsers = userRepository.countActiveUsers();
        Long adminUsers = userRepository.countByRole(User.Role.ADMIN);
        Long regularUsers = userRepository.countByRole(User.Role.USER);

        UserStatsResponse stats = new UserStatsResponse();
        stats.setTotalUsers(totalUsers);
        stats.setActiveUsers(activeUsers);
        stats.setAdminUsers(adminUsers);
        stats.setRegularUsers(regularUsers);

        return ResponseEntity.ok(stats);
    }

    // DTOs internos
    public static class EnableUserRequest {
        private Boolean enabled;

        public Boolean getEnabled() { return enabled; }
        public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    }

    public static class ChangeRoleRequest {
        private User.Role role;

        public User.Role getRole() { return role; }
        public void setRole(User.Role role) { this.role = role; }
    }

    public static class UserStatsResponse {
        private Long totalUsers;
        private Long activeUsers;
        private Long adminUsers;
        private Long regularUsers;

        // getters y setters
        public Long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
        public Long getActiveUsers() { return activeUsers; }
        public void setActiveUsers(Long activeUsers) { this.activeUsers = activeUsers; }
        public Long getAdminUsers() { return adminUsers; }
        public void setAdminUsers(Long adminUsers) { this.adminUsers = adminUsers; }
        public Long getRegularUsers() { return regularUsers; }
        public void setRegularUsers(Long regularUsers) { this.regularUsers = regularUsers; }
    }
}