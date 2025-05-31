// tech-data.js
const techTreeData = [
    // --- ANCIENT ERA ---
    {
        id: "fire_control",
        name: "Fire Control",
        era: "Ancient",
        description: "Mastery of fire for warmth, cooking, and protection.",
        prerequisites: []
    },
    {
        id: "basic_tools",
        name: "Basic Tools",
        era: "Ancient",
        description: "Rudimentary tools made from stone, wood, and bone.",
        prerequisites: ["fire_control"]
    },
    {
        id: "hunting_gathering",
        name: "Hunting & Gathering",
        era: "Ancient",
        description: "Societies primarily sustained by foraging and hunting.",
        prerequisites: ["basic_tools"]
    },
    {
        id: "agriculture",
        name: "Agriculture",
        era: "Ancient",
        description: "The cultivation of crops and domestication of animals, leading to settled societies.",
        prerequisites: ["hunting_gathering"]
    },
    {
        id: "pottery",
        name: "Pottery",
        era: "Ancient",
        description: "Crafting vessels from clay for storage and cooking.",
        prerequisites: ["fire_control", "agriculture"]
    },
    {
        id: "writing",
        name: "Writing",
        era: "Ancient",
        description: "Development of systems to record language and information.",
        prerequisites: ["agriculture"] // Often arose from need to manage surplus
    },
    {
        id: "animal_husbandry",
        name: "Animal Husbandry",
        era: "Ancient",
        description: "Systematic breeding and raising of livestock.",
        prerequisites: ["agriculture"]
    },
    {
        id: "mining",
        name: "Mining",
        era: "Ancient",
        description: "Extraction of valuable minerals and other geological materials from the Earth.",
        prerequisites: ["basic_tools"]
    },

    // --- CLASSICAL ERA ---
    {
        id: "bronze_working",
        name: "Bronze Working",
        era: "Classical",
        description: "Alloying copper and tin to create bronze for tools and weapons.",
        prerequisites: ["mining", "pottery"] // Kilns for pottery helped with smelting
    },
    {
        id: "iron_working",
        name: "Iron Working",
        era: "Classical",
        description: "Smelting iron ore to produce iron and steel, stronger than bronze.",
        prerequisites: ["bronze_working"]
    },
    {
        id: "philosophy",
        name: "Philosophy",
        era: "Classical",
        description: "Systematic study of general and fundamental questions.",
        prerequisites: ["writing"]
    },
    {
        id: "mathematics",
        name: "Mathematics",
        era: "Classical",
        description: "The study of numbers, quantity, space, structure, and change.",
        prerequisites: ["writing", "agriculture"] // For measurement, calendars
    },
    {
        id: "construction",
        name: "Construction",
        era: "Classical",
        description: "Advanced building techniques for temples, roads, and aqueducts.",
        prerequisites: ["mathematics", "iron_working"]
    },
    {
        id: "currency",
        name: "Currency",
        era: "Classical",
        description: "Standardized medium of exchange.",
        prerequisites: ["writing", "mining"]
    },

    // --- MEDIEVAL ERA ---
    {
        id: "feudalism",
        name: "Feudalism",
        era: "Medieval",
        description: "Social, economic, and political system based on land tenure and loyalty.",
        prerequisites: ["iron_working", "animal_husbandry"]
    },
    {
        id: "engineering",
        name: "Engineering",
        era: "Medieval",
        description: "Practical application of scientific and mathematical principles for design and construction (e.g., castles, cathedrals).",
        prerequisites: ["construction", "mathematics"]
    },
    {
        id: "universities",
        name: "Universities",
        era: "Medieval",
        description: "Institutions of higher learning.",
        prerequisites: ["philosophy", "writing"]
    },
    {
        id: "gunpowder",
        name: "Gunpowder",
        era: "Medieval",
        description: "Explosive mixture used in early firearms and cannons.",
        prerequisites: ["mining", "alchemy"] // Alchemy as a placeholder for early chemistry
    },
    {
        id: "alchemy", // Placeholder for early chemical knowledge
        name: "Alchemy",
        era: "Medieval",
        description: "Early form of investigation of nature and philosophical and spiritual discipline.",
        prerequisites: ["philosophy", "mining"]
    },

    // --- RENAISSANCE ERA ---
    {
        id: "printing_press",
        name: "Printing Press",
        era: "Renaissance",
        description: "Mechanical device for applying pressure to an inked surface, transferring ink to paper.",
        prerequisites: ["writing", "iron_working", "universities"]
    },
    {
        id: "scientific_method",
        name: "Scientific Method",
        era: "Renaissance",
        description: "Systematic observation, measurement, experiment, and the formulation, testing, and modification of hypotheses.",
        prerequisites: ["philosophy", "mathematics", "universities"]
    },
    {
        id: "banking",
        name: "Banking",
        era: "Renaissance",
        description: "Sophisticated financial institutions and practices.",
        prerequisites: ["currency", "mathematics", "writing"]
    },
    {
        id: "astronomy",
        name: "Astronomy",
        era: "Renaissance",
        description: "Study of celestial objects and phenomena, revolutionized by new tools and methods.",
        prerequisites: ["mathematics", "scientific_method", "philosophy"]
    },

    // --- INDUSTRIAL ERA ---
    {
        id: "steam_engine",
        name: "Steam Engine",
        era: "Industrial",
        description: "Heat engine that performs mechanical work using steam as its working fluid.",
        prerequisites: ["iron_working", "scientific_method", "mining"] // Coal for fuel
    },
    {
        id: "electricity",
        name: "Electricity",
        era: "Industrial",
        description: "Understanding and harnessing electrical phenomena.",
        prerequisites: ["scientific_method", "steam_engine"] // For generators
    },
    {
        id: "mass_production",
        name: "Mass Production",
        era: "Industrial",
        description: "Manufacture of large quantities of standardized products, often using assembly lines.",
        prerequisites: ["steam_engine", "iron_working", "banking"]
    },
    {
        id: "railroads",
        name: "Railroads",
        era: "Industrial",
        description: "Mode of transport using trains running on tracks.",
        prerequisites: ["steam_engine", "mass_production", "engineering"]
    },

    // --- MODERN ERA ---
    {
        id: "internal_combustion_engine",
        name: "Internal Combustion Engine",
        era: "Modern",
        description: "Engine that generates motive power by burning fuel within the engine itself.",
        prerequisites: ["steam_engine", "scientific_method", "mass_production"]
    },
    {
        id: "flight",
        name: "Flight",
        era: "Modern",
        description: "Achieving sustained travel through the air.",
        prerequisites: ["internal_combustion_engine", "scientific_method", "engineering"]
    },
    {
        id: "computers",
        name: "Computers",
        era: "Modern",
        description: "Electronic devices for storing and processing data.",
        prerequisites: ["electricity", "mathematics", "scientific_method"]
    },
    {
        id: "nuclear_power",
        name: "Nuclear Power",
        era: "Modern",
        description: "Using nuclear reactions to produce electricity.",
        prerequisites: ["electricity", "scientific_method", "astronomy"] // Astronomy led to physics understanding
    },
    {
        id: "internet",
        name: "Internet",
        era: "Modern",
        description: "Global system of interconnected computer networks.",
        prerequisites: ["computers", "electricity", "telecommunications"]
    },
    {
        id: "telecommunications", // Added as a distinct tech
        name: "Telecommunications",
        era: "Modern",
        description: "Transmission of information over significant distances by electronic means.",
        prerequisites: ["electricity", "scientific_method"]
    },

    // --- FUTURE ERA (Speculative) ---
    {
        id: "artificial_general_intelligence",
        name: "Artificial General Intelligence",
        era: "Future",
        description: "AI with human-like cognitive abilities.",
        prerequisites: ["computers", "internet", "scientific_method"]
    },
    {
        id: "nanotechnology",
        name: "Nanotechnology",
        era: "Future",
        description: "Engineering of functional systems at the molecular scale.",
        prerequisites: ["computers", "scientific_method", "chemistry_advanced"]
    },
    {
        id: "chemistry_advanced", // Added as prereq for nano
        name: "Advanced Chemistry",
        era: "Modern", // Could be late modern, leading to future
        description: "Deep understanding of molecular interactions and material science.",
        prerequisites: ["scientific_method", "alchemy"] // Evolution from early chemistry
    },
    {
        id: "space_colonization",
        name: "Space Colonization",
        era: "Future",
        description: "Permanent human settlement off Earth.",
        prerequisites: ["flight", "nuclear_power", "computers", "nanotechnology"]
    }
];
