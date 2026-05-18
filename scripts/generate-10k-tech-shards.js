const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const OUT_DIR = path.join(DATA_DIR, 'expansion');
const TARGET = Number(process.argv[2] || 10000);
const SHARD_SIZE = Number(process.argv[3] || 1000);

const eras = ['Ancient', 'Classical', 'Medieval', 'Renaissance', 'Industrial', 'Modern', 'Future'];
const eraSlug = {
    Ancient: 'ancient',
    Classical: 'classical',
    Medieval: 'medieval',
    Renaissance: 'renaissance',
    Industrial: 'industrial',
    Modern: 'modern',
    Future: 'future'
};

const eraFrame = {
    Ancient: 'Early communities used',
    Classical: 'Complex states and cities used',
    Medieval: 'Guilds, courts, monasteries, and towns used',
    Renaissance: 'Workshops, merchants, navies, and scholars used',
    Industrial: 'Factories, utilities, laboratories, and cities used',
    Modern: 'Networked institutions and automated systems used',
    Future: 'Advanced automated societies could use'
};

const anchors = {
    Ancient: {
        base: ['writing', 'labor_specialization'],
        agriculture: ['agriculture', 'pottery_storage_amphorae'],
        materials: ['bronze_working', 'woodworking_basic'],
        energy: ['charcoal_production', 'fire_control'],
        transport: ['wheeled_vehicles', 'wooden_sledges'],
        computing: ['writing', 'clay_tablet_receipts'],
        media: ['oral_tradition_storytelling', 'writing'],
        medicine: ['herbalism', 'primitive_surgery_trepanation'],
        science: ['calendars', 'field_boundary_survey_stones'],
        governance: ['taxation_and_tribute', 'census'],
        finance: ['barter', 'clay_tablet_receipts'],
        infrastructure: ['basic_shelter', 'irrigation_canals_local'],
        security: ['organized_warfare', 'atlatl_spear_throwers'],
        space: ['calendars', 'oral_tradition_storytelling'],
        culture: ['shamanism_animism', 'ochre_pigment_processing']
    },
    Classical: {
        base: ['bureaucracy', 'geometry'],
        agriculture: ['state_grain_price_controls', 'tax_accounting'],
        materials: ['glassmaking', 'concrete'],
        energy: ['water_clock_timekeeping', 'public_bath_heating'],
        transport: ['roads', 'harbor_customs_houses'],
        computing: ['libraries', 'court_transcript_scribes'],
        media: ['libraries', 'postal_relay_systems'],
        medicine: ['pharmacopoeia', 'medical_case_notes'],
        science: ['geometry', 'astrolabe_early'],
        governance: ['bureaucracy', 'tax_accounting'],
        finance: ['currency', 'harbor_customs_houses'],
        infrastructure: ['aqueducts', 'concrete'],
        security: ['organized_military_formations', 'military_field_medicine'],
        space: ['astrolabe_early', 'water_clock_timekeeping'],
        culture: ['theater_stage_machinery', 'glass_mosaic_tesserae']
    },
    Medieval: {
        base: ['guilds', 'universities'],
        agriculture: ['crop_rotation_three_field', 'watermills'],
        materials: ['advanced_metallurgy_medieval', 'fulling_mills'],
        energy: ['watermills', 'windmills'],
        transport: ['compass', 'port_crane_harbor_works'],
        computing: ['universities', 'mechanical_clocks'],
        media: ['paper_making', 'monastic_scriptoria'],
        medicine: ['hospitals_early', 'university_medical_studies'],
        science: ['universities_research_curricula', 'astrolabe_quadrant'],
        governance: ['market_town_charters', 'guilds'],
        finance: ['banking_early_forms', 'bills_of_exchange_early_finance'],
        infrastructure: ['gothic_architecture', 'municipal_fire_watch'],
        security: ['cannons', 'castle_signal_beacons'],
        space: ['astrolabe_quadrant', 'mechanical_clocks'],
        culture: ['monastic_scriptoria', 'mechanical_bell_striking']
    },
    Renaissance: {
        base: ['printing_press', 'scientific_method'],
        agriculture: ['experimental_botany_gardens', 'chemical_recipe_books'],
        materials: ['chemical_assay_laboratories', 'standardized_typefounding'],
        energy: ['clockwork_mechanisms', 'experimental_mining_assays'],
        transport: ['cartography', 'merchant_marine_registry'],
        computing: ['mechanical_calculators_early', 'calculus_formalization'],
        media: ['printing_press', 'newspaper_periodicals'],
        medicine: ['anatomical_theater_design', 'chemical_recipe_books'],
        science: ['scientific_method', 'telescope'],
        governance: ['patent_systems', 'military_engineer_corps'],
        finance: ['double_entry_bookkeeping', 'joint_stock_companies'],
        infrastructure: ['military_engineer_corps', 'precision_map_engraving'],
        security: ['naval_gunnery_tables', 'cannons'],
        space: ['telescope', 'observatory_star_catalogs'],
        culture: ['printed_music_notation', 'public_art_academies']
    },
    Industrial: {
        base: ['steam_engine', 'electricity'],
        agriculture: ['chemical_fertilizers', 'industrial_canning_lines'],
        materials: ['precision_machine_tools', 'bessemer_steel_conversion'],
        energy: ['steam_turbine_power_generation', 'electrical_grid_early_distribution'],
        transport: ['railroads', 'internal_combustion_engine'],
        computing: ['typewriter_office_workflows', 'scientific_management_time_studies'],
        media: ['telegraph', 'photographic_halftone_printing'],
        medicine: ['vaccination', 'public_health_laboratories'],
        science: ['radioactivity_discovery', 'laboratory_diagnostic_medicine'],
        governance: ['labor_unions_collective_bargaining', 'industrial_safety_codes'],
        finance: ['telephone_directory_services', 'telegraph_news_tickers'],
        infrastructure: ['urban_water_chlorination', 'urban_electric_subways'],
        security: ['electric_arc_lighting', 'railway_signal_interlocking'],
        space: ['radioactivity_discovery', 'electric_arc_lighting'],
        culture: ['photographic_halftone_printing', 'newspaper_periodicals']
    },
    Modern: {
        base: ['internet', 'computers_early'],
        agriculture: ['gps_guided_logistics', 'satellite_remote_sensing'],
        materials: ['computer_aided_manufacturing_cam_systems', '3d_printing_additive_manufacturing'],
        energy: ['solar_photovoltaics', 'renewable_microgrids'],
        transport: ['gps_guided_logistics', 'ride_hailing_platforms'],
        computing: ['internet', 'cloud_computing_distributed_systems'],
        media: ['world_wide_web', 'social_media'],
        medicine: ['electronic_health_records', 'dna_sequencing'],
        science: ['cloud_data_warehouses', 'satellite_remote_sensing'],
        governance: ['digital_identity_federation', 'cybersecurity_operations_centers'],
        finance: ['digital_payment_wallets', 'blockchain_cryptocurrency'],
        infrastructure: ['digital_twin_infrastructure', 'internet_of_things_iot_ubiquitous_connectivity'],
        security: ['cyber_threat_intelligence', 'cybersecurity_operations_centers'],
        space: ['satellite_technology', 'space_stations'],
        culture: ['streaming_music_platforms', 'social_media_content_moderation']
    },
    Future: {
        base: ['large_language_models', 'nanotechnology'],
        agriculture: ['vertical_farming_megafarms', 'synthetic_food_bioreactors'],
        materials: ['nanotechnology', 'quantum_materials_foundries'],
        energy: ['fusion_power', 'space_based_solar_power'],
        transport: ['fusion_rockets', 'space_elevators'],
        computing: ['quantum_computing', 'large_language_models'],
        media: ['ai_personal_memory_systems', 'quantum_internet'],
        medicine: ['synthetic_biology', 'ai_clinical_care_networks'],
        science: ['ai_scientist_automated_discovery', 'quantum_sensors_high_precision_measurement'],
        governance: ['ai_governance_ethics_frameworks_robust', 'ai_treaty_verification_systems'],
        finance: ['quantum_secured_financial_networks', 'ai_mediated_supply_negotiation'],
        infrastructure: ['robotic_construction_swarms', 'self_healing_civil_infrastructure'],
        security: ['quantum_encryption', 'ai_model_auditing'],
        space: ['space_colonization', 'space_resource_refineries'],
        culture: ['ai_cultural_memory_archives', 'ai_personal_tutoring_companions']
    }
};

