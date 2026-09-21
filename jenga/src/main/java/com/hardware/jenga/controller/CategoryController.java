package com.hardware.jenga.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hardware.jenga.dto.CategoryHierarchyDto;
import com.hardware.jenga.entity.Category;
import com.hardware.jenga.repository.CategoryRepository;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /**
     * Returns all categories with parentId included in each object
     */
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    /**
     * Dedicated endpoint returning strictly the 9 main parent categories
     */
    @GetMapping("/parents")
    public List<Category> getParentCategories() {
        return categoryRepository.findByParentIsNullOrderByIdAsc();
    }

    /**
     * Returns direct subcategories for a given parent ID
     */
    @GetMapping("/parent/{parentId}")
    public List<Category> getSubcategories(@PathVariable Integer parentId) {
        return categoryRepository.findByParentIdOrderByIdAsc(parentId);
    }

    /**
     * Returns the full tree structure
     */
    @GetMapping("/hierarchy")
    public List<CategoryHierarchyDto> getCategoryHierarchy() {
        List<Category> roots = categoryRepository.findByParentIsNullOrderByIdAsc();
        return roots.stream()
                .map(CategoryHierarchyDto::fromEntity)
                .collect(Collectors.toList());
    }
}