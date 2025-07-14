package com.ecommercepimo.ecommerce.mapper;

import com.ecommercepimo.ecommerce.dto.RegisterRequest;
import com.ecommercepimo.ecommerce.dto.UserResponse;
import com.ecommercepimo.ecommerce.dto.UserUpdateRequest;
import com.ecommercepimo.ecommerce.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    UserResponse toUserResponse(User user);

    User toEntity(RegisterRequest registerRequest);

    void updateUserFromDto(UserUpdateRequest updateRequest, @MappingTarget User user);
}