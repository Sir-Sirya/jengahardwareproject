package com.hardware.jenga.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hardware.jenga.dto.CategoryHierarchyDto;
import com.hardware.jenga.entity.Category;
import com.hardware.jenga.repository.CategoryRepository;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @GetMapping("/hierarchy")
    public List<CategoryHierarchyDto> getCategoryHierarchy() {
        List<Category> roots = categoryRepository.findByParentIsNull();
        return roots.stream()
                .map(CategoryHierarchyDto::fromEntity)
                .collect(Collectors.toList());
    }
}