const branchDefs = [
    ['agriculture', 'Agriculture & Food', ['farm', 'crop', 'grain', 'seed', 'irrigation', 'food', 'fermentation', 'harvest'], ['sorting', 'drying', 'storage', 'grading', 'watering', 'breeding', 'milling', 'preservation', 'distribution', 'testing'], ['grain', 'seed', 'root_crop', 'orchard', 'vineyard', 'dairy', 'fishery', 'bakery', 'spice', 'pulse', 'oilseed', 'pasture']],
    ['materials', 'Materials & Manufacturing', ['tool', 'metal', 'glass', 'ceramic', 'textile', 'manufacturing', 'alloy', 'composite'], ['casting', 'forging', 'weaving', 'cutting', 'polishing', 'coating', 'laminating', 'annealing', 'molding', 'machining'], ['copper', 'iron', 'steel', 'glass', 'ceramic', 'wood', 'leather', 'fiber', 'polymer', 'stone', 'clay', 'composite']],
    ['energy', 'Energy & Power', ['power', 'energy', 'fuel', 'turbine', 'battery', 'grid', 'motor', 'steam'], ['generation', 'storage', 'metering', 'conversion', 'distribution', 'control', 'insulation', 'recovery', 'balancing', 'ignition'], ['fire', 'charcoal', 'coal', 'steam', 'wind', 'water', 'solar', 'battery', 'hydrogen', 'thermal', 'electric', 'fusion']],
    ['transport', 'Transport & Logistics', ['transport', 'logistics', 'road', 'ship', 'rail', 'harbor', 'navigation', 'supply'], ['routing', 'loading', 'signaling', 'scheduling', 'tracking', 'maintenance', 'docking', 'packing', 'dispatch', 'navigation'], ['cart', 'wagon', 'boat', 'ship', 'road', 'bridge', 'canal', 'rail', 'truck', 'drone', 'warehouse', 'port']],
    ['computing', 'Computing & AI', ['computer', 'data', 'software', 'algorithm', 'ai', 'database', 'cloud', 'neural'], ['indexing', 'scheduling', 'reasoning', 'compression', 'simulation', 'training', 'querying', 'orchestration', 'monitoring', 'optimization'], ['ledger', 'table', 'database', 'network', 'compiler', 'model', 'sensor', 'robot', 'interface', 'cluster', 'cache', 'agent']],
    ['media', 'Communication & Media', ['writing', 'paper', 'printing', 'media', 'communication', 'radio', 'web', 'library'], ['copying', 'broadcasting', 'archiving', 'captioning', 'publishing', 'routing', 'encoding', 'translation', 'indexing', 'moderation'], ['tablet', 'scroll', 'book', 'newspaper', 'signal', 'poster', 'photograph', 'film', 'web', 'message', 'archive', 'catalog']],
    ['medicine', 'Medicine & Biology', ['medicine', 'medical', 'health', 'hospital', 'bio', 'gene', 'cell', 'pharma'], ['diagnosis', 'sterilization', 'dosing', 'screening', 'triage', 'imaging', 'therapy', 'sequencing', 'culturing', 'monitoring'], ['herb', 'wound', 'vaccine', 'clinic', 'organ', 'cell', 'protein', 'pathogen', 'implant', 'drug', 'genome', 'neural']],
    ['science', 'Science & Mathematics', ['scientific', 'measurement', 'physics', 'chemistry', 'math', 'astronomy', 'clock', 'surveying'], ['measuring', 'calibrating', 'mapping', 'modeling', 'sampling', 'observing', 'classifying', 'forecasting', 'computing', 'standardizing'], ['angle', 'time', 'mass', 'temperature', 'star', 'soil', 'fluid', 'chemical', 'weather', 'specimen', 'spectrum', 'field']],
    ['governance', 'Society & Governance', ['governance', 'law', 'tax', 'public', 'school', 'military', 'census', 'bureaucracy'], ['registration', 'inspection', 'licensing', 'adjudication', 'planning', 'training', 'reporting', 'auditing', 'credentialing', 'coordination'], ['court', 'school', 'tax', 'census', 'permit', 'military', 'election', 'public_health', 'registry', 'standard', 'charter', 'office']],
    ['finance', 'Finance & Commerce', ['finance', 'market', 'trade', 'bank', 'credit', 'insurance', 'accounting', 'merchant'], ['pricing', 'clearing', 'settlement', 'auditing', 'risk_scoring', 'brokerage', 'inventory', 'credit_rating', 'exchange', 'reconciliation'], ['coin', 'account', 'loan', 'contract', 'cargo', 'market', 'retail', 'bank', 'invoice', 'insurance', 'portfolio', 'auction']],
    ['infrastructure', 'Infrastructure & Cities', ['urban', 'water', 'construction', 'building', 'sewer', 'housing', 'municipal', 'bridge'], ['drainage', 'paving', 'zoning', 'inspection', 'repair', 'ventilation', 'lighting', 'pumping', 'metering', 'reinforcement'], ['well', 'street', 'wall', 'roof', 'bridge', 'canal', 'sewer', 'housing', 'station', 'tower', 'tunnel', 'district']],
    ['security', 'Security & Defense', ['security', 'defense', 'military', 'weapon', 'armor', 'cyber', 'surveillance', 'encryption'], ['detection', 'fortification', 'targeting', 'authentication', 'patrol', 'hardening', 'drilling', 'warning', 'camouflage', 'response'], ['gate', 'armor', 'signal', 'border', 'cipher', 'radar', 'drone', 'missile', 'firewall', 'bunker', 'watch', 'arsenal']],
    ['space', 'Space & Far Future', ['space', 'satellite', 'orbital', 'lunar', 'mars', 'asteroid', 'interstellar', 'terraform'], ['tracking', 'launching', 'docking', 'mining', 'shielding', 'habitat_control', 'propulsion', 'navigation', 'construction', 'recycling'], ['satellite', 'orbital_station', 'lunar_base', 'mars_farm', 'asteroid_mine', 'probe', 'habitat', 'solar_sail', 'lander', 'propellant', 'radiation', 'telescope']],
    ['culture', 'Arts & Culture', ['art', 'music', 'theater', 'ritual', 'literature', 'painting', 'sculpture', 'storytelling'], ['composition', 'notation', 'staging', 'preservation', 'teaching', 'performance', 'curation', 'restoration', 'reproduction', 'cataloging'], ['song', 'drama', 'mural', 'statue', 'costume', 'instrument', 'story', 'festival', 'museum', 'script', 'pattern', 'ritual']]
];

