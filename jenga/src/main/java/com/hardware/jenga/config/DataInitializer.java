package com.hardware.jenga.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.hardware.jenga.entity.Category;
import com.hardware.jenga.repository.CategoryRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public DataInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Do not re-seed if the categories table is already populated
        if (categoryRepository.count() > 0) {
            return;
        }

        Map<Integer, Category> parentMap = new HashMap<>();

        // Helper to instantiate and save a category
        java.util.function.BiFunction<String, Category, Category> createCat = (name, parent) -> {
            Category cat = new Category();
            cat.setName(name);
            cat.setSlug(name.toLowerCase()
                    .replaceAll("[^a-z0-9]+", "-")
                    .replaceAll("^-|-$", ""));
            cat.setParent(parent);
            return categoryRepository.save(cat);
        };

        // 1. Exactly the 9 agreed main parent categories
        String[] parents = {
            "Paints & Painting Supplies",          // 1
            "Gate Accessories",                   // 2
            "Doors & Frames",                      // 3
            "Ceramics & Sanitaryware",             // 4
            "Timber & Boards",                     // 5
            "Aluminium, Glass & Windows",          // 6
            "Ceilings & Gypsum",                   // 7
            "Professional Workshop Services",      // 8
            "Cement & Construction Chemicals"      // 9
        };

        int index = 1;
        for (String parentName : parents) {
            Category parent = createCat.apply(parentName, null);
            parentMap.put(index++, parent);
        }

        // 2. Subcategories mapped strictly to their parents

        // 1: Paints & Painting Supplies
        createChildren(createCat, parentMap.get(1),
                "Crown Paint", "Duracoat Paint", "Paint Brushes & Rollers");

        // 2: Gate Accessories
        createChildren(createCat, parentMap.get(2),
                "Decor Sheet", "Gate Arrow Designs");

        // 3: Doors & Frames
        createChildren(createCat, parentMap.get(3),
                "Steel Doors", "Wooden Doors", "Roller Shutters", "Door Frames (6x2, 4x2)", "Door Locks");

        // 4: Ceramics & Sanitaryware
        createChildren(createCat, parentMap.get(4),
                "Wall & Floor Tiles", "Sanitaryware & Bathrooms", "Tableware & Kitchenware");

        // 5: Timber & Boards
        createChildren(createCat, parentMap.get(5),
                "Hardwoods (Mahogany/Mvule)", "Softwoods (Cypress/Pine)", "MDF & Plywood");

        // 6: Aluminium, Glass & Windows
        createChildren(createCat, parentMap.get(6),
                "Sliding Aluminium Windows",
                "Casement & Louver Windows",
                "Toughened / Laminated Safety Glass",
                "Tinted & Frosted Architectural Glass",
                "Window Glazing, Channels & Sealants");

        // 7: Ceilings & Gypsum has no immediate default children

        // 8: Professional Workshop Services
        createChildren(createCat, parentMap.get(8),
                "CNC Cutting", "Door Lock Drilling", "Board Edging");

        // 9: Cement & Construction Chemicals
        createChildren(createCat, parentMap.get(9),
                "Cement (Simba/Ndovu)");
    }

    private void createChildren(
            java.util.function.BiFunction<String, Category, Category> creator,
            Category parent,
            String... childNames) {
        if (parent == null) return;
        for (String name : childNames) {
            creator.apply(name, parent);
        }
    }
}