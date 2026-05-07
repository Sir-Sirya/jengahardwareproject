package com.hardware.jenga.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hardware.jenga.entity.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByParentIsNull();
    List<Category> findByParentId(Integer parentId);
}