const eraBranchPools = {
    Ancient: {
        materials: [['tool', 'metal', 'stone', 'bronze', 'ceramic', 'pottery', 'textile', 'basketry'], ['chipping', 'grinding', 'firing', 'casting', 'polishing', 'binding', 'weaving', 'sewing', 'drying', 'shaping'], ['flint', 'bone', 'hide', 'clay', 'copper', 'bronze', 'reed', 'fiber', 'basket', 'bead', 'sickle', 'awl']],
        energy: [['fire', 'charcoal', 'fuel', 'kiln', 'lamp', 'hearth', 'furnace', 'draft'], ['kindling', 'banking', 'stoking', 'venting', 'drying', 'firing', 'smelting', 'lighting', 'heating', 'cooking'], ['hearth', 'charcoal_pit', 'oil_lamp', 'kiln', 'furnace', 'bellows', 'fuel_stack', 'cooking_fire', 'torch', 'brazier', 'drying_rack', 'smokehouse']],
        transport: [['transport', 'road', 'boat', 'cart', 'harbor', 'trail', 'bridge', 'logistics'], ['hauling', 'lashing', 'loading', 'fording', 'paddling', 'portaging', 'packing', 'sledging', 'marking', 'repair'], ['sledge', 'canoe', 'cart', 'pack_animal', 'trail', 'ford', 'raft', 'ferry', 'causeway', 'tow_rope', 'harbor_beach', 'way_marker']],
        computing: [['writing', 'tally', 'accounting', 'calendar', 'record', 'ledger', 'seal', 'tablet'], ['counting', 'notching', 'tabulating', 'sealing', 'indexing', 'dating', 'listing', 'auditing', 'matching', 'archiving'], ['tally_stick', 'clay_token', 'tablet', 'seal', 'calendar_board', 'warehouse_list', 'tax_mark', 'measure_table', 'scribe_kit', 'boundary_record', 'ration_token', 'delivery_tag']],
        media: [['writing', 'storytelling', 'inscription', 'tablet', 'scroll', 'signal', 'ritual', 'archive'], ['reciting', 'carving', 'copying', 'marking', 'announcing', 'memorizing', 'sealing', 'displaying', 'teaching', 'preserving'], ['story', 'clay_tablet', 'seal_mark', 'stone_inscription', 'drum_signal', 'banner', 'ritual_text', 'genealogy', 'trade_notice', 'temple_record', 'law_marker', 'song_cycle']],
        medicine: [['medicine', 'health', 'herbal', 'wound', 'surgery', 'bone', 'birth', 'sanitation'], ['dressing', 'splinting', 'boiling', 'drying', 'mixing', 'binding', 'observing', 'massaging', 'fumigating', 'storing'], ['poultice', 'splint', 'herb_bundle', 'wound_wrap', 'birthing_mat', 'tooth_tool', 'salve_pot', 'wash_basin', 'bone_needle', 'smoke_treatment', 'bandage', 'healing_charm']],
        science: [['measurement', 'calendar', 'astronomy', 'surveying', 'geometry', 'weight', 'weather', 'counting'], ['measuring', 'sighting', 'weighing', 'marking', 'aligning', 'forecasting', 'counting', 'sampling', 'comparing', 'recording'], ['shadow_post', 'star_marker', 'measuring_cord', 'balance_weight', 'flood_mark', 'field_line', 'grain_measure', 'season_calendar', 'angle_staff', 'weather_sign', 'boundary_stone', 'leveling_trench']],
        governance: [['governance', 'law', 'tax', 'public', 'census', 'bureaucracy', 'military', 'state'], ['registering', 'counting', 'inspecting', 'proclaiming', 'taxing', 'assigning', 'rationing', 'judging', 'mustering', 'recording'], ['tax_tablet', 'census_list', 'ration_queue', 'temple_office', 'boundary_claim', 'work_crew', 'tribute_store', 'law_stone', 'scribe_seal', 'militia_roster', 'market_rule', 'canal_order']],
        finance: [['finance', 'trade', 'barter', 'market', 'accounting', 'merchant', 'credit', 'currency'], ['weighing', 'bartering', 'recording', 'sealing', 'pricing', 'storing', 'exchanging', 'auditing', 'measuring', 'pledging'], ['grain_account', 'silver_weight', 'trade_token', 'market_stall', 'warehouse_receipt', 'debt_tablet', 'cargo_seal', 'merchant_scale', 'ration_account', 'livestock_pledge', 'tax_receipt', 'temple_loan']],
        infrastructure: [['urban', 'water', 'construction', 'building', 'well', 'wall', 'bridge', 'shelter'], ['digging', 'lining', 'roofing', 'paving', 'draining', 'raising', 'plastering', 'repairing', 'marking', 'channeling'], ['well', 'mudbrick_wall', 'reed_roof', 'granary_floor', 'irrigation_ditch', 'footbridge', 'city_gate', 'cistern', 'street_drain', 'house_foundation', 'canal_bank', 'field_wall']],
        security: [['security', 'defense', 'weapon', 'armor', 'warfare', 'watch', 'fortification', 'signal'], ['patrolling', 'guarding', 'drilling', 'stockading', 'warning', 'mustering', 'arming', 'shielding', 'tracking', 'training'], ['palisade', 'watch_fire', 'sling', 'spear', 'shield', 'gate', 'alarm_drum', 'ditch', 'lookout', 'arsenal_basket', 'war_boat', 'signal_hill']],
        culture: [['art', 'music', 'ritual', 'storytelling', 'painting', 'sculpture', 'myth', 'festival'], ['painting', 'carving', 'singing', 'dancing', 'masking', 'offering', 'teaching', 'preserving', 'patterning', 'performing'], ['cave_panel', 'drum', 'flute', 'mask', 'figurine', 'beadwork', 'body_paint', 'festival_fire', 'myth_cycle', 'grave_goods', 'ritual_vessel', 'dance_ground']]
    },
    Classical: {
        materials: [['tool', 'metal', 'glass', 'ceramic', 'bronze', 'iron', 'textile', 'concrete'], ['casting', 'forging', 'blowing', 'firing', 'polishing', 'weaving', 'molding', 'cutting', 'annealing', 'joining'], ['glass_cup', 'bronze_fitting', 'iron_clamp', 'ceramic_pipe', 'concrete_block', 'loom_cloth', 'marble_slab', 'lead_sheet', 'mosaic_tile', 'wooden_form', 'coin_blank', 'roof_tile']],
        energy: [['water', 'fuel', 'heating', 'lamp', 'furnace', 'kiln', 'power', 'draft'], ['heating', 'venting', 'metering', 'firing', 'stoking', 'circulating', 'lifting', 'pressing', 'lighting', 'draining'], ['hypocaust', 'water_wheel', 'oil_lamp', 'bath_furnace', 'kiln', 'bellows', 'screw_pump', 'press_beam', 'lamp_oil', 'heated_room', 'cistern_flow', 'forge_fire']],
        transport: [['transport', 'road', 'ship', 'harbor', 'bridge', 'canal', 'navigation', 'logistics'], ['routing', 'paving', 'loading', 'docking', 'towing', 'surveying', 'signaling', 'stabling', 'warehousing', 'repairing'], ['road_station', 'merchant_ship', 'cart', 'bridge', 'canal_lock', 'harbor_crane', 'milestone', 'pack_train', 'ferry', 'grain_barge', 'drydock', 'relay_stable']],
        computing: [['writing', 'abacus', 'table', 'record', 'ledger', 'library', 'algorithm', 'accounting'], ['tabulating', 'copying', 'filing', 'calculating', 'cataloging', 'auditing', 'sealing', 'summarizing', 'sorting', 'cross_referencing'], ['abacus_board', 'tax_table', 'census_roll', 'court_record', 'library_catalog', 'astronomy_table', 'merchant_ledger', 'military_roster', 'warehouse_receipt', 'survey_register', 'calendar_table', 'edict_copy']],
        media: [['writing', 'library', 'postal', 'book', 'inscription', 'communication', 'scroll', 'archive'], ['copying', 'dispatching', 'cataloging', 'posting', 'announcing', 'translating', 'binding', 'sealing', 'preserving', 'reading'], ['scroll', 'codex', 'edict_board', 'postal_tablet', 'library_shelf', 'theater_program', 'coin_inscription', 'temple_record', 'messenger_packet', 'school_text', 'map_copy', 'news_notice']],
        medicine: [['medicine', 'medical', 'hospital', 'surgery', 'anatomy', 'pharma', 'health', 'veterinary'], ['diagnosing', 'dosing', 'bandaging', 'triaging', 'recording', 'compounding', 'teaching', 'isolating', 'washing', 'observing'], ['clinic_bench', 'field_bandage', 'drug_jar', 'case_note', 'surgical_hook', 'anatomy_chart', 'hospital_cot', 'veterinary_splint', 'bath_regimen', 'midwife_kit', 'herbarium', 'medical_oath']],
        finance: [['finance', 'market', 'trade', 'bank', 'credit', 'accounting', 'coin', 'merchant'], ['pricing', 'weighing', 'minting', 'clearing', 'taxing', 'recording', 'lending', 'auditing', 'exchanging', 'warehousing'], ['coin_chest', 'market_scale', 'tax_receipt', 'customs_table', 'merchant_contract', 'loan_tablet', 'grain_bank', 'auction_stall', 'cargo_manifest', 'mint_die', 'rent_roll', 'account_scroll']],
        infrastructure: [['urban', 'water', 'construction', 'building', 'sewer', 'bridge', 'aqueduct', 'municipal'], ['paving', 'draining', 'vaulting', 'surveying', 'lining', 'repairing', 'channeling', 'roofing', 'inspecting', 'metering'], ['aqueduct_channel', 'sewer_culvert', 'stone_bridge', 'bath_floor', 'city_wall', 'street_paving', 'forum_portico', 'harbor_mole', 'cistern', 'market_hall', 'theater_seat', 'road_curb']],
        security: [['security', 'defense', 'military', 'weapon', 'armor', 'fortification', 'watch', 'signal'], ['patrolling', 'fortifying', 'drilling', 'signaling', 'mustering', 'arming', 'sieging', 'guarding', 'mapping', 'supplying'], ['city_gate', 'watchtower', 'shield_wall', 'siege_engine', 'armor_scale', 'military_depot', 'signal_flag', 'frontier_fort', 'supply_cart', 'naval_ram', 'drill_yard', 'guard_post']]
    },
    Medieval: {
        materials: [['tool', 'metal', 'iron', 'steel', 'glass', 'textile', 'manufacturing', 'leather'], ['forging', 'casting', 'tempering', 'weaving', 'fulling', 'tanning', 'grinding', 'polishing', 'riveting', 'glazing'], ['iron_hinge', 'steel_blade', 'wool_cloth', 'leather_boot', 'glass_pane', 'mill_gear', 'bell_mold', 'tile_kiln', 'chain_link', 'horseshoe', 'loom_beam', 'barrel_hoop']],
        energy: [['water', 'wind', 'mill', 'fuel', 'forge', 'power', 'heating', 'charcoal'], ['grinding', 'pumping', 'fulling', 'sawing', 'stoking', 'drafting', 'gearing', 'pressing', 'venting', 'drying'], ['watermill', 'windmill', 'millpond', 'forge', 'charcoal_heap', 'bellows', 'gear_train', 'oil_press', 'malt_kiln', 'bath_stove', 'sawmill', 'millrace']],
        transport: [['transport', 'ship', 'road', 'bridge', 'harbor', 'navigation', 'logistics', 'cart'], ['routing', 'convoying', 'loading', 'piloting', 'bridging', 'stabling', 'tolling', 'packing', 'signaling', 'repairing'], ['cog_ship', 'packhorse', 'toll_bridge', 'harbor_crane', 'pilgrim_road', 'merchant_cart', 'canal_cut', 'ferry_chain', 'wayhouse', 'sail_rig', 'dockyard', 'caravan']],
        computing: [['record', 'table', 'clock', 'accounting', 'calendar', 'library', 'calculation', 'archive'], ['tabulating', 'copying', 'reckoning', 'cataloging', 'scheduling', 'auditing', 'filing', 'indexing', 'summarizing', 'dating'], ['exchequer_table', 'abbey_archive', 'clock_dial', 'merchant_ledger', 'university_chart', 'tax_roll', 'manor_account', 'astronomy_table', 'scriptorium_index', 'guild_register', 'calendar_wheel', 'rent_book']],
        media: [['paper', 'book', 'library', 'scriptorium', 'postal', 'printing', 'communication', 'manuscript'], ['copying', 'illuminating', 'binding', 'cataloging', 'dispatching', 'posting', 'reading', 'translating', 'indexing', 'preserving'], ['manuscript', 'charter_copy', 'guild_notice', 'paper_sheet', 'book_chain', 'messenger_bag', 'woodblock_print', 'sermon_text', 'library_desk', 'watermark', 'music_notation', 'legal_roll']],
        medicine: [['medicine', 'hospital', 'pharmacy', 'health', 'surgery', 'quarantine', 'herbal', 'medical'], ['compounding', 'nursing', 'isolating', 'bandaging', 'teaching', 'recording', 'washing', 'dosing', 'triaging', 'inspecting'], ['hospital_ward', 'apothecary_jar', 'plague_house', 'herb_garden', 'surgical_knife', 'urine_flask', 'patient_register', 'bandage_roll', 'quarantine_gate', 'medical_lecture', 'charity_bed', 'pharmacy_shelf']],
        finance: [['finance', 'market', 'trade', 'bank', 'credit', 'insurance', 'accounting', 'merchant'], ['pricing', 'clearing', 'lending', 'recording', 'auditing', 'weighing', 'warehousing', 'pledging', 'exchanging', 'guaranteeing'], ['bill_of_exchange', 'merchant_ledger', 'guild_fee', 'market_toll', 'wool_contract', 'banker_table', 'cargo_bond', 'fair_stall', 'rent_roll', 'coin_chest', 'loan_pledge', 'insurance_pool']],
        infrastructure: [['urban', 'water', 'construction', 'building', 'bridge', 'housing', 'municipal', 'wall'], ['paving', 'draining', 'roofing', 'timbering', 'vaulting', 'repairing', 'dredging', 'fortifying', 'inspecting', 'lighting'], ['town_wall', 'market_hall', 'stone_bridge', 'timber_roof', 'well_house', 'millrace', 'street_gutter', 'guildhall', 'harbor_quay', 'gate_tower', 'almshouse', 'public_fountain']],
        security: [['security', 'defense', 'military', 'castle', 'armor', 'weapon', 'fortification', 'signal'], ['fortifying', 'patrolling', 'garrisoning', 'mustering', 'armoring', 'signaling', 'besieging', 'guarding', 'drilling', 'supplying'], ['castle_gate', 'crossbow', 'cannon', 'chain_mail', 'signal_beacon', 'town_wall', 'moat', 'armory', 'watch_roster', 'gatehouse', 'siege_tower', 'militia_drill']]
    },
    Renaissance: {
        materials: [['tool', 'metal', 'glass', 'steel', 'textile', 'manufacturing', 'casting', 'instrument'], ['casting', 'engraving', 'polishing', 'tempering', 'weaving', 'grinding', 'printing', 'assaying', 'turning', 'lacquering'], ['lens_blank', 'brass_gear', 'steel_spring', 'velvet_cloth', 'printing_type', 'glass_lens', 'cannon_mold', 'instrument_scale', 'paper_sheet', 'copper_plate', 'clock_part', 'map_plate']],
        energy: [['water', 'wind', 'fuel', 'mill', 'clockwork', 'furnace', 'power', 'draft'], ['pumping', 'gearing', 'smelting', 'stoking', 'pressing', 'lifting', 'venting', 'winding', 'grinding', 'draining'], ['mine_pump', 'waterwheel', 'windmill', 'blast_furnace', 'clock_spring', 'forge_fire', 'bellows', 'printing_press_screw', 'ore_roaster', 'powder_mill', 'oil_press', 'canal_pump']],
        transport: [['transport', 'ship', 'navigation', 'map', 'harbor', 'logistics', 'canal', 'road'], ['charting', 'piloting', 'loading', 'convoying', 'surveying', 'scheduling', 'warehousing', 'dredging', 'signaling', 'repairing'], ['caravel', 'galleon', 'portolan_chart', 'drydock', 'canal_gate', 'mail_coach', 'harbor_registry', 'ship_log', 'cargo_manifest', 'pilot_book', 'dock_crane', 'road_survey']],
        computing: [['calculator', 'table', 'accounting', 'mathematics', 'algorithm', 'clock', 'data', 'record'], ['calculating', 'tabulating', 'indexing', 'filing', 'auditing', 'modeling', 'scheduling', 'cataloging', 'encoding', 'checking'], ['calculating_wheel', 'log_table', 'ledger_page', 'cipher_table', 'astronomy_ephemeris', 'instrument_scale', 'patent_index', 'navigation_table', 'book_catalog', 'survey_grid', 'clock_train', 'recipe_index']],
        media: [['printing', 'book', 'paper', 'newspaper', 'communication', 'library', 'illustration', 'publication'], ['printing', 'engraving', 'binding', 'publishing', 'advertising', 'translating', 'indexing', 'cataloging', 'copying', 'distributing'], ['pamphlet', 'newspaper', 'engraved_plate', 'music_sheet', 'map_sheet', 'printer_mark', 'book_catalog', 'play_script', 'patent_notice', 'broadsheet', 'type_case', 'scientific_plate']],
        medicine: [['medicine', 'anatomy', 'surgery', 'pharmacy', 'hospital', 'health', 'botany', 'medical'], ['dissecting', 'compounding', 'illustrating', 'teaching', 'dosing', 'cataloging', 'observing', 'sterilizing', 'recording', 'testing'], ['anatomy_plate', 'herbarium_sheet', 'pharmacy_recipe', 'surgical_probe', 'hospital_register', 'lecture_theater', 'distillation_flask', 'medical_casebook', 'botany_garden', 'remedy_catalog', 'midwife_manual', 'lens_exam']],
        finance: [['finance', 'market', 'trade', 'bank', 'credit', 'insurance', 'accounting', 'merchant'], ['pricing', 'clearing', 'auditing', 'brokering', 'underwriting', 'recording', 'exchanging', 'reconciling', 'lending', 'contracting'], ['merchant_ledger', 'bill_of_exchange', 'insurance_pool', 'cargo_contract', 'joint_stock_share', 'bank_note', 'customs_account', 'auction_notice', 'partnership_book', 'broker_desk', 'credit_letter', 'warehouse_bond']],
        infrastructure: [['urban', 'water', 'construction', 'building', 'bridge', 'canal', 'fortification', 'public_works'], ['surveying', 'dredging', 'paving', 'vaulting', 'draining', 'reinforcing', 'inspecting', 'plotting', 'roofing', 'repairing'], ['canal_lock', 'stone_bridge', 'city_square', 'bastion_wall', 'water_conduit', 'market_loggia', 'shipyard_shed', 'arsenal_yard', 'theater_floor', 'plague_house', 'garden_wall', 'street_plan']],
        security: [['security', 'defense', 'military', 'weapon', 'fortification', 'cipher', 'naval', 'artillery'], ['fortifying', 'ranging', 'drilling', 'ciphering', 'mustering', 'mapping', 'signaling', 'casting', 'aiming', 'supplying'], ['star_fort', 'cannon_table', 'musket_drill', 'cipher_wheel', 'powder_magazine', 'naval_gun', 'siege_map', 'engineer_corps', 'signal_flag', 'arsenal_record', 'bastion_wall', 'range_staff']]
    },
    Industrial: {
        agriculture: [['agriculture', 'farm', 'crop', 'food', 'fertilizer', 'harvest', 'dairy', 'grain'], ['processing', 'canning', 'milling', 'drying', 'refrigerating', 'fertilizing', 'grading', 'shipping', 'testing', 'mechanizing'], ['creamery', 'grain_elevator', 'canning_line', 'fertilizer_bag', 'reaper', 'tractor_proto', 'meatpacking_floor', 'cold_store', 'seed_catalog', 'sugar_refinery', 'flour_mill', 'rail_silo']],
        energy: [['steam', 'coal', 'electric', 'power', 'motor', 'turbine', 'battery', 'grid'], ['generating', 'metering', 'wiring', 'stoking', 'condensing', 'insulating', 'switching', 'distributing', 'regulating', 'recovering'], ['steam_boiler', 'coal_bunker', 'dynamo', 'street_lamp', 'substation', 'lead_acid_battery', 'turbine_hall', 'power_meter', 'tram_motor', 'gas_main', 'factory_shaft', 'switchgear']],
        transport: [['transport', 'logistics', 'rail', 'ship', 'road', 'harbor', 'canal', 'automobile'], ['routing', 'signaling', 'loading', 'scheduling', 'dispatching', 'refrigerating', 'switching', 'docking', 'ticketing', 'repairing'], ['railcar', 'steamship', 'tramway', 'locomotive', 'canal_barge', 'freight_depot', 'signal_box', 'harbor_crane', 'motor_bus', 'refrigerator_car', 'ticket_office', 'warehouse_platform']],
        computing: [['typewriter', 'record', 'punch_card', 'accounting', 'table', 'office', 'data', 'calculator'], ['typing', 'filing', 'tabulating', 'sorting', 'duplicating', 'auditing', 'scheduling', 'indexing', 'metering', 'calculating'], ['typewriter', 'card_file', 'punch_card', 'time_clock', 'cash_register', 'slide_rule', 'office_ledger', 'switchboard_log', 'factory_ticket', 'mail_sorter', 'statistical_table', 'work_order']],
        media: [['telegraph', 'telephone', 'radio', 'printing', 'newspaper', 'photography', 'communication', 'media'], ['printing', 'transmitting', 'typesetting', 'photographing', 'broadcasting', 'captioning', 'wiring', 'routing', 'duplicating', 'archiving'], ['telegraph_key', 'telephone_exchange', 'halftone_plate', 'newspaper_press', 'photograph_card', 'radio_set', 'poster_bill', 'linotype_slug', 'news_ticker', 'catalog_page', 'phonograph_disc', 'wire_service']],
        medicine: [['medicine', 'medical', 'hospital', 'health', 'vaccine', 'laboratory', 'sanitation', 'surgery'], ['diagnosing', 'sterilizing', 'vaccinating', 'recording', 'screening', 'imaging', 'compounding', 'testing', 'monitoring', 'inspecting'], ['vaccination_card', 'public_health_lab', 'surgical_lamp', 'xray_plate', 'hospital_ward', 'water_test', 'milk_sample', 'antiseptic_spray', 'clinic_register', 'quarantine_notice', 'medicine_bottle', 'diagnostic_slide']],
        security: [['security', 'defense', 'military', 'weapon', 'armor', 'signal', 'surveillance', 'fortification'], ['signaling', 'rifling', 'armoring', 'patrolling', 'telegraphing', 'ranging', 'drilling', 'inspecting', 'hardening', 'warning'], ['rifle', 'ironclad', 'signal_lamp', 'coastal_fort', 'armored_train', 'rangefinder', 'munitions_line', 'police_callbox', 'watch_clock', 'mine_detector', 'bunker_door', 'naval_mine']],
        space: null
    },
    Modern: {
        space: [['space', 'satellite', 'orbital', 'rocket', 'lunar', 'mars', 'probe', 'telescope'], ['tracking', 'launching', 'docking', 'imaging', 'navigating', 'relaying', 'sampling', 'shielding', 'commanding', 'recovering'], ['satellite', 'orbital_station', 'lunar_lander', 'mars_rover', 'space_telescope', 'rocket_stage', 'probe', 'ground_station', 'spacesuit', 'launch_pad', 'reentry_capsule', 'solar_array']]
    },
    Future: {
        space: [['space', 'satellite', 'orbital', 'lunar', 'mars', 'asteroid', 'interstellar', 'terraform'], ['tracking', 'launching', 'docking', 'mining', 'shielding', 'habitat_control', 'propulsion', 'navigation', 'construction', 'recycling'], ['satellite', 'orbital_station', 'lunar_base', 'mars_farm', 'asteroid_mine', 'probe', 'habitat', 'solar_sail', 'lander', 'propellant', 'radiation', 'telescope']]
    }
};

