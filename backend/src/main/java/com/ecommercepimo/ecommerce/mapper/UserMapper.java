package com.ecommercepimo.ecommerce.mapper;

import com.ecommercepimo.ecommerce.dto.RegisterRequest;
import com.ecommercepimo.ecommerce.dto.UserResponse;
import com.ecommercepimo.ecommerce.dto.UserUpdateRequest;
import com.ecommercepimo.ecommerce.entity.User;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper MapStruct para conversiones entre User entity y DTOs
 * Configurado para Spring Component Model con políticas de mapeo consistentes
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
    nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS
)
public interface UserMapper {

    /**
     * Convierte User entity a UserResponse DTO
     * Excluye campos sensibles como password
     */
    @Mapping(target = "fullName", expression = "java(user.getFirstName() + \" \" + user.getLastName())")
    @Mapping(target = "accountActive", source = "enabled")
    UserResponse toUserResponse(User user);

    /**
     * Convierte lista de User entities a lista de UserResponse DTOs
     */
    List<UserResponse> toUserResponseList(List<User> users);

    /**
     * Convierte RegisterRequest DTO a User entity
     * Excluye campos que se generan automáticamente
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "enabled", constant = "true")
    @Mapping(target = "accountNonExpired", constant = "true")
    @Mapping(target = "accountNonLocked", constant = "true")
    @Mapping(target = "credentialsNonExpired", constant = "true")
    @Mapping(target = "orders", ignore = true)
    User toEntity(RegisterRequest registerRequest);

    /**
     * Actualiza User entity existente con datos de UserUpdateRequest
     * Solo actualiza campos no nulos del DTO
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true) // Email no se puede cambiar
    @Mapping(target = "password", ignore = true) // Password se cambia por endpoint separado
    @Mapping(target = "role", ignore = true) // Role se cambia por endpoint separado
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "enabled", ignore = true)
    @Mapping(target = "accountNonExpired", ignore = true)
    @Mapping(target = "accountNonLocked", ignore = true)
    @Mapping(target = "credentialsNonExpired", ignore = true)
    @Mapping(target = "orders", ignore = true)
    void updateUserFromDto(UserUpdateRequest updateRequest, @MappingTarget User user);

    /**
     * Mapeo personalizado para campos calculados
     */
    @AfterMapping
    default void setCalculatedFields(@MappingTarget UserResponse userResponse, User user) {
        // Aquí se pueden añadir campos calculados adicionales si es necesario
        if (user.getOrders() != null) {
            userResponse.setTotalOrders(user.getOrders().size());
        }
    }
}