package com.hardware.jenga.dto;

import java.util.ArrayList;
import java.util.List;

import com.hardware.jenga.entity.Category;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryHierarchyDto {
    private Integer id;
    private String name;
    private String slug;
    private String iconName;
    private List<CategoryHierarchyDto> children = new ArrayList<>();

    public static CategoryHierarchyDto fromEntity(Category category) {
        if (category == null) return null;
        CategoryHierarchyDto dto = new CategoryHierarchyDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setSlug(category.getSlug());
        dto.setIconName(category.getIconName());
        if (category.getChildren() != null) {
            for (Category child : category.getChildren()) {
                dto.getChildren().add(fromEntity(child));
            }
        }
        return dto;
    }
}