const modifiers = [
    'portable', 'modular', 'standardized', 'specialized', 'high_capacity', 'low_cost', 'precision',
    'distributed', 'automated', 'resilient', 'community', 'regional', 'high_reliability', 'adaptive',
    'sealed', 'open', 'rapid', 'continuous', 'seasonal', 'remote', 'cooperative', 'regulated',
    'low_waste', 'high_throughput', 'field_ready', 'compact', 'large_scale', 'redundant'
];

function slug(value) {
    return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function title(value) {
    return value.split('_').map(part => part ? part[0].toUpperCase() + part.slice(1) : '').join(' ');
}

function loadExistingIds() {
    const ids = new Set();
    for (const file of fs.readdirSync(DATA_DIR)) {
        if (!file.endsWith('.json') || file === 'taxonomy.json') continue;
        for (const item of JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'))) {
            ids.add(item.id);
        }
    }
    return ids;
}

function assertAnchors(existingIds) {
    const missing = [];
    for (const [era, eraAnchors] of Object.entries(anchors)) {
        for (const [branch, ids] of Object.entries(eraAnchors)) {
            for (const id of ids) {
                if (!existingIds.has(id)) missing.push(`${era}.${branch}: ${id}`);
            }
        }
    }
    if (missing.length) {
        throw new Error(`Missing anchor ids:\n${missing.map(id => `- ${id}`).join('\n')}`);
    }
}

function makeRow(era, branchDef, index, existingIds, generatedIds) {
    const [branchKey, branchName, defaultKeywords, defaultProcesses, defaultSubjects] = branchDef;
    const override = eraBranchPools[era]?.[branchKey];
    if (override === null || (branchKey === 'space' && era !== 'Modern' && era !== 'Future')) return null;
    const [keywords, processes, subjects] = override || [defaultKeywords, defaultProcesses, defaultSubjects];
    const modifier = modifiers[(index + branchKey.length + era.length) % modifiers.length];
    const process = processes[(index * 3 + era.length) % processes.length];
    const subject = subjects[(index * 5 + branchKey.length) % subjects.length];
    const keyword = keywords[(index * 7 + subject.length) % keywords.length];
    const suffix = String(index + 1).padStart(4, '0');
    const id = slug(`${eraSlug[era]}_${branchKey}_${modifier}_${subject}_${process}_${suffix}`);
    if (existingIds.has(id) || generatedIds.has(id)) return null;

    const adjective = title(modifier);
    const subjectName = title(subject);
    const processName = title(process);
    const name = `${adjective} ${subjectName} ${processName}`;
    const description = `${eraFrame[era]} ${modifier.replace(/_/g, ' ')} ${keyword} technology for ${process.replace(/_/g, ' ')} ${subject.replace(/_/g, ' ')} systems.`;
    const prereqs = anchors[era][branchKey] || anchors[era].base;
    return [era, id, name, description, prereqs.join(',')].join('\t');
}

function main() {
    if (!Number.isInteger(TARGET) || TARGET <= 0) throw new Error('Target must be a positive integer');
    if (!Number.isInteger(SHARD_SIZE) || SHARD_SIZE <= 0) throw new Error('Shard size must be a positive integer');

    fs.mkdirSync(OUT_DIR, { recursive: true });
    const existingIds = loadExistingIds();
    assertAnchors(existingIds);

    const rows = [];
    const generatedIds = new Set();
    let index = 0;
    while (rows.length < TARGET) {
        const era = eras[index % eras.length];
        const branchDef = branchDefs[Math.floor(index / eras.length) % branchDefs.length];
        const row = makeRow(era, branchDef, Math.floor(index / (eras.length * branchDefs.length)), existingIds, generatedIds);
        if (row) {
            const id = row.split('\t')[1];
            generatedIds.add(id);
            rows.push(row);
        }
        index += 1;
    }

    const shardCount = Math.ceil(rows.length / SHARD_SIZE);
    for (let shard = 0; shard < shardCount; shard += 1) {
        const start = shard * SHARD_SIZE;
        const end = start + SHARD_SIZE;
        const shardRows = rows.slice(start, end);
        const file = path.join(OUT_DIR, `human-tech-10k-${String(shard + 1).padStart(2, '0')}.tsv`);
        fs.writeFileSync(file, `${shardRows.join('\n')}\n`);
    }

    console.log(`Generated ${rows.length} rows across ${shardCount} shard(s) in ${path.relative(process.cwd(), OUT_DIR)}.`);
}

main();
