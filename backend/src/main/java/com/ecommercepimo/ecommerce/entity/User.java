package com.ecommercepimo.ecommerce.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    @Email(message = "Email debe tener formato válido")
    @NotBlank(message = "Email es obligatorio")
    private String email;

    @Column(nullable = false)
    @NotBlank(message = "Password es obligatorio")
    @Size(min = 8, message = "Password debe tener al menos 8 caracteres")
    private String password;

    @Column(name = "first_name", nullable = false)
    @NotBlank(message = "Nombre es obligatorio")
    @Size(max = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    @NotBlank(message = "Apellido es obligatorio")
    @Size(max = 50)
    private String lastName;

    @Column(nullable = false)
    @Pattern(regexp = "^\+?[1-9]\d{1,14}$", message = "Teléfono inválido")
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(name = "account_non_expired")
    private Boolean accountNonExpired = true;

    @Column(name = "account_non_locked")
    private Boolean accountNonLocked = true;

    @Column(name = "credentials_non_expired")
    private Boolean credentialsNonExpired = true;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Order> orders;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // UserDetails implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    public enum Role {
        USER, ADMIN
    }
}