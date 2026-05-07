package com.hardware.jenga.dto;

import com.hardware.jenga.entity.Category;
import lombok.Data;

@Data
public class CategoryResponse {
    private Integer id;
    private String name;
    private String slug;
    private String iconName;

    public static CategoryResponse fromEntity(Category category) {
        if (category == null) return null;
        CategoryResponse resp = new CategoryResponse();
        resp.setId(category.getId());
        resp.setName(category.getName());
        resp.setSlug(category.getSlug());
        resp.setIconName(category.getIconName());
        return resp;
    }
}
