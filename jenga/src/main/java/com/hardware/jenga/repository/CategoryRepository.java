package com.hardware.jenga.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hardware.jenga.entity.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {

    Optional<Category> findBySlug(String slug);

    List<Category> findByParentIsNullOrderByIdAsc();

    // Use parent_Id to tell JPA to inspect the 'id' field on the 'parent' entity
    @Query("SELECT c FROM Category c WHERE c.parent.id = :parentId ORDER BY c.id ASC")
    List<Category> findByParentIdOrderByIdAsc(@Param("parentId") Integer parentId);
}