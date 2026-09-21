package com.hardware.jenga.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.hardware.jenga.entity.Category;
import com.hardware.jenga.repository.CategoryRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public DataInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        // Only initialize if no categories exist
        if (categoryRepository.count() > 0) {
            return;
        }

        Map<String, Category> created = new HashMap<>();

        // Helper to create a category
        java.util.function.BiFunction<String, Category, Category> create = (name, parent) -> {
            Category cat = new Category();
            cat.setName(name);
            cat.setSlug(name.toLowerCase().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-").replaceAll("^-|-$", ""));
            cat.setParent(parent);
            return categoryRepository.save(cat);
        };

        // Level 1: Parent categories
        String[] parents = {
            "Paints & Painting Supplies",
            "Gate Accessories",
            "Doors",
            "Door Frames",
            "Ceramics",
            "Door Locks",
            "Timber",
            "Aluminium",
            "Flooring & Tiling",
            "Manufactured Boards",
            "Ceilings and Accessories",
            "Gypsum",
            "Granite",
            "Services",
            "Cement"
        };

        for (String name : parents) {
            created.put(name, create.apply(name, null));
        }

        // Level 2: Sub-categories

        // Paints & Painting Supplies
        createChild(create, created, "Paints & Painting Supplies",
            "Crown paint", "Duracoat paint", "Paint brush");

        // Gate Accessories
        createChild(create, created, "Gate Accessories",
            "Decor sheet", "Gate Arrow designs");

        // Doors
        createChild(create, created, "Doors",
            "Steel Doors", "Wooden Doors", "Roller shutter");

        // Door Frames
        createChild(create, created, "Door Frames",
            "6x2 frame", "4x2 frame", "2x2 frame");

        // Ceramics (with sub-groupings)
        Category ceramics = created.get("Ceramics");
        Category tilesFlooring = create.apply("Tiles & Flooring", ceramics);
        Category sanitaryware = create.apply("Sanitaryware & Bathrooms", ceramics);
        Category tableware = create.apply("Tableware & Kitchenware", ceramics);
        Category structural = create.apply("Structural & Industrial", ceramics);
        Category decorative = create.apply("Decorative & Artistic", ceramics);

        // Ceramics → Tiles & Flooring
        create.apply("Wall tiles (30x60)", tilesFlooring);
        create.apply("Wall tiles (30x45)", tilesFlooring);
        create.apply("Floor tiles (30x30)", tilesFlooring);
        create.apply("Floor tiles (40x40)", tilesFlooring);
        create.apply("Floor tiles (60x60)", tilesFlooring);
        create.apply("Mosaic tiles", tilesFlooring);
        create.apply("Border tiles", tilesFlooring);
        create.apply("Pool tiles", tilesFlooring);

        // Ceramics → Sanitaryware & Bathrooms
        create.apply("Basins", sanitaryware);
        create.apply("Toilets", sanitaryware);
        create.apply("Basins mixers", sanitaryware);
        create.apply("Showers", sanitaryware);

        // Ceramics → Tableware & Kitchenware
        create.apply("Dinner sets", tableware);
        create.apply("Plates", tableware);
        create.apply("Bowls", tableware);
        create.apply("Mugs (Bone China)", tableware);

        // Ceramics → Structural & Industrial
        create.apply("Bricks", structural);
        create.apply("Refractories (kiln linings)", structural);
        create.apply("Pipes", structural);
        create.apply("Abrasives", structural);

        // Ceramics → Decorative & Artistic
        create.apply("Pottery", decorative);
        create.apply("Flower pots", decorative);
        create.apply("Vases", decorative);

        // Door Locks
        createChild(create, created, "Door Locks",
            "Wooden door locks", "Steel door locks");

        // Timber (with sub-groupings)
        Category timber = created.get("Timber");
        Category hardwoods = create.apply("Hardwoods", timber);
        Category softwoods = create.apply("Softwoods", timber);

        create.apply("Mahogany", hardwoods);
        create.apply("European cypress", hardwoods);
        create.apply("Sudan tick", hardwoods);
        create.apply("Mvule (Iroko)", hardwoods);
        create.apply("Meru Oak", hardwoods);
        create.apply("Olivewood", hardwoods);

        create.apply("Cypress", softwoods);
        create.apply("Pine", softwoods);

        // Aluminium
        createChild(create, created, "Aluminium",
            "Shower Cubicle Sliding aluminium");

        // Flooring & Tiling
        createChild(create, created, "Flooring & Tiling",
            "30x30 tiles", "60x60 tiles", "SpC Flooring", "Wooden tiles");

        // Manufactured Boards
        createChild(create, created, "Manufactured Boards",
            "MDF (Medium Density Fiberboard)", "Plywood", "Chipboard (Particleboard)", "Hardboard", "Gypsum boards");

        // Ceilings and Accessories
        createChild(create, created, "Ceilings and Accessories",
            "PVC ceiling", "Gypsum Ceiling", "Ceiling boards 7mm/9mm");

        // Gypsum
        createChild(create, created, "Gypsum",
            "Gypsum board");

        // Granite
        createChild(create, created, "Granite",
            "Black Galaxy Granite", "Granite glue polishing pad");

        // Services
        createChild(create, created, "Services",
            "CNC Cutting", "Door Lock Drilling", "Board edging", "Powder coating");

        // Cement
        createChild(create, created, "Cement",
            "Simba", "Ndovu", "Mombasa Cement");
    }

    private void createChild(
            java.util.function.BiFunction<String, Category, Category> create,
            Map<String, Category> created, String parentName, String... childNames) {
        Category parent = created.get(parentName);
        if (parent == null) return;
        for (String name : childNames) {
            create.apply(name, parent);
        }
    }
}
