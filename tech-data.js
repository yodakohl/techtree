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
    {
        id: "sailing",
        name: "Sailing",
        era: "Ancient",
        description: "Use of wind-powered vessels for navigation across water.",
        prerequisites: ["basic_tools"]
    },
    {
        id: "wheel",
        name: "Wheel",
        era: "Ancient",
        description: "Circular component enabling carts and early vehicles.",
        prerequisites: ["basic_tools"]
    },
    {
        id: "archery",
        name: "Archery",
        era: "Ancient",
        description: "Use of bows and arrows for hunting and warfare.",
        prerequisites: ["basic_tools", "hunting_gathering"]
    },
    {
        id: "masonry",
        name: "Masonry",
        era: "Ancient",
        description: "Stone shaping techniques for building durable structures.",
        prerequisites: ["basic_tools"]
    },
    {
        id: "irrigation",
        name: "Irrigation",
        era: "Ancient",
        description: "Controlled water management for agriculture.",
        prerequisites: ["agriculture"]
    },
    {
        id: "horseback_riding",
        name: "Horseback Riding",
        era: "Ancient",
        description: "Using horses for travel and warfare.",
        prerequisites: ["animal_husbandry"]
    },
    {
        id: "glassmaking",
        name: "Glassmaking",
        era: "Ancient",
        description: "Creating glass for containers and ornaments.",
        prerequisites: ["fire_control", "pottery"]
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
    {
        id: "navigation",
        name: "Navigation",
        era: "Classical",
        description: "Techniques for determining position and course during travel.",
        prerequisites: ["sailing", "mathematics"]
    },
    {
        id: "plumbing",
        name: "Plumbing",
        era: "Classical",
        description: "Water supply and waste removal systems for buildings.",
        prerequisites: ["construction"]
    },
    {
        id: "siege_engineering",
        name: "Siege Engineering",
        era: "Classical",
        description: "Design of equipment for attacking fortified positions.",
        prerequisites: ["construction", "archery", "iron_working"]
    },
    {
        id: "theater",
        name: "Theater",
        era: "Classical",
        description: "Development of dramatic performances and stagecraft.",
        prerequisites: ["writing"]
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
    {
        id: "medicine",
        name: "Medicine",
        era: "Medieval",
        description: "Study and practice of diagnosing and treating illness.",
        prerequisites: ["universities"]
    },
    {
        id: "horse_collar",
        name: "Horse Collar",
        era: "Medieval",
        description: "Harness allowing horses to pull heavy loads efficiently.",
        prerequisites: ["animal_husbandry", "agriculture"]
    },
    {
        id: "crossbow",
        name: "Crossbow",
        era: "Medieval",
        description: "Mechanical bow that shoots bolts with great force.",
        prerequisites: ["archery", "iron_working"]
    },
    {
        id: "windmills",
        name: "Windmills",
        era: "Medieval",
        description: "Harnessing wind power for grinding grain and pumping water.",
        prerequisites: ["engineering"]
    },
    {
        id: "compass",
        name: "Compass",
        era: "Medieval",
        description: "Magnetic device for determining direction.",
        prerequisites: ["navigation", "iron_working"]
    },
    {
        id: "paper_making",
        name: "Paper Making",
        era: "Medieval",
        description: "Production of paper from pulp for writing and printing.",
        prerequisites: ["writing", "alchemy"]
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
    {
        id: "cartography",
        name: "Cartography",
        era: "Renaissance",
        description: "Creation of detailed maps for exploration and navigation.",
        prerequisites: ["navigation", "printing_press"]
    },
    {
        id: "clockwork",
        name: "Clockwork Mechanisms",
        era: "Renaissance",
        description: "Precision gears enabling mechanical clocks and devices.",
        prerequisites: ["engineering", "mathematics"]
    },
    {
        id: "telescope",
        name: "Telescope",
        era: "Renaissance",
        description: "Optical instrument that magnifies distant objects in the sky.",
        prerequisites: ["glassmaking", "scientific_method"]
    },
    {
        id: "microscope",
        name: "Microscope",
        era: "Renaissance",
        description: "Instrument for viewing very small objects.",
        prerequisites: ["glassmaking", "scientific_method"]
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
        id: "telegraph",
        name: "Telegraph",
        era: "Industrial",
        description: "Long-distance transmission of text messages using electrical signals.",
        prerequisites: ["electricity"]
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
    {
        id: "steel_production",
        name: "Steel Production",
        era: "Industrial",
        description: "Process of producing strong steel in large quantities.",
        prerequisites: ["iron_working", "steam_engine", "scientific_method"]
    },
    {
        id: "factory_system",
        name: "Factory System",
        era: "Industrial",
        description: "Organization of labor and machinery in centralized factories.",
        prerequisites: ["mass_production"]
    },
    {
        id: "photography",
        name: "Photography",
        era: "Industrial",
        description: "Capturing images using light-sensitive materials.",
        prerequisites: ["scientific_method", "alchemy"]
    },
    {
        id: "oil_drilling",
        name: "Oil Drilling",
        era: "Industrial",
        description: "Extraction of petroleum from underground reservoirs.",
        prerequisites: ["mass_production", "mining"]
    },
    {
        id: "chemical_fertilizers",
        name: "Chemical Fertilizers",
        era: "Industrial",
        description: "Synthesized nutrients to enhance crop yields.",
        prerequisites: ["scientific_method", "agriculture"]
    },
    {
        id: "refrigeration",
        name: "Refrigeration",
        era: "Industrial",
        description: "Artificial cooling for food preservation and industry.",
        prerequisites: ["scientific_method", "engineering"]
    },
    {
        id: "vaccination",
        name: "Vaccination",
        era: "Industrial",
        description: "Using weakened pathogens to prevent diseases.",
        prerequisites: ["medicine", "scientific_method"]
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
        id: "automobile",
        name: "Automobile",
        era: "Modern",
        description: "Self-propelled road vehicle powered by an internal combustion engine.",
        prerequisites: ["internal_combustion_engine", "mass_production"]
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
    {
        id: "radio",
        name: "Radio",
        era: "Modern",
        description: "Wireless transmission of signals using electromagnetic waves.",
        prerequisites: ["electricity", "telecommunications"]
    },

    {
        id: "solar_power",
        name: "Solar Power",
        era: "Modern",
        description: "Harnessing energy from sunlight to produce electricity.",
        prerequisites: ["electricity", "scientific_method"]
    },
    {
        id: "virtual_reality",
        name: "Virtual Reality",
        era: "Modern",
        description: "Immersive computer-simulated environments.",
        prerequisites: ["computers", "internet"]
    },
    {
        id: "rocketry",
        name: "Rocketry",
        era: "Modern",
        description: "Propulsion technology for reaching high altitudes and space.",
        prerequisites: ["flight", "engineering", "mathematics"]
    },
    {
        id: "space_flight",
        name: "Space Flight",
        era: "Modern",
        description: "Travel beyond Earth's atmosphere.",
        prerequisites: ["rocketry", "computers"]
    },
    {
        id: "satellite_technology",
        name: "Satellite Technology",
        era: "Modern",
        description: "Use of satellites for communication and observation.",
        prerequisites: ["space_flight", "telecommunications"]
    },
    {
        id: "mobile_phones",
        name: "Mobile Phones",
        era: "Modern",
        description: "Portable communication devices using cellular networks.",
        prerequisites: ["telecommunications", "computers"]
    },
    {
        id: "robotics",
        name: "Robotics",
        era: "Modern",
        description: "Design and use of autonomous or remote-controlled machines.",
        prerequisites: ["computers", "engineering"]
    },
    {
        id: "artificial_intelligence",
        name: "Artificial Intelligence",
        era: "Modern",
        description: "Machine systems capable of tasks requiring human intelligence.",
        prerequisites: ["computers", "mathematics", "scientific_method"]
    },
    {
        id: "nuclear_weapons",
        name: "Nuclear Weapons",
        era: "Modern",
        description: "Extremely destructive weapons powered by nuclear reactions.",
        prerequisites: ["nuclear_power", "scientific_method"]
    },
    {
        id: "gps",
        name: "Global Positioning System",
        era: "Modern",
        description: "Satellite-based navigation providing location data worldwide.",
        prerequisites: ["satellite_technology", "computers"]
    },
    {
        id: "wind_power",
        name: "Wind Power",
        era: "Modern",
        description: "Generating electricity from wind turbines.",
        prerequisites: ["engineering", "electricity"]
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
        id: "genetic_engineering",
        name: "Genetic Engineering",
        era: "Future",
        description: "Direct manipulation of genetic material to modify organisms.",
        prerequisites: ["nanotechnology", "chemistry_advanced", "scientific_method"]
    },
    {
        id: "quantum_computing",
        name: "Quantum Computing",
        era: "Future",
        description: "Exploitation of quantum phenomena to perform computation.",
        prerequisites: ["computers", "scientific_method", "nuclear_power"]
    },
    {
        id: "space_colonization",
        name: "Space Colonization",
        era: "Future",
        description: "Permanent human settlement off Earth.",
        prerequisites: ["space_flight", "nuclear_power", "computers", "nanotechnology"]
    },
    {
        id: "fusion_power",
        name: "Fusion Power",
        era: "Future",
        description: "Harnessing energy from nuclear fusion reactions.",
        prerequisites: ["nuclear_power", "scientific_method"]
    },
    {
        id: "quantum_communications",
        name: "Quantum Communications",
        era: "Future",
        description: "Instant secure communication using quantum entanglement.",
        prerequisites: ["quantum_computing", "telecommunications"]
    },
    {
        id: "terraforming",
        name: "Terraforming",
        era: "Future",
        description: "Altering a planet's environment to support human life.",
        prerequisites: ["space_colonization", "fusion_power", "genetic_engineering"]
    },
    {
        id: "mind_uploading",
        name: "Mind Uploading",
        era: "Future",
        description: "Transferring human consciousness to a digital medium.",
        prerequisites: ["artificial_general_intelligence", "genetic_engineering", "quantum_computing"]
    },
    {
        id: "interstellar_travel",
        name: "Interstellar Travel",
        era: "Future",
        description: "Travel between star systems.",
        prerequisites: ["fusion_power", "space_colonization", "quantum_computing"]
    },
    {
        id: "cryonics",
        name: "Cryonics",
        era: "Future",
        description: "Preservation of humans at low temperatures for future revival.",
        prerequisites: ["medicine", "chemistry_advanced"]
    }
];

if (typeof module !== "undefined") { module.exports = techTreeData; }
