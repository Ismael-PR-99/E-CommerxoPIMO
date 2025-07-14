package com.ecommerxo.api.service;

import com.ecommerxo.api.model.Category;
import com.ecommerxo.api.repository.CategoryRepository;
import com.ecommerxo.api.dto.CategoryDTO;
import com.ecommerxo.api.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    
    private final CategoryRepository categoryRepository;

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CategoryDTO> getRootCategories() {
        return categoryRepository.findByParentIdIsNull().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CategoryDTO> getSubcategories(UUID parentId) {
        return categoryRepository.findByParentId(parentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CategoryDTO getCategory(UUID id) {
        Category category = findCategoryById(id);
        return convertToDTO(category);
    }

    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        Category category = convertToEntity(categoryDTO);
        category = categoryRepository.save(category);
        return convertToDTO(category);
    }

    public CategoryDTO updateCategory(UUID id, CategoryDTO categoryDTO) {
        Category category = findCategoryById(id);
        updateCategoryFromDTO(category, categoryDTO);
        category = categoryRepository.save(category);
        return convertToDTO(category);
    }

    public void deleteCategory(UUID id) {
        Category category = findCategoryById(id);
        // Verificar que no tenga subcategorías
        List<Category> subcategories = categoryRepository.findByParentId(id);
        if (!subcategories.isEmpty()) {
            throw new IllegalStateException("No se puede eliminar una categoría que tiene subcategorías");
        }
        categoryRepository.delete(category);
    }

    private Category findCategoryById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
    }

    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setParentId(category.getParentId());
        dto.setCreatedAt(category.getCreatedAt());
        return dto;
    }

    private Category convertToEntity(CategoryDTO dto) {
        Category category = new Category();
        updateCategoryFromDTO(category, dto);
        return category;
    }

    private void updateCategoryFromDTO(Category category, CategoryDTO dto) {
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setParentId(dto.getParentId());
    }
}
