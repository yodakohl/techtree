const fs = require('fs');
const path = require('path');
const {
    ERA_DEFAULT_DATES,
    getDependencyEdges,
    getPrerequisiteIds,
    sourceQualityWeight
} = require('./edge-schema');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILES = fs.readdirSync(DATA_DIR)
    .filter(file => file.endsWith('.json'))
    .filter(file => file !== 'taxonomy.json')
    .sort();

const NODE_DATE_OVERRIDES = {
    fire_control: { firstKnownDate: -400000, datePrecision: 'millennium', region: 'Africa and Eurasia' },
    stone_tool_making: { firstKnownDate: -3300000, datePrecision: 'millennium', region: 'East Africa' },
    oral_tradition_storytelling: { firstKnownDate: -250000, datePrecision: 'millennium', region: 'Global / multiple regions' },
    foraging_and_botany: { firstKnownDate: -200000, datePrecision: 'millennium', region: 'Global / multiple regions' },
    early_astronomy_observation: { firstKnownDate: -3000, datePrecision: 'millennium', region: 'Mesopotamia, Egypt, China, and other early societies' },
    writing: { firstKnownDate: -3200, datePrecision: 'century', region: 'Mesopotamia and Egypt' },
    record_keeping: { firstKnownDate: -8000, datePrecision: 'millennium', region: 'Southwest Asia and other early farming societies' },
    bureaucracy: { firstKnownDate: -3000, datePrecision: 'century', region: 'Mesopotamia, Egypt, China, and other early states' },
    flash_memory: { firstKnownDate: 1984, datePrecision: 'exact', region: 'Japan / global semiconductor industry' },
    solid_state_drives_ssd_flash_memory: { firstKnownDate: 1991, datePrecision: 'decade', region: 'Global electronics industry' },
    vector_databases: { firstKnownDate: 2019, datePrecision: 'decade', region: 'Global software industry' },
    retrieval_augmented_generation: { firstKnownDate: 2020, datePrecision: 'exact', region: 'Global AI research community' },
    recommender_systems: { firstKnownDate: 1992, datePrecision: 'decade', region: 'Global software and research community' },
    transformer_architectures: { firstKnownDate: 2017, datePrecision: 'exact', region: 'Global deep-learning research community' },
    foundation_models: { firstKnownDate: 2021, datePrecision: 'exact', region: 'Global AI research community' },
    instruction_tuning_rlhf: { firstKnownDate: 2020, datePrecision: 'exact', region: 'Global AI research community' },
    crispr_adaptive_immunity: { firstKnownDate: 1987, datePrecision: 'exact', region: 'Japan and global microbiology research' },
    cas9_programmable_nuclease: { firstKnownDate: 2012, datePrecision: 'exact', region: 'Global molecular biology research' },
    single_guide_rna_design: { firstKnownDate: 2012, datePrecision: 'exact', region: 'Global molecular biology research' },
    pam_specificity_engineering: { firstKnownDate: 2012, datePrecision: 'decade', region: 'Global molecular biology research' },
    crispr_gene_editing: { firstKnownDate: 2013, datePrecision: 'exact', region: 'Global molecular biology research' },
    crispr_off_target_profiling: { firstKnownDate: 2013, datePrecision: 'decade', region: 'Global genome-editing research' },
    pooled_crispr_screens: { firstKnownDate: 2014, datePrecision: 'exact', region: 'Global functional-genomics research' },
    crispri_crispra: { firstKnownDate: 2013, datePrecision: 'exact', region: 'Global functional-genomics research' },
    crispr_delivery_aav_lnp_rnp: { firstKnownDate: 2015, datePrecision: 'decade', region: 'Global therapeutic research' },
    ex_vivo_crispr_cell_therapy: { firstKnownDate: 2016, datePrecision: 'decade', region: 'Global clinical research' },
    base_editing: { firstKnownDate: 2016, datePrecision: 'exact', region: 'Global genome-editing research' },
    zinc_finger_nucleases: { firstKnownDate: 1996, datePrecision: 'exact', region: 'United States' },
    prime_editing: { firstKnownDate: 2019, datePrecision: 'exact', region: 'Global genome-editing research' },
    cas12_cas13_editing_platforms: { firstKnownDate: 2015, datePrecision: 'decade', region: 'Global genome-editing research' },
    crispr_diagnostics: { firstKnownDate: 2016, datePrecision: 'decade', region: 'Global diagnostics research' },
    casgevy_exa_cel: { firstKnownDate: 2023, datePrecision: 'exact', region: 'United Kingdom and United States' },
    approved_crispr_therapies: { firstKnownDate: 2023, datePrecision: 'exact', region: 'United Kingdom, United States, and global medicine' },
    in_vivo_crispr_therapeutics: { firstKnownDate: 2030, datePrecision: 'decade', region: 'Forecast / global medicine' },
    tool_using_language_models: { firstKnownDate: 2022, datePrecision: 'exact', region: 'Global AI research community' },
    synthetic_biology: { firstKnownDate: 2000, datePrecision: 'decade', region: 'Global biotechnology research' },
    telegraph: { firstKnownDate: 1837, datePrecision: 'decade', region: 'United States and Europe' },
    telephone: { firstKnownDate: 1876, datePrecision: 'exact', region: 'United States' },
    telephone_exchange: { firstKnownDate: 1878, datePrecision: 'exact', region: 'United States' },
    telegraph_cables_transoceanic: { firstKnownDate: 1866, datePrecision: 'exact', region: 'Atlantic Ocean / United Kingdom and North America' },
    coaxial_cable: { firstKnownDate: 1880, datePrecision: 'decade', region: 'United Kingdom and United States' },
    automatic_telephone_switching: { firstKnownDate: 1891, datePrecision: 'exact', region: 'United States' },
    radio_telegraphy_wireless_communication: { firstKnownDate: 1895, datePrecision: 'decade', region: 'Europe and North America' },
    radio: { firstKnownDate: 1906, datePrecision: 'decade', region: 'Global communications industry' },
    telecommunications: { firstKnownDate: 1932, datePrecision: 'decade', region: 'Global standards and carrier networks' },
    microwave_relay_networks: { firstKnownDate: 1947, datePrecision: 'decade', region: 'United States and Europe' },
    information_theory: { firstKnownDate: 1948, datePrecision: 'exact', region: 'United States' },
    frequency_division_multiplexing: { firstKnownDate: 1910, datePrecision: 'decade', region: 'Global carrier networks' },
    time_division_multiplexing: { firstKnownDate: 1960, datePrecision: 'decade', region: 'Global digital carrier networks' },
    packet_switching: { firstKnownDate: 1961, datePrecision: 'decade', region: 'United States and United Kingdom' },
    computer_networking: { firstKnownDate: 1969, datePrecision: 'exact', region: 'United States' },
    internet_protocols_tcp_ip_arpanet: { firstKnownDate: 1974, datePrecision: 'exact', region: 'United States' },
    local_area_networks: { firstKnownDate: 1970, datePrecision: 'decade', region: 'United States and global computing industry' },
    ethernet: { firstKnownDate: 1973, datePrecision: 'exact', region: 'United States' },
    internet: { firstKnownDate: 1983, datePrecision: 'exact', region: 'United States and global research networks' },
    domain_name_system: { firstKnownDate: 1983, datePrecision: 'exact', region: 'United States and global internet' },
    border_gateway_protocol: { firstKnownDate: 1989, datePrecision: 'exact', region: 'Global internet' },
    network_time_protocol: { firstKnownDate: 1985, datePrecision: 'exact', region: 'United States and global internet' },
    world_wide_web: { firstKnownDate: 1989, datePrecision: 'exact', region: 'CERN / Switzerland' },
    http_protocol: { firstKnownDate: 1991, datePrecision: 'exact', region: 'CERN / global web' },
    web_browsers: { firstKnownDate: 1990, datePrecision: 'exact', region: 'CERN / global web' },
    fiber_optics: { firstKnownDate: 1970, datePrecision: 'exact', region: 'United Kingdom, United States, and global carrier networks' },
    dense_wavelength_division_multiplexing: { firstKnownDate: 1995, datePrecision: 'decade', region: 'Global optical-networking industry' },
    submarine_fiber_optic_cables: { firstKnownDate: 1988, datePrecision: 'exact', region: 'Atlantic Ocean and global carrier networks' },
    cellular_networks: { firstKnownDate: 1979, datePrecision: 'decade', region: 'Japan, Nordic countries, and United States' },
    gsm_digital_cellular: { firstKnownDate: 1991, datePrecision: 'exact', region: 'Europe and global mobile industry' },
    lte_4g_networks: { firstKnownDate: 2009, datePrecision: 'exact', region: 'Global mobile industry' },
    five_g_new_radio: { firstKnownDate: 2018, datePrecision: 'exact', region: 'Global mobile industry' },
    mobile_phones: { firstKnownDate: 1973, datePrecision: 'exact', region: 'United States and global mobile industry' },
    mobile_broadband_networks: { firstKnownDate: 2001, datePrecision: 'decade', region: 'Global mobile industry' },
    wifi_wireless_networking: { firstKnownDate: 1997, datePrecision: 'exact', region: 'Global IEEE 802.11 ecosystem' },
    bluetooth_short_range: { firstKnownDate: 1998, datePrecision: 'exact', region: 'Global device industry' },
    smartphones: { firstKnownDate: 1994, datePrecision: 'decade', region: 'Global mobile computing industry' },
    internet_of_things_iot_ubiquitous_connectivity: { firstKnownDate: 1999, datePrecision: 'decade', region: 'Global embedded-networking industry' },
    rfid_tracking: { firstKnownDate: 1973, datePrecision: 'decade', region: 'Global logistics and identification systems' },
    email_messaging_protocols: { firstKnownDate: 1971, datePrecision: 'exact', region: 'United States / ARPANET' },
    voice_over_ip: { firstKnownDate: 1995, datePrecision: 'decade', region: 'Global internet' },
    content_delivery_networks: { firstKnownDate: 1998, datePrecision: 'exact', region: 'United States and global internet' },
    mesh_wifi_networks: { firstKnownDate: 2003, datePrecision: 'decade', region: 'Global wireless-networking industry' },
    cable_modems_docsis: { firstKnownDate: 1997, datePrecision: 'exact', region: 'North America and global cable networks' },
    digital_subscriber_line_dsl: { firstKnownDate: 1990, datePrecision: 'decade', region: 'Global telephone-carrier networks' },
    network_management_snmp: { firstKnownDate: 1988, datePrecision: 'exact', region: 'Global internet' },
    software_defined_networking: { firstKnownDate: 2008, datePrecision: 'decade', region: 'Global networking research and industry' },
    tls_ssl_secure_transport: { firstKnownDate: 1995, datePrecision: 'decade', region: 'Global internet' },
    communications_satellites: { firstKnownDate: 1962, datePrecision: 'exact', region: 'United States and global satellite networks' },
    quantum_internet: { firstKnownDate: 2035, datePrecision: 'decade', region: 'Forecast / global quantum-networking research' },
    '5g_6g_communication_networks': { firstKnownDate: 2030, datePrecision: 'decade', region: 'Forecast / global mobile industry' },
    water_carrying_techniques: { firstKnownDate: -10000, datePrecision: 'millennium', region: 'Global / multiple regions' },
    wells_and_cisterns: { firstKnownDate: -8000, datePrecision: 'millennium', region: 'Southwest Asia and other early settled regions' },
    rainwater_harvesting: { firstKnownDate: -4000, datePrecision: 'millennium', region: 'Southwest Asia, South Asia, and other dryland regions' },
    dams_and_reservoirs: { firstKnownDate: -3000, datePrecision: 'millennium', region: 'Egypt, Mesopotamia, South Asia, China, and other early hydraulic societies' },
    irrigation_canals_local: { firstKnownDate: -6000, datePrecision: 'millennium', region: 'Southwest Asia and early farming societies' },
    irrigation_sluice_gates: { firstKnownDate: -3000, datePrecision: 'century', region: 'Mesopotamia, Egypt, South Asia, and China' },
    latrines_and_waste_pits: { firstKnownDate: -3000, datePrecision: 'century', region: 'Early urban settlements across multiple regions' },
    sewers_and_drainage: { firstKnownDate: -2600, datePrecision: 'century', region: 'Indus Valley, Mesopotamia, and other early cities' },
    qanat_water_supply: { firstKnownDate: -800, datePrecision: 'century', region: 'Iran and arid regions of West and Central Asia' },
    aqueducts: { firstKnownDate: -700, datePrecision: 'century', region: 'Assyria, Greece, Rome, and other classical hydraulic systems' },
    aqueduct_siphons_lead_pipes: { firstKnownDate: -300, datePrecision: 'century', region: 'Hellenistic and Roman engineering networks' },
    water_distribution_pipes: { firstKnownDate: -300, datePrecision: 'century', region: 'Mediterranean and other classical urban systems' },
    plumbing: { firstKnownDate: -300, datePrecision: 'century', region: 'Mediterranean, South Asia, East Asia, and other urban societies' },
    public_latrines: { firstKnownDate: -200, datePrecision: 'century', region: 'Mediterranean and other classical cities' },
    water_filtration_sand_charcoal: { firstKnownDate: -500, datePrecision: 'century', region: 'Classical Mediterranean and South Asian medical traditions' },
    canal_lock_gates: { firstKnownDate: 984, datePrecision: 'exact', region: 'China and later global canal systems' },
    municipal_water_supply: { firstKnownDate: 1200, datePrecision: 'century', region: 'Medieval Europe, Islamic cities, China, and other urban regions' },
    water_management_guilds: { firstKnownDate: 1200, datePrecision: 'century', region: 'Medieval Europe and other municipal water institutions' },
    water_quality_ordinances: { firstKnownDate: 1300, datePrecision: 'century', region: 'Medieval and early modern cities' },
    water_powered_pumps: { firstKnownDate: 1200, datePrecision: 'century', region: 'Afro-Eurasian watermill and mining regions' },
    flush_toilet_trap_seal: { firstKnownDate: 1775, datePrecision: 'exact', region: 'United Kingdom and later global sanitation systems' },
    sanitary_sewer_networks: { firstKnownDate: 1840, datePrecision: 'decade', region: 'United Kingdom, Europe, and North America' },
    slow_sand_filtration: { firstKnownDate: 1804, datePrecision: 'exact', region: 'Scotland and England' },
    rapid_sand_filtration: { firstKnownDate: 1885, datePrecision: 'decade', region: 'United States and Europe' },
    coagulation_flocculation_water_treatment: { firstKnownDate: 1880, datePrecision: 'decade', region: 'Europe, North America, and global waterworks' },
    septic_tank_systems: { firstKnownDate: 1860, datePrecision: 'decade', region: 'France, Europe, and global decentralized sanitation' },
    water_quality_testing: { firstKnownDate: 1880, datePrecision: 'decade', region: 'Europe, North America, and global public-health laboratories' },
    stormwater_drainage_systems: { firstKnownDate: 1850, datePrecision: 'decade', region: 'Industrial cities in Europe, North America, and global urban systems' },
    water_towers_pressure_distribution: { firstKnownDate: 1850, datePrecision: 'decade', region: 'Industrial municipal water systems' },
    municipal_water_treatment: { firstKnownDate: 1804, datePrecision: 'exact', region: 'Scotland, England, and later global municipal systems' },
    urban_water_chlorination: { firstKnownDate: 1908, datePrecision: 'exact', region: 'United States and global municipal systems' },
    ozone_water_treatment: { firstKnownDate: 1906, datePrecision: 'exact', region: 'France and global drinking-water treatment' },
    ultraviolet_water_disinfection: { firstKnownDate: 1910, datePrecision: 'decade', region: 'Europe and global water treatment' },
    ion_exchange_water_softening: { firstKnownDate: 1905, datePrecision: 'decade', region: 'Europe, North America, and industrial water treatment' },
    fluoridated_drinking_water: { firstKnownDate: 1945, datePrecision: 'exact', region: 'United States and later global public-health systems' },
    activated_sludge_process: { firstKnownDate: 1914, datePrecision: 'exact', region: 'United Kingdom and global wastewater treatment' },
    reverse_osmosis_desalination: { firstKnownDate: 1965, datePrecision: 'decade', region: 'United States and global desalination industry' },
    membrane_filtration_water_treatment: { firstKnownDate: 1960, datePrecision: 'decade', region: 'Global water-treatment industry' },
    desalination_energy_recovery: { firstKnownDate: 1990, datePrecision: 'decade', region: 'Global desalination industry' },
    membrane_bioreactors: { firstKnownDate: 1969, datePrecision: 'decade', region: 'Global wastewater treatment industry' },
    water_reuse_reclamation: { firstKnownDate: 1960, datePrecision: 'decade', region: 'Global arid-region water utilities' },
    advanced_oxidation_water_treatment: { firstKnownDate: 1970, datePrecision: 'decade', region: 'Global drinking-water and wastewater treatment' },
    pfas_treatment_water_systems: { firstKnownDate: 2000, datePrecision: 'decade', region: 'Global drinking-water and remediation systems' },
    scada_water_systems: { firstKnownDate: 1970, datePrecision: 'decade', region: 'Global water utility operations' },
    acoustic_leak_detection: { firstKnownDate: 1980, datePrecision: 'decade', region: 'Global water distribution utilities' },
    smart_water_networks: { firstKnownDate: 2010, datePrecision: 'decade', region: 'Global digital water utility systems' },
    low_energy_desalination_membranes: { firstKnownDate: 2035, datePrecision: 'decade', region: 'Forecast / global water-scarcity regions' },
    pharmacopoeia: { firstKnownDate: 50, datePrecision: 'century', region: 'Mediterranean, South Asia, China, and other classical medical traditions' },
    pharmacopoeia_compilation: { firstKnownDate: 77, datePrecision: 'century', region: 'Mediterranean and other literate medical traditions' },
    hospital_pharmacies: { firstKnownDate: 800, datePrecision: 'century', region: 'Islamic world, Europe, and other hospital systems' },
    experimental_pharmacology: { firstKnownDate: 1600, datePrecision: 'century', region: 'Europe and other early modern medical centers' },
    dose_response_testing: { firstKnownDate: 1700, datePrecision: 'century', region: 'Europe and global experimental medicine' },
    organic_chemistry: { firstKnownDate: 1828, datePrecision: 'decade', region: 'Europe and global chemical industry' },
    alkaloid_isolation: { firstKnownDate: 1804, datePrecision: 'decade', region: 'Europe and global pharmacy' },
    tablet_pressing: { firstKnownDate: 1843, datePrecision: 'decade', region: 'United Kingdom, Europe, and global pharmaceutical manufacturing' },
    sterile_injectable_drugs: { firstKnownDate: 1880, datePrecision: 'decade', region: 'Europe, North America, and global hospital medicine' },
    randomized_controlled_trials: { firstKnownDate: 1948, datePrecision: 'exact', region: 'United Kingdom and global clinical research' },
    double_blind_clinical_trials: { firstKnownDate: 1950, datePrecision: 'decade', region: 'Europe, North America, and global clinical research' },
    good_manufacturing_practice: { firstKnownDate: 1963, datePrecision: 'decade', region: 'United States, Europe, and global pharmaceutical manufacturing' },
    antibiotic_susceptibility_testing: { firstKnownDate: 1940, datePrecision: 'decade', region: 'Europe, North America, and global clinical laboratories' },
    pharmacokinetics_pharmacodynamics: { firstKnownDate: 1950, datePrecision: 'decade', region: 'Global pharmacology and clinical development' },
    controlled_release_formulations: { firstKnownDate: 1952, datePrecision: 'decade', region: 'Global pharmaceutical formulation industry' },
    medicinal_chemistry: { firstKnownDate: 1900, datePrecision: 'decade', region: 'Europe, North America, and global pharmaceutical research' },
    high_throughput_screening: { firstKnownDate: 1980, datePrecision: 'decade', region: 'Global pharmaceutical research laboratories' },
    combinatorial_chemistry: { firstKnownDate: 1984, datePrecision: 'decade', region: 'Global pharmaceutical and chemical research' },
    lead_optimization: { firstKnownDate: 1980, datePrecision: 'decade', region: 'Global pharmaceutical research laboratories' },
    structure_based_drug_design: { firstKnownDate: 1980, datePrecision: 'decade', region: 'Global structural biology and pharmaceutical research' },
    computer_aided_drug_design: { firstKnownDate: 1981, datePrecision: 'decade', region: 'Global computational chemistry and pharmaceutical research' },
    in_vitro_adme_toxicology: { firstKnownDate: 1990, datePrecision: 'decade', region: 'Global pharmaceutical safety laboratories' },
    good_laboratory_practice_toxicology: { firstKnownDate: 1978, datePrecision: 'decade', region: 'United States, Europe, and global regulatory laboratories' },
    pharmacogenomics: { firstKnownDate: 1997, datePrecision: 'decade', region: 'Global genomics and clinical pharmacology' },
    adverse_event_reporting_systems: { firstKnownDate: 1968, datePrecision: 'decade', region: 'United States, WHO member states, and global medicine regulation' },
    phase_i_iii_clinical_trials: { firstKnownDate: 1962, datePrecision: 'decade', region: 'United States, Europe, and global clinical research' },
    regulatory_drug_approval: { firstKnownDate: 1962, datePrecision: 'decade', region: 'United States, Europe, and global medicines regulation' },
    recombinant_dna_genetic_engineering: { firstKnownDate: 1973, datePrecision: 'exact', region: 'United States and global molecular biology' },
    recombinant_protein_drugs: { firstKnownDate: 1982, datePrecision: 'exact', region: 'United States, Europe, and global biopharmaceutical manufacturing' },
    biopharmaceutical_manufacturing: { firstKnownDate: 1980, datePrecision: 'decade', region: 'Global biopharmaceutical industry' },
    gene_therapy_vectors: { firstKnownDate: 1990, datePrecision: 'decade', region: 'United States, Europe, and global clinical research' },
    immuno_oncology_checkpoint_inhibitors: { firstKnownDate: 2011, datePrecision: 'exact', region: 'United States, Japan, Europe, and global oncology' },
    biosimilars: { firstKnownDate: 2006, datePrecision: 'exact', region: 'European Union, United States, and global medicines regulation' },
    nanomedicine_drug_delivery: { firstKnownDate: 1995, datePrecision: 'decade', region: 'Global pharmaceutical research and nanomedicine' },
    continuous_pharmaceutical_manufacturing: { firstKnownDate: 2015, datePrecision: 'decade', region: 'United States, Europe, and global pharmaceutical manufacturing' },
    real_world_evidence_regulatory_science: { firstKnownDate: 2016, datePrecision: 'decade', region: 'United States, Europe, and global medicines regulation' },
    cell_culture: { firstKnownDate: 1907, datePrecision: 'decade', region: 'United States, Europe, and global biomedical research' },
    molecular_biology: { firstKnownDate: 1953, datePrecision: 'decade', region: 'United Kingdom, United States, and global biomedical research' },
    dna_sequencing: { firstKnownDate: 1977, datePrecision: 'exact', region: 'United Kingdom, United States, and global genomics' },
    bioinformatics: { firstKnownDate: 1970, datePrecision: 'decade', region: 'Global computational biology research' },
    antibiotics: { firstKnownDate: 1928, datePrecision: 'exact', region: 'United Kingdom, United States, and global medicine' },
    monoclonal_antibodies: { firstKnownDate: 1975, datePrecision: 'exact', region: 'United Kingdom and global biomedical research' },
    vaccine_development_modern: { firstKnownDate: 1955, datePrecision: 'decade', region: 'Global vaccine research and manufacturing' },
    insulin_therapy: { firstKnownDate: 1922, datePrecision: 'exact', region: 'Canada, United States, Europe, and global medicine' },
    lipid_nanoparticles: { firstKnownDate: 1995, datePrecision: 'decade', region: 'Global drug-delivery research' },
    messenger_rna_therapeutics: { firstKnownDate: 2010, datePrecision: 'decade', region: 'Global RNA therapeutics research' },
    mrna_vaccines: { firstKnownDate: 2020, datePrecision: 'exact', region: 'United States, Germany, and global vaccine programs' },
    mrna_vaccine_platforms: { firstKnownDate: 2020, datePrecision: 'exact', region: 'United States, Germany, and global vaccine programs' },
    protein_structure_prediction_ai: { firstKnownDate: 2020, datePrecision: 'exact', region: 'United Kingdom, United States, and global computational biology' },
    ai_driven_drug_discovery: { firstKnownDate: 2035, datePrecision: 'decade', region: 'Forecast / global pharmaceutical research' },
    ai_closed_loop_drug_discovery: { firstKnownDate: 2040, datePrecision: 'decade', region: 'Forecast / global pharmaceutical research' }
};

const DEPENDENCY_REPLACEMENTS = {
    bureaucracy: 'record_keeping',
    public_health_systems: 'sewers_and_drainage',
    astronomy: 'early_astronomy_observation',
    early_medicine: 'herbal_medicine_preparation',
    engineering: 'construction',
    hospitals_early: 'military_field_medicine',
    plant_breeding_hybridization: 'selective_seed_saving',
    tungsten_filament_production: 'light_bulb',
    financial_derivatives: 'stock_exchange_modern',
    automobile: 'internal_combustion_engine',
    clockwork_mechanisms: 'mechanical_clocks',
    double_entry_bookkeeping: 'double_entry_diffusion',
    statistics_advanced_data_analysis: 'probability_theory',
    public_art_museums: 'oil_painting',
    drug_delivery_systems_targeted: 'biochemistry',
    natural_language_processing_advanced: 'deep_learning_neural_networks'
};

const REMOVE_DEPENDENCIES = new Map([
    ['stone_tool_making', new Set(['fire_control'])],
    ['oral_tradition_storytelling', new Set(['fire_control'])],
    ['vector_databases', new Set(['large_language_models'])],
    ['retrieval_augmented_generation', new Set(['vector_databases'])],
    ['flash_memory', new Set(['solid_state_drives_ssd_flash_memory'])],
    ['solid_state_drives_ssd_flash_memory', new Set(['personal_computers'])],
    ['experimental_controls', new Set(['probability_statistics_inference'])],
    ['art_conservation_workshops', new Set(['public_museum_catalogs'])],
    ['lipid_nanoparticles', new Set(['messenger_rna_therapeutics'])],
    ['synthetic_biology', new Set(['crispr_gene_editing'])],
    ['cas12_cas13_editing_platforms', new Set(['crispr_gene_editing'])],
    ['5g_6g_communication_networks', new Set(['mobile_phones', 'advanced_ai'])],
    ['submarine_fiber_optic_cables', new Set(['dense_wavelength_division_multiplexing'])],
    ['ion_exchange_water_softening', new Set(['polymer_chemistry'])]
]);

const ADD_DEPENDENCIES = new Map([
    ['solid_state_drives_ssd_flash_memory', ['flash_memory']],
    ['vector_databases', ['information_theory']],
    ['retrieval_augmented_generation', ['search_engines']],
    ['experimental_controls', ['probability_theory']],
    ['cas12_cas13_editing_platforms', ['crispr_adaptive_immunity']],
    ['5g_6g_communication_networks', ['five_g_new_radio']],
    ['submarine_fiber_optic_cables', ['lasers']],
    ['ion_exchange_water_softening', ['advanced_chemistry']]
]);

const CRISPR_SOURCES = {
    cpf1Cas12: {
        title: 'Cpf1 is a single RNA-guided endonuclease of a class 2 CRISPR-Cas system',
        url: 'https://www.broadinstitute.org/publications/broad7290',
        publisher: 'Cell / Broad Institute',
        year: 2015,
        source_type: 'primary_paper'
    },
    cas13RnaTargeting: {
        title: 'RNA targeting with CRISPR-Cas13',
        url: 'https://www.broadinstitute.org/publications/broad125381',
        publisher: 'Nature / Broad Institute',
        year: 2017,
        source_type: 'primary_paper'
    },
    baseEditingPmc: {
        title: 'Programmable editing of a target base in genomic DNA without double-stranded DNA cleavage',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4873371/',
        publisher: 'Nature / PubMed Central',
        year: 2016,
        source_type: 'primary_paper'
    },
    baseEditingNature: {
        title: 'Programmable editing of a target base in genomic DNA without double-stranded DNA cleavage',
        url: 'https://www.nature.com/articles/nature17946',
        publisher: 'Nature',
        year: 2016,
        source_type: 'primary_paper',
        supports: ['node', 'maturity']
    },
    fdaCasgevy: {
        title: 'FDA Approves First Gene Therapies to Treat Patients with Sickle Cell Disease',
        url: 'https://www.fda.gov/vaccines-blood-biologics/casgevy',
        publisher: 'U.S. Food and Drug Administration',
        year: 2023,
        source_type: 'official_agency',
        supports: ['node', 'maturity']
    },
    nejmExaCel: {
        title: 'CRISPR-Cas9 Gene Editing for Sickle Cell Disease and beta-Thalassemia',
        url: 'https://pubmed.ncbi.nlm.nih.gov/33283989/',
        publisher: 'New England Journal of Medicine / PubMed',
        year: 2021,
        source_type: 'primary_paper'
    },
    jinekCas9Pmc: {
        title: 'A programmable dual-RNA-guided DNA endonuclease in adaptive bacterial immunity',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6286148/',
        publisher: 'Science / PubMed Central',
        year: 2012,
        source_type: 'primary_paper'
    },
    congGenomeEngineeringPmc: {
        title: 'Multiplex Genome Engineering Using CRISPR/Cas Systems',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3795411/',
        publisher: 'Science / PubMed Central',
        year: 2013,
        source_type: 'primary_paper'
    },
    maliHumanGenomeEngineeringPubmed: {
        title: 'RNA-guided human genome engineering via Cas9',
        url: 'https://pubmed.ncbi.nlm.nih.gov/23287722/',
        publisher: 'Science / PubMed',
        year: 2013,
        source_type: 'primary_paper'
    },
    hsuCas9GenomeEngineeringReview: {
        title: 'Development and Applications of CRISPR-Cas9 for Genome Engineering',
        url: 'https://pubmed.ncbi.nlm.nih.gov/24906146/',
        publisher: 'Cell / PubMed',
        year: 2014,
        source_type: 'review'
    },
    zfnFokIFusionPmc: {
        title: 'Hybrid restriction enzymes: zinc finger fusions to Fok I cleavage domain',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC40048/',
        publisher: 'Proceedings of the National Academy of Sciences / PubMed Central',
        year: 1996,
        source_type: 'primary_paper'
    }
};

const AI_POSTTRAINING_SOURCES = {
    stiennonSummarization: {
        title: 'Learning to summarize with human feedback',
        url: 'https://arxiv.org/abs/2009.01325',
        publisher: 'arXiv / OpenAI',
        year: 2020,
        source_type: 'primary_paper'
    },
    flanInstructionTuning: {
        title: 'Finetuned Language Models Are Zero-Shot Learners',
        url: 'https://arxiv.org/abs/2109.01652',
        publisher: 'arXiv / Google Research',
        year: 2021,
        source_type: 'primary_paper'
    },
    instructGpt: {
        title: 'Training language models to follow instructions with human feedback',
        url: 'https://arxiv.org/abs/2203.02155',
        publisher: 'arXiv / OpenAI',
        year: 2022,
        source_type: 'primary_paper'
    }
};

const EDGE_OVERRIDES = {
    'foraging_and_botany|oral_tradition_storytelling': {
        type: 'common_dependency',
        confidence: 0.45,
        evidence_level: 'expert_inference',
        note: 'Shared knowledge transmission helps preserve ecological knowledge, but it is not a hard technical prerequisite.',
        reviewStatus: 'source_checked'
    },
    'stone_tool_making|fire_control': null,
    'oral_tradition_storytelling|fire_control': null,
    'flash_memory|solid_state_drives_ssd_flash_memory': null,
    'solid_state_drives_ssd_flash_memory|flash_memory': {
        type: 'required',
        confidence: 0.9,
        evidence_level: 'expert_inference',
        note: 'Flash memory is the non-volatile storage component used by flash-based SSDs; the product depends on the component, not the reverse.',
        reviewStatus: 'source_checked'
    },
    'vector_databases|large_language_models': null,
    'retrieval_augmented_generation|vector_databases': null,
    'cas12_cas13_editing_platforms|crispr_gene_editing': null,
    'cas12_cas13_editing_platforms|crispr_adaptive_immunity': {
        type: 'historical_predecessor',
        confidence: 0.86,
        evidence_level: 'primary_source',
        note: 'Cas12/Cpf1 and Cas13 are class 2 CRISPR-Cas effectors, so the shared foundation is broader CRISPR-Cas adaptive immunity rather than Cas9-specific genome editing.',
        reviewStatus: 'source_checked',
        sources: [CRISPR_SOURCES.cpf1Cas12, CRISPR_SOURCES.cas13RnaTargeting]
    },
    'cas12_cas13_editing_platforms|rna_interference': {
        type: 'historical_predecessor',
        confidence: 0.72,
        evidence_level: 'primary_source',
        note: 'RNA interference is a prior RNA-knockdown approach and comparison point for Cas13, not a hard prerequisite for Cas12/Cas13 platforms as a whole.',
        reviewStatus: 'source_checked',
        sources: [CRISPR_SOURCES.cas13RnaTargeting]
    },
    'ex_vivo_crispr_cell_therapy|crispr_gene_editing': {
        type: 'required',
        confidence: 0.92,
        evidence_level: 'primary_source',
        note: 'Ex vivo CRISPR cell therapy depends on CRISPR-Cas9 genome editing of patient-derived cells before reinfusion.',
        reviewStatus: 'source_checked',
        sources: [CRISPR_SOURCES.fdaCasgevy, CRISPR_SOURCES.nejmExaCel]
    },
    'base_editing|crispr_gene_editing': {
        type: 'historical_predecessor',
        confidence: 0.78,
        evidence_level: 'primary_source',
        note: 'CRISPR-Cas9 genome editing established the programmable Cas9 editing platform that base editing adapted to install base conversions without double-strand DNA cleavage.',
        reviewStatus: 'source_checked',
        sources: [CRISPR_SOURCES.baseEditingNature, CRISPR_SOURCES.baseEditingPmc]
    },
    'base_editing|cas9_programmable_nuclease': {
        type: 'required',
        confidence: 0.92,
        evidence_level: 'primary_source',
        note: 'Cytosine base editors use catalytically impaired Cas9 as the programmable DNA-targeting component fused to a deaminase.',
        reviewStatus: 'source_checked',
        sources: [CRISPR_SOURCES.baseEditingNature, CRISPR_SOURCES.baseEditingPmc]
    },
    'base_editing|protein_engineering': {
        type: 'required',
        confidence: 0.9,
        evidence_level: 'primary_source',
        note: 'Base editors are engineered protein fusions, such as deaminase domains joined to catalytically impaired Cas9 variants, making protein engineering a direct component dependency.',
        reviewStatus: 'source_checked',
        sources: [CRISPR_SOURCES.baseEditingNature, CRISPR_SOURCES.baseEditingPmc]
    },
    'cas9_programmable_nuclease|protein_engineering': {
        type: 'enabling',
        confidence: 0.74,
        evidence_level: 'primary_source',
        note: 'Protein engineering supports Cas9 domain characterization and later optimization, but the 2012 programmable nuclease platform is primarily RNA-guided rather than dependent on engineered Cas9 variants.',
        reviewStatus: 'source_checked',
        sources: [CRISPR_SOURCES.jinekCas9Pmc]
    },
    'zinc_finger_nucleases|protein_engineering': {
        type: 'required',
        confidence: 0.92,
        evidence_level: 'primary_source',
        note: 'Zinc-finger nucleases require engineered protein-domain architecture: zinc-finger DNA-binding domains are fused to FokI cleavage domains to create sequence-directed nucleases.',
        reviewStatus: 'source_checked',
        sources: [CRISPR_SOURCES.zfnFokIFusionPmc]
    },
    'crispr_gene_editing|cas9_programmable_nuclease': {
        type: 'required',
        confidence: 0.94,
        evidence_level: 'primary_source',
        note: 'Early CRISPR-Cas9 genome editing requires Cas9 nuclease activity as the programmable DNA-cutting component directed by guide RNA.',
        reviewStatus: 'source_checked',
        sources: [CRISPR_SOURCES.congGenomeEngineeringPmc, CRISPR_SOURCES.maliHumanGenomeEngineeringPubmed]
    },
    'crispr_gene_editing|genetic_engineering': {
        type: 'historical_predecessor',
        confidence: 0.76,
        evidence_level: 'review',
        note: 'Genetic engineering is the broader predecessor field for genome-engineering methods, but it is not a discrete component required by the CRISPR-Cas9 editing mechanism.',
        reviewStatus: 'source_checked',
        sources: [CRISPR_SOURCES.hsuCas9GenomeEngineeringReview]
    },
    'instruction_tuning_rlhf|large_language_models': {
        type: 'enabling',
        confidence: 0.82,
        evidence_level: 'primary_source',
        note: 'Instruction tuning and RLHF are post-training methods applied to pretrained language models; large language models are the main modern substrate, but the methods are not a hardware-like prerequisite.',
        reviewStatus: 'source_checked',
        sources: [AI_POSTTRAINING_SOURCES.stiennonSummarization, AI_POSTTRAINING_SOURCES.flanInstructionTuning, AI_POSTTRAINING_SOURCES.instructGpt]
    },
    'instruction_tuning_rlhf|reinforcement_learning': {
        type: 'enabling',
        confidence: 0.78,
        evidence_level: 'primary_source',
        note: 'Reinforcement learning and reward modeling underpin the RLHF part of the bundled node, while instruction tuning can also use supervised demonstrations.',
        reviewStatus: 'source_checked',
        sources: [AI_POSTTRAINING_SOURCES.stiennonSummarization, AI_POSTTRAINING_SOURCES.instructGpt]
    },
    'instruction_tuning_rlhf|supervised_learning_pipelines': {
        type: 'enabling',
        confidence: 0.8,
        evidence_level: 'primary_source',
        note: 'Instruction tuning and preference-model pipelines rely on curated demonstrations, rankings, and supervised fine-tuning workflows.',
        reviewStatus: 'source_checked',
        sources: [AI_POSTTRAINING_SOURCES.flanInstructionTuning, AI_POSTTRAINING_SOURCES.instructGpt]
    },
    'retrieval_augmented_generation|search_engines': {
        type: 'enabling',
        confidence: 0.85,
        evidence_level: 'primary_source',
        note: 'RAG requires retrieval from an external corpus, but the retrieval system can be classic search or another database, not necessarily a vector database.',
        reviewStatus: 'source_checked'
    },
    'vector_databases|machine_learning_early_algorithms': {
        type: 'enabling',
        confidence: 0.75,
        evidence_level: 'expert_inference',
        note: 'Embedding models and nearest-neighbor methods make vector databases useful, but LLMs are not required.',
        reviewStatus: 'source_checked'
    },
    'recommender_systems|machine_learning_early_algorithms': {
        type: 'enabling',
        confidence: 0.8,
        evidence_level: 'review',
        note: 'Recommender systems draw on collaborative filtering, ranking, and machine-learning methods rather than one specific random-forest citation.',
        reviewStatus: 'source_checked'
    },
    'randomized_controlled_trials|experimental_controls': {
        type: 'required',
        confidence: 0.88,
        evidence_level: 'textbook',
        note: 'Randomized controlled trials are controlled experiments in clinical populations; random assignment is layered on top of experimental control.',
        reviewStatus: 'source_checked'
    },
    'randomized_controlled_trials|probability_statistics_inference': {
        type: 'enabling',
        confidence: 0.78,
        evidence_level: 'textbook',
        note: 'Statistical inference is needed to estimate treatment effects and uncertainty, but the clinical protocol is a separate technology.',
        reviewStatus: 'source_checked'
    },
    'good_manufacturing_practice|industrial_quality_control': {
        type: 'historical_predecessor',
        confidence: 0.82,
        evidence_level: 'expert_inference',
        note: 'Industrial quality-control systems precede and inform pharmaceutical GMP, but GMP adds medicine-specific documentation and regulatory controls.',
        reviewStatus: 'source_checked'
    },
    'regulatory_drug_approval|phase_i_iii_clinical_trials': {
        type: 'required',
        confidence: 0.9,
        evidence_level: 'expert_inference',
        note: 'Modern drug approval requires clinical evidence on safety and effectiveness from phased human studies or accepted equivalents.',
        reviewStatus: 'source_checked'
    },
    'regulatory_drug_approval|good_manufacturing_practice': {
        type: 'required',
        confidence: 0.86,
        evidence_level: 'expert_inference',
        note: 'Approval depends on evidence that the product can be manufactured under controlled quality systems.',
        reviewStatus: 'source_checked'
    },
    'recombinant_protein_drugs|recombinant_dna_genetic_engineering': {
        type: 'required',
        confidence: 0.9,
        evidence_level: 'expert_inference',
        note: 'Recombinant protein drugs require engineered DNA constructs to express therapeutic proteins in host cells.',
        reviewStatus: 'source_checked'
    },
    'recombinant_protein_drugs|cell_culture': {
        type: 'required',
        confidence: 0.84,
        evidence_level: 'expert_inference',
        note: 'Therapeutic protein production depends on controlled growth of microbial or mammalian cells for expression and scale-up.',
        reviewStatus: 'source_checked'
    },
    'biopharmaceutical_manufacturing|good_manufacturing_practice': {
        type: 'commercial_or_scaling_dependency',
        confidence: 0.86,
        evidence_level: 'expert_inference',
        note: 'Biologic medicines require controlled manufacturing, testing, and release systems before broad clinical distribution.',
        reviewStatus: 'source_checked'
    },
    'mrna_vaccines|lipid_nanoparticles': {
        type: 'enabling',
        confidence: 0.86,
        evidence_level: 'review',
        note: 'Lipid nanoparticles are a central delivery method for approved mRNA vaccines, though not the only conceivable RNA-delivery route.',
        reviewStatus: 'source_checked'
    },
    'ai_closed_loop_drug_discovery|ai_driven_drug_discovery': {
        type: 'speculative',
        confidence: 0.4,
        evidence_level: 'speculative',
        note: 'Closed-loop drug discovery is modeled as a forecast extension of AI-assisted discovery rather than an established production path.',
        reviewStatus: 'source_checked'
    },
    'stone_tool_making|': {
        type: 'historical_predecessor',
        confidence: 0.9,
        evidence_level: 'textbook',
        note: 'Stone tools precede controlled fire and are treated as a root material technology in this graph.',
        reviewStatus: 'source_checked'
    }
};

const CRISPR_EDGE_TYPES = {
    'cas9_programmable_nuclease|crispr_adaptive_immunity': ['historical_predecessor', 'Discovery of CRISPR-Cas immunity precedes engineering Cas9 as a programmable nuclease.'],
    'crispr_gene_editing|cas9_programmable_nuclease': ['required', 'Programmable Cas9 nuclease activity is the core platform for early CRISPR genome editing.'],
    'crispr_off_target_profiling|crispr_gene_editing': ['enabling', 'Off-target profiling is an assay layer for safer CRISPR use, not a prerequisite for discovering editing.'],
    'pooled_crispr_screens|crispr_gene_editing': ['enabling', 'Pooled screens build on CRISPR editing plus guide libraries and sequencing.'],
    'crispri_crispra|crispr_gene_editing': ['enabling', 'CRISPRi/a adapts CRISPR targeting into regulation rather than cleavage-only editing.'],
    'crispr_delivery_aav_lnp_rnp|crispr_gene_editing': ['commercial_or_scaling_dependency', 'Delivery methods are scaling and therapeutic-enablement dependencies for CRISPR use in organisms and patients.'],
    'ex_vivo_crispr_cell_therapy|crispr_delivery_aav_lnp_rnp': ['commercial_or_scaling_dependency', 'Cell therapies require delivery/manufacturing workflows for edited cells.'],
    'approved_crispr_therapies|ex_vivo_crispr_cell_therapy': ['commercial_or_scaling_dependency', 'Approved therapies depend on clinical manufacturing, evidence, and regulatory approval, not only edit chemistry.'],
    'in_vivo_crispr_therapeutics|crispr_delivery_aav_lnp_rnp': ['commercial_or_scaling_dependency', 'In vivo therapy depends heavily on safe tissue-targeted delivery.']
};

const TELECOM_FIELD = 'Telecommunications & Networking';
const WATER_FIELD = 'Water & Sanitation Systems';
const PHARMA_FIELD = 'Pharmaceuticals & Drug Development';

const TELECOM_FIELD_LANES = {
    telegraph: 'Foundations & Switching',
    telephone: 'Foundations & Switching',
    telephone_exchange: 'Foundations & Switching',
    automatic_telephone_switching: 'Foundations & Switching',
    radio_telegraphy_wireless_communication: 'Foundations & Switching',
    telecommunications: 'Foundations & Switching',
    radio: 'Foundations & Switching',
    information_theory: 'Foundations & Switching',
    computer_networking: 'Foundations & Switching',
    packet_switching: 'Foundations & Switching',
    telegraph_cables_transoceanic: 'Transmission Media',
    coaxial_cable: 'Transmission Media',
    microwave_relay_networks: 'Transmission Media',
    fiber_optics: 'Transmission Media',
    frequency_division_multiplexing: 'Transmission Media',
    time_division_multiplexing: 'Transmission Media',
    dense_wavelength_division_multiplexing: 'Transmission Media',
    submarine_fiber_optic_cables: 'Transmission Media',
    communications_satellites: 'Transmission Media',
    internet_protocols_tcp_ip_arpanet: 'Protocols & Routing',
    domain_name_system: 'Protocols & Routing',
    border_gateway_protocol: 'Protocols & Routing',
    http_protocol: 'Protocols & Routing',
    email_messaging_protocols: 'Protocols & Routing',
    tls_ssl_secure_transport: 'Protocols & Routing',
    network_time_protocol: 'Protocols & Routing',
    local_area_networks: 'Access Networks',
    ethernet: 'Access Networks',
    cellular_networks: 'Access Networks',
    gsm_digital_cellular: 'Access Networks',
    lte_4g_networks: 'Access Networks',
    five_g_new_radio: 'Access Networks',
    mobile_broadband_networks: 'Access Networks',
    wifi_wireless_networking: 'Access Networks',
    bluetooth_short_range: 'Access Networks',
    cable_modems_docsis: 'Access Networks',
    digital_subscriber_line_dsl: 'Access Networks',
    internet: 'Services & Applications',
    world_wide_web: 'Services & Applications',
    web_browsers: 'Services & Applications',
    voice_over_ip: 'Services & Applications',
    smartphones: 'Services & Applications',
    mobile_phones: 'Services & Applications',
    internet_of_things_iot_ubiquitous_connectivity: 'Services & Applications',
    rfid_tracking: 'Services & Applications',
    content_delivery_networks: 'Operations & Scaling',
    mesh_wifi_networks: 'Operations & Scaling',
    network_management_snmp: 'Operations & Scaling',
    software_defined_networking: 'Operations & Scaling',
    quantum_internet: 'Roadmap',
    '5g_6g_communication_networks': 'Roadmap'
};

const WATER_FIELD_LANES = {
    water_carrying_techniques: 'Supply & Storage',
    wells_and_cisterns: 'Supply & Storage',
    rainwater_harvesting: 'Supply & Storage',
    dams_and_reservoirs: 'Supply & Storage',
    qanat_water_supply: 'Supply & Storage',
    municipal_water_supply: 'Supply & Storage',
    water_towers_pressure_distribution: 'Supply & Storage',
    irrigation: 'Conveyance & Distribution',
    irrigation_canals_local: 'Conveyance & Distribution',
    irrigation_sluice_gates: 'Conveyance & Distribution',
    aqueducts: 'Conveyance & Distribution',
    aqueduct_siphons_lead_pipes: 'Conveyance & Distribution',
    water_distribution_pipes: 'Conveyance & Distribution',
    plumbing: 'Conveyance & Distribution',
    canal_lock_gates: 'Conveyance & Distribution',
    water_powered_pumps: 'Conveyance & Distribution',
    latrines_and_waste_pits: 'Sanitation & Sewerage',
    public_latrines: 'Sanitation & Sewerage',
    sewers_and_drainage: 'Sanitation & Sewerage',
    flush_toilet_trap_seal: 'Sanitation & Sewerage',
    sanitary_sewer_networks: 'Sanitation & Sewerage',
    public_sanitation_modern: 'Sanitation & Sewerage',
    septic_tank_systems: 'Sanitation & Sewerage',
    stormwater_drainage_systems: 'Sanitation & Sewerage',
    water_filtration_sand_charcoal: 'Drinking Water Treatment',
    slow_sand_filtration: 'Drinking Water Treatment',
    rapid_sand_filtration: 'Drinking Water Treatment',
    coagulation_flocculation_water_treatment: 'Drinking Water Treatment',
    municipal_water_treatment: 'Drinking Water Treatment',
    urban_water_chlorination: 'Drinking Water Treatment',
    fluoridated_drinking_water: 'Drinking Water Treatment',
    ozone_water_treatment: 'Drinking Water Treatment',
    ultraviolet_water_disinfection: 'Drinking Water Treatment',
    water_quality_testing: 'Drinking Water Treatment',
    municipal_wastewater_treatment: 'Wastewater & Reuse',
    activated_sludge_process: 'Wastewater & Reuse',
    membrane_bioreactors: 'Wastewater & Reuse',
    water_reuse_reclamation: 'Wastewater & Reuse',
    filters_membranes_early: 'Desalination & Advanced Treatment',
    industrial_water_softening: 'Desalination & Advanced Treatment',
    ion_exchange_water_softening: 'Desalination & Advanced Treatment',
    membrane_filtration_water_treatment: 'Desalination & Advanced Treatment',
    reverse_osmosis_desalination: 'Desalination & Advanced Treatment',
    desalination_energy_recovery: 'Desalination & Advanced Treatment',
    advanced_oxidation_water_treatment: 'Desalination & Advanced Treatment',
    pfas_treatment_water_systems: 'Desalination & Advanced Treatment',
    civic_water_meters: 'Monitoring & Utility Operations',
    water_management_guilds: 'Monitoring & Utility Operations',
    water_quality_ordinances: 'Monitoring & Utility Operations',
    public_health_inspections: 'Monitoring & Utility Operations',
    scada_water_systems: 'Monitoring & Utility Operations',
    acoustic_leak_detection: 'Monitoring & Utility Operations',
    smart_water_networks: 'Monitoring & Utility Operations',
    low_energy_desalination_membranes: 'Roadmap'
};

const PHARMA_FIELD_LANES = {
    pharmacopoeia: 'Materia Medica & Pharmacy',
    pharmacopoeia_compilation: 'Materia Medica & Pharmacy',
    hospital_pharmacies: 'Materia Medica & Pharmacy',
    experimental_pharmacology: 'Experimental Pharmacology',
    dose_response_testing: 'Experimental Pharmacology',
    organic_chemistry: 'Industrial Drug Manufacturing',
    alkaloid_isolation: 'Industrial Drug Manufacturing',
    tablet_pressing: 'Industrial Drug Manufacturing',
    sterile_injectable_drugs: 'Industrial Drug Manufacturing',
    good_manufacturing_practice: 'Industrial Drug Manufacturing',
    continuous_pharmaceutical_manufacturing: 'Industrial Drug Manufacturing',
    randomized_controlled_trials: 'Clinical Development & Regulation',
    double_blind_clinical_trials: 'Clinical Development & Regulation',
    good_laboratory_practice_toxicology: 'Clinical Development & Regulation',
    phase_i_iii_clinical_trials: 'Clinical Development & Regulation',
    regulatory_drug_approval: 'Clinical Development & Regulation',
    pharmaceuticals_drug_design: 'Small-Molecule Drugs',
    antibiotics: 'Small-Molecule Drugs',
    antibiotic_susceptibility_testing: 'Small-Molecule Drugs',
    pharmacokinetics_pharmacodynamics: 'Small-Molecule Drugs',
    medicinal_chemistry: 'Small-Molecule Drugs',
    high_throughput_screening: 'Small-Molecule Drugs',
    combinatorial_chemistry: 'Small-Molecule Drugs',
    lead_optimization: 'Small-Molecule Drugs',
    structure_based_drug_design: 'Small-Molecule Drugs',
    recombinant_dna_genetic_engineering: 'Biologics & Vaccines',
    recombinant_protein_drugs: 'Biologics & Vaccines',
    biopharmaceutical_manufacturing: 'Biologics & Vaccines',
    monoclonal_antibodies: 'Biologics & Vaccines',
    vaccine_development_modern: 'Biologics & Vaccines',
    insulin_therapy: 'Biologics & Vaccines',
    gene_therapy_vectors: 'Biologics & Vaccines',
    immuno_oncology_checkpoint_inhibitors: 'Biologics & Vaccines',
    biosimilars: 'Biologics & Vaccines',
    mrna_vaccines: 'Biologics & Vaccines',
    mrna_vaccine_platforms: 'Biologics & Vaccines',
    messenger_rna_therapeutics: 'Biologics & Vaccines',
    cell_culture: 'Biologics & Vaccines',
    molecular_biology: 'Biologics & Vaccines',
    controlled_release_formulations: 'Drug Delivery & Formulation',
    lipid_nanoparticles: 'Drug Delivery & Formulation',
    nanomedicine_drug_delivery: 'Drug Delivery & Formulation',
    pharmacogenomics: 'Pharmacovigilance & Real-World Evidence',
    adverse_event_reporting_systems: 'Pharmacovigilance & Real-World Evidence',
    real_world_evidence_regulatory_science: 'Pharmacovigilance & Real-World Evidence',
    dna_sequencing: 'Pharmacovigilance & Real-World Evidence',
    computer_aided_drug_design: 'Computational & AI Drug Discovery',
    bioinformatics: 'Computational & AI Drug Discovery',
    protein_structure_prediction_ai: 'Computational & AI Drug Discovery',
    ai_driven_drug_discovery: 'Roadmap',
    ai_closed_loop_drug_discovery: 'Roadmap'
};

function fieldOverrides(field, lanes) {
    return Object.fromEntries(Object.entries(lanes).map(([id, lane]) => [
        id,
        {
            fields: [field],
            fieldLanes: { [field]: lane },
            maturity: lane === 'Roadmap' ? 'forecast' : 'established'
        }
    ]));
}

const FIELD_OVERRIDES = {
    ...fieldOverrides(TELECOM_FIELD, TELECOM_FIELD_LANES),
    ...fieldOverrides(WATER_FIELD, WATER_FIELD_LANES),
    ...fieldOverrides(PHARMA_FIELD, PHARMA_FIELD_LANES)
};

FIELD_OVERRIDES.quantum_internet.roadmap = {
    role: 'roadmap',
    timeframe: '2030s+',
    confidence: 'medium',
    blockers: ['repeater scaling', 'loss-tolerant quantum memories', 'standards and interconnection'],
    rationale: 'Quantum networking is an active research roadmap rather than a broadly deployed communication infrastructure.'
};
FIELD_OVERRIDES['5g_6g_communication_networks'].roadmap = {
    role: 'roadmap',
    timeframe: '2030s',
    confidence: 'medium',
    blockers: ['spectrum allocation', 'radio hardware maturity', 'energy efficiency', 'standards completion'],
    rationale: '6G work is in pre-commercial standardization and research, while established 5G is represented separately by 5G New Radio.'
};
FIELD_OVERRIDES.low_energy_desalination_membranes.roadmap = {
    role: 'roadmap',
    timeframe: '2030s',
    confidence: 'medium',
    blockers: ['membrane fouling', 'brine management', 'energy intensity', 'capital cost'],
    rationale: 'Lower-energy desalination is a clear water-scarcity roadmap area, but deployment depends on membrane durability, process integration, and cost reduction.'
};
FIELD_OVERRIDES.continuous_pharmaceutical_manufacturing.maturity = 'emerging';
FIELD_OVERRIDES.ai_driven_drug_discovery.roadmap = {
    role: 'roadmap',
    timeframe: '2030s',
    confidence: 'medium',
    blockers: ['model validation', 'assay reproducibility', 'data quality', 'regulatory acceptance'],
    rationale: 'AI is already used in drug discovery, but broad end-to-end AI-driven discovery remains a roadmap capability that depends on validated models, assays, and clinical translation.'
};
FIELD_OVERRIDES.ai_closed_loop_drug_discovery.roadmap = {
    role: 'roadmap',
    timeframe: 'late 2030s to 2040s',
    confidence: 'medium-low',
    blockers: ['robotic synthesis integration', 'active-learning reliability', 'safety/toxicity prediction', 'regulatory evidence standards'],
    rationale: 'Closed-loop systems can plausibly compress candidate optimization, but dependable clinical impact requires automation, assay, safety, and validation advances.'
};

const WATER_SOURCES = {
    whoDrinking: { title: 'Drinking-water', url: 'https://www.who.int/news-room/fact-sheets/detail/drinking-water', publisher: 'World Health Organization', year: 2023, source_type: 'official_agency' },
    whoSanitationSafety: { title: 'Sanitation Safety', url: 'https://www.who.int/teams/environment-climate-change-and-health/water-sanitation-and-health/sanitation-safety', publisher: 'World Health Organization', year: 2026, source_type: 'official_agency' },
    cdcDrinkingWater: { title: 'Preventing Waterborne Germs at Home', url: 'https://www.cdc.gov/drinking-water/prevention/index.html', publisher: 'CDC', year: 2026, source_type: 'official_agency' },
    epaDrinkingWater: { title: 'Ground Water and Drinking Water', url: 'https://www.epa.gov/ground-water-and-drinking-water', publisher: 'U.S. Environmental Protection Agency', year: 2026, source_type: 'official_agency' },
    epaSdwa: { title: 'Summary of the Safe Drinking Water Act', url: 'https://www.epa.gov/sdwa', publisher: 'U.S. Environmental Protection Agency', year: 2026, source_type: 'official_agency' },
    epaDrinkingRegulations: { title: 'Drinking Water Regulations', url: 'https://www.epa.gov/dwreginfo/drinking-water-regulations', publisher: 'U.S. Environmental Protection Agency', year: 2026, source_type: 'official_agency' },
    epaWastewater: { title: 'Municipal Wastewater', url: 'https://www.epa.gov/npdes/municipal-wastewater', publisher: 'U.S. Environmental Protection Agency', year: 2026, source_type: 'official_agency' },
    epaWaterReuse: { title: 'Water Reuse', url: 'https://www.epa.gov/waterreuse', publisher: 'U.S. Environmental Protection Agency', year: 2026, source_type: 'official_agency' },
    epaWaterReuseBasics: { title: 'Basic Information about Water Reuse', url: 'https://www.epa.gov/waterreuse/basic-information-about-water-reuse', publisher: 'U.S. Environmental Protection Agency', year: 2026, source_type: 'official_agency' },
    epaSeptic: { title: 'Septic Systems', url: 'https://www.epa.gov/septic', publisher: 'U.S. Environmental Protection Agency', year: 2026, source_type: 'official_agency' },
    epaPfas: { title: 'PFAS', url: 'https://www.epa.gov/pfas', publisher: 'U.S. Environmental Protection Agency', year: 2026, source_type: 'official_agency' },
    britannicaDam: { title: 'Dam', url: 'https://www.britannica.com/technology/dam-engineering', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' },
    britannicaQanat: { title: 'Qanat', url: 'https://www.britannica.com/technology/qanat', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' },
    britannicaAqueduct: { title: 'Aqueduct', url: 'https://www.britannica.com/technology/aqueduct-engineering', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' },
    britannicaPlumbing: { title: 'Plumbing', url: 'https://www.britannica.com/technology/plumbing', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' },
    britannicaSewerage: { title: 'Sewerage System', url: 'https://www.britannica.com/technology/sewerage-system', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' },
    britannicaToilet: { title: 'Toilet', url: 'https://www.britannica.com/technology/toilet-sanitation', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' },
    britannicaSeptic: { title: 'Septic Tank', url: 'https://www.britannica.com/technology/septic-tank', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' },
    britannicaWaterSupply: { title: 'Water Supply System', url: 'https://www.britannica.com/technology/water-supply-system', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' },
    britannicaFiltration: { title: 'Filtration', url: 'https://www.britannica.com/technology/filtration-chemistry', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' },
    nawi: { title: 'National Alliance for Water Innovation', url: 'https://www.nawihub.org/', publisher: 'National Alliance for Water Innovation', year: 2026, source_type: 'official_agency' }
};

const PHARMA_SOURCES = {
    britannicaPharmacy: { title: 'Pharmacy', url: 'https://www.britannica.com/science/pharmacy', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' },
    britannicaPharmacology: { title: 'Pharmacology', url: 'https://www.britannica.com/science/pharmacology', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' },
    britannicaOrganic: { title: 'Organic Chemistry', url: 'https://www.britannica.com/science/organic-chemistry', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' },
    britannicaAlkaloid: { title: 'Alkaloid', url: 'https://www.britannica.com/science/alkaloid', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' },
    britannicaPharmaIndustry: { title: 'Pharmaceutical Industry: Drug Discovery and Development', url: 'https://www.britannica.com/technology/pharmaceutical-industry/Drug-discovery-and-development', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' },
    bmjStreptomycin: { title: 'Streptomycin Treatment of Pulmonary Tuberculosis', url: 'https://www.bmj.com/content/2/4582/769', publisher: 'British Medical Journal', year: 1948, source_type: 'primary_paper' },
    clinicalTrialsGlossary: { title: 'ClinicalTrials.gov Glossary', url: 'https://clinicaltrials.gov/study-basics/glossary', publisher: 'ClinicalTrials.gov', year: 2026, source_type: 'official_agency' },
    fdaDrugDevelopment: { title: 'The Drug Development Process', url: 'https://www.fda.gov/patients/learn-about-drug-and-device-approvals/drug-development-process', publisher: 'U.S. Food and Drug Administration', year: 2026, source_type: 'official_agency' },
    fdaDevelopmentDefinitions: { title: 'Drug Development and Review Definitions', url: 'https://www.fda.gov/drugs/investigational-new-drug-ind-application/drug-development-and-review-definitions', publisher: 'U.S. Food and Drug Administration', year: 2026, source_type: 'official_agency' },
    fdaCgmp: { title: 'Facts About Current Good Manufacturing Practices (CGMPs)', url: 'https://www.fda.gov/drugs/pharmaceutical-quality-resources/facts-about-current-good-manufacturing-practice-cgmp', publisher: 'U.S. Food and Drug Administration', year: 2026, source_type: 'official_agency' },
    fdaGlp: { title: 'Scope and Authority', url: 'https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/fda-bioresearch-monitoring-information/scope-and-authority', publisher: 'U.S. Food and Drug Administration', year: 2026, source_type: 'official_agency' },
    fdaPharmacometrics: { title: 'Division of Pharmacometrics', url: 'https://www.fda.gov/about-fda/cder-offices-and-divisions/division-pharmacometrics', publisher: 'U.S. Food and Drug Administration', year: 2026, source_type: 'official_agency' },
    fdaModifiedRelease: { title: 'SUPAC-MR: Modified Release Solid Oral Dosage Forms', url: 'https://www.fda.gov/downloads/Drugs/GuidanceComplianceRegulatoryInformation/Guidances/ucm070640.pdf', publisher: 'U.S. Food and Drug Administration', year: 1997, source_type: 'official_agency' },
    fdaFaers: { title: 'FDA Adverse Event Reporting System', url: 'https://www.fda.gov/drugs/surveillance-post-drug-approval-activities/fda-adverse-event-monitoring-system-aems', publisher: 'U.S. Food and Drug Administration', year: 2026, source_type: 'official_agency' },
    fdaPharmacogenomics: { title: 'Table of Pharmacogenomic Biomarkers in Drug Labeling', url: 'https://www.fda.gov/drugs/science-and-research-drugs/table-pharmacogenomic-biomarkers-drug-labeling', publisher: 'U.S. Food and Drug Administration', year: 2026, source_type: 'official_agency' },
    fdaRealWorldEvidence: { title: 'Real-World Evidence', url: 'https://www.fda.gov/science-research/science-and-research-special-topics/real-world-evidence', publisher: 'U.S. Food and Drug Administration', year: 2026, source_type: 'official_agency' },
    fdaBiologics: { title: 'Biologics', url: 'https://www.fda.gov/vaccines-blood-biologics', publisher: 'U.S. Food and Drug Administration', year: 2026, source_type: 'official_agency' },
    fdaVaccines: { title: 'Vaccines', url: 'https://www.fda.gov/vaccines-blood-biologics/vaccines', publisher: 'U.S. Food and Drug Administration', year: 2026, source_type: 'official_agency' },
    fdaGeneTherapy: { title: 'Cellular and Gene Therapy Products', url: 'https://www.fda.gov/vaccines-blood-biologics/cellular-gene-therapy-products', publisher: 'U.S. Food and Drug Administration', year: 2026, source_type: 'official_agency' },
    fdaBiosimilars: { title: 'Review and Approval', url: 'https://www.fda.gov/drugs/biosimilars/review-and-approval', publisher: 'U.S. Food and Drug Administration', year: 2026, source_type: 'official_agency' },
    fdaContinuousManufacturing: { title: 'Q13 Continuous Manufacturing of Drug Substances and Drug Products', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/q13-continuous-manufacturing-drug-substances-and-drug-products', publisher: 'U.S. Food and Drug Administration', year: 2023, source_type: 'official_agency' },
    fdaAntimicrobialTesting: { title: 'Antibacterial Susceptibility Test Interpretive Criteria', url: 'https://www.fda.gov/drugs/development-resources/antibacterial-susceptibility-test-interpretive-criteria', publisher: 'U.S. Food and Drug Administration', year: 2026, source_type: 'official_agency' },
    ncatsScreening: { title: 'Assay Development and Screening Technology', url: 'https://ncats.nih.gov/adst', publisher: 'National Center for Advancing Translational Sciences', year: 2026, source_type: 'official_agency' },
    ncbiPk: { title: 'Pharmacokinetics', url: 'https://www.ncbi.nlm.nih.gov/sites/books/NBK557744/', publisher: 'NCBI Bookshelf', year: 2023, source_type: 'textbook' },
    ncbiPd: { title: 'Pharmacodynamics', url: 'https://www.ncbi.nlm.nih.gov/sites/books/NBK507791/', publisher: 'NCBI Bookshelf', year: 2023, source_type: 'textbook' },
    ncbiAdmeTox: { title: 'Role of in vitro 2D and 3D cell culture systems for ADME-Tox screening in drug discovery and development', url: 'https://pubmed.ncbi.nlm.nih.gov/36778905/', publisher: 'PubMed', year: 2023, source_type: 'review' },
    genomeRecombinantDna: { title: 'Recombinant DNA Technology', url: 'https://www.genome.gov/genetics-glossary/recombinant-dna-technology', publisher: 'National Human Genome Research Institute', year: 2026, source_type: 'official_agency' },
    ncbiMolecularBiology: { title: 'Molecular Biology of the Cell', url: 'https://www.ncbi.nlm.nih.gov/sites/books/NBK21054/', publisher: 'NCBI Bookshelf', year: 2002, source_type: 'textbook' },
    genomeBioinformatics: { title: 'Bioinformatics', url: 'https://www.genome.gov/genetics-glossary/Bioinformatics', publisher: 'National Human Genome Research Institute', year: 2026, source_type: 'official_agency' },
    genomeDnaSequencing: { title: 'DNA Sequencing', url: 'https://www.genome.gov/genetics-glossary/DNA-Sequencing', publisher: 'National Human Genome Research Institute', year: 2026, source_type: 'official_agency' },
    atccCellCulture: { title: 'Primary Cell Culture Guide', url: 'https://www.atcc.org/resources/culture-guides/primary-cell-culture-guide', publisher: 'ATCC', year: 2026, source_type: 'textbook' },
    nciMonoclonal: { title: 'Monoclonal Antibodies', url: 'https://www.cancer.gov/about-cancer/treatment/types/immunotherapy/monoclonal-antibodies', publisher: 'National Cancer Institute', year: 2026, source_type: 'official_agency' },
    nciCheckpoint: { title: 'Immune Checkpoint Inhibitors', url: 'https://www.cancer.gov/about-cancer/treatment/types/immunotherapy/checkpoint-inhibitors', publisher: 'National Cancer Institute', year: 2026, source_type: 'official_agency' },
    nobelInsulin: { title: 'The Nobel Prize in Physiology or Medicine 1923', url: 'https://www.nobelprize.org/prizes/medicine/1923/summary/', publisher: 'Nobel Prize', year: 2026, source_type: 'museum' },
    nobelPenicillin: { title: 'The Nobel Prize in Physiology or Medicine 1945', url: 'https://www.nobelprize.org/prizes/medicine/1945/summary/', publisher: 'Nobel Prize', year: 2026, source_type: 'museum' },
    cdcVaccineDevelopment: { title: 'How Vaccines are Developed and Approved for Use', url: 'https://www.cdc.gov/vaccines/basics/how-developed-approved.html', publisher: 'CDC', year: 2026, source_type: 'official_agency' },
    hhsVaccineTypes: { title: 'Vaccine Types', url: 'https://www.hhs.gov/immunization/basics/types/index.html', publisher: 'U.S. Department of Health and Human Services', year: 2026, source_type: 'official_agency' },
    nistLipidNanoparticles: { title: 'Morphological Characterization of Self-Amplifying mRNA Lipid Nanoparticles', url: 'https://www.nist.gov/publications/morphological-characterization-self-amplifying-mrna-lipid-nanoparticles', publisher: 'NIST', year: 2024, source_type: 'official_agency' },
    pubmedLipidNanoparticles: { title: 'Lipid nanoparticles for mRNA delivery', url: 'https://pubmed.ncbi.nlm.nih.gov/34394960/', publisher: 'PubMed', year: 2021, source_type: 'review' },
    natureDrugDiscoveryComputational: { title: 'Computational approaches streamlining drug discovery', url: 'https://www.nature.com/articles/s41586-023-05905-z', publisher: 'Nature', year: 2023, source_type: 'review' },
    natureAlphaFold: { title: 'Highly accurate protein structure prediction with AlphaFold', url: 'https://www.nature.com/articles/s41586-021-03819-2', publisher: 'Nature', year: 2021, source_type: 'primary_paper' },
    natureAiDrugDiscovery: { title: 'AI can help to speed up drug discovery - but only if we give it the right data', url: 'https://www.nature.com/articles/d41586-023-02896-9', publisher: 'Nature', year: 2023, source_type: 'review' },
    natureSelfDrivingLabs: { title: 'The rise of self-driving labs in chemical and materials sciences', url: 'https://www.nature.com/articles/s44160-022-00231-0', publisher: 'Nature Synthesis', year: 2023, source_type: 'review' }
};

const SOURCE_OVERRIDES = {
    instruction_tuning_rlhf: [
        AI_POSTTRAINING_SOURCES.stiennonSummarization,
        AI_POSTTRAINING_SOURCES.flanInstructionTuning,
        AI_POSTTRAINING_SOURCES.instructGpt
    ],
    advanced_chemistry: [
        { title: 'Chemistry', url: 'https://www.britannica.com/science/chemistry', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    construction: [
        { title: 'Construction', url: 'https://www.britannica.com/technology/construction', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    scientific_method: [
        { title: 'Scientific Method', url: 'https://plato.stanford.edu/entries/scientific-method/', publisher: 'Stanford Encyclopedia of Philosophy', year: 2025 }
    ],
    printing_press: [
        { title: 'Gutenberg Bible', url: 'https://www.loc.gov/item/2021666734', publisher: 'Library of Congress', year: 2021 }
    ],
    mathematics: [
        { title: 'Mathematics', url: 'https://www.britannica.com/science/mathematics', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    probability_statistics_inference: [
        { title: 'Statistics', url: 'https://www.britannica.com/science/statistics', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' },
        { title: 'Probability Theory', url: 'https://www.britannica.com/science/probability-theory', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' }
    ],
    writing: [
        { title: 'How to write cuneiform', url: 'https://www.britishmuseum.org/blog/how-write-cuneiform', publisher: 'British Museum', year: 2020 }
    ],
    record_keeping: [
        { title: 'How to write cuneiform', url: 'https://www.britishmuseum.org/blog/how-write-cuneiform', publisher: 'British Museum', year: 2020 }
    ],
    woodworking_basic: [
        { title: 'Woodworking', url: 'https://www.britannica.com/technology/woodworking', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    mass_production: [
        { title: 'Mass production', url: 'https://www.britannica.com/technology/mass-production', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    codified_law: [
        { title: 'Code of Hammurabi', url: 'https://www.britannica.com/topic/Code-of-Hammurabi', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    algorithms_computation_theory: [
        { title: 'Computation in Physical Systems', url: 'https://plato.stanford.edu/entries/computation-physicalsystems/', publisher: 'Stanford Encyclopedia of Philosophy', year: 2024 }
    ],
    electronics: [
        { title: 'The Silicon Engine', url: 'https://www.computerhistory.org/siliconengine/', publisher: 'Computer History Museum', year: 2007 }
    ],
    masonry: [
        { title: 'Masonry', url: 'https://www.britannica.com/technology/masonry', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    steam_engine: [
        { title: 'Rotative Steam Engine by Boulton and Watt, 1788', url: 'https://collection.sciencemuseumgroup.org.uk/objects/co50948/rotative-steam-engine-by-boulton-and-watt-1788-beam-engine-steam-engine', publisher: 'Science Museum Group', year: 2026 }
    ],
    geometry: [
        { title: 'Geometry', url: 'https://www.britannica.com/science/geometry', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    precision_machine_tools: [
        { title: 'American Precision Museum', url: 'https://ledger.americanprecision.org/american-precision-museum/', publisher: 'American Precision Museum', year: 2026 }
    ],
    quantum_physics: [
        { title: 'Quantum mechanics', url: 'https://www.britannica.com/science/quantum-mechanics-physics', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    philosophy: [
        { title: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/', publisher: 'Stanford Encyclopedia of Philosophy', year: 2026 }
    ],
    nanotechnology: [
        { title: 'About Nanotechnology', url: 'https://www.nano.gov/about-nanotechnology', publisher: 'National Nanotechnology Initiative', year: 2026 }
    ],
    guilds: [
        { title: 'Guild', url: 'https://www.britannica.com/topic/guild-trade-association', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    fire_control: [
        { title: 'Fire', url: 'https://www.britannica.com/science/fire-combustion', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    animal_husbandry: [
        { title: 'Animal breeding', url: 'https://www.britannica.com/science/animal-breeding', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    software_engineering: [
        { title: 'Software Engineering Body of Knowledge (SWEBOK)', url: 'https://www.computer.org/education/bodies-of-knowledge/software-engineering', publisher: 'IEEE Computer Society', year: 2025 }
    ],
    electric_motor: [
        { title: 'Electric Motor', url: 'https://www.britannica.com/technology/electric-motor', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' }
    ],
    internal_combustion_engine: [
        { title: 'Memorial - Daimler garden house in Bad Cannstatt', url: 'https://group.mercedes-benz.com/company/tradition/museums-historical-sites/daimler-memorial.html', publisher: 'Mercedes-Benz Museum', year: 2026 }
    ],
    transistors: [
        { title: 'The Silicon Engine', url: 'https://www.computerhistory.org/siliconengine/', publisher: 'Computer History Museum', year: 2007 }
    ],
    integrated_circuits: [
        { title: '1960: First Planar Integrated Circuit is Fabricated', url: 'https://www.computerhistory.org/siliconengine/first-planar-integrated-circuit-is-fabricated/', publisher: 'Computer History Museum', year: 2007 }
    ],
    semiconductors: [
        { title: 'The Silicon Engine', url: 'https://www.computerhistory.org/siliconengine/', publisher: 'Computer History Museum', year: 2007 }
    ],
    telegraph: [
        { title: 'Invention of the Telegraph', url: 'https://www.loc.gov/collections/samuel-morse-papers/articles-and-essays/invention-of-the-telegraph/', publisher: 'Library of Congress', year: 2026 }
    ],
    telephone: [
        { title: 'Alexander Graham Bell and the Telephone', url: 'https://www.loc.gov/collections/alexander-graham-bell-papers/articles-and-essays/alexander-graham-bell-and-the-telephone/', publisher: 'Library of Congress', year: 2026 }
    ],
    telephone_exchange: [
        { title: 'Telephone', url: 'https://www.britannica.com/technology/telephone', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' }
    ],
    telegraph_cables_transoceanic: [
        { title: 'Transatlantic Cable', url: 'https://ethw.org/Transatlantic_Cable', publisher: 'IEEE History Center', year: 2026 }
    ],
    coaxial_cable: [
        { title: 'Coaxial Cable', url: 'https://www.britannica.com/technology/coaxial-cable', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' }
    ],
    automatic_telephone_switching: [
        { title: 'Telephone', url: 'https://www.britannica.com/technology/telephone', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' }
    ],
    radio_telegraphy_wireless_communication: [
        { title: 'Guglielmo Marconi - Biographical', url: 'https://www.nobelprize.org/prizes/physics/1909/marconi/biographical/', publisher: 'Nobel Prize', year: 2026 }
    ],
    radio: [
        { title: 'Guglielmo Marconi - Biographical', url: 'https://www.nobelprize.org/prizes/physics/1909/marconi/biographical/', publisher: 'Nobel Prize', year: 2026 }
    ],
    telecommunications: [
        { title: 'History of ITU', url: 'https://www.itu.int/en/history/Pages/ITUsHistory.aspx', publisher: 'International Telecommunication Union', year: 2026 }
    ],
    microwave_relay_networks: [
        { title: 'Microwave Telecommunication', url: 'https://www.britannica.com/technology/microwave-telecommunication', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' }
    ],
    information_theory: [
        { title: 'A Mathematical Theory of Communication', url: 'https://doi.org/10.1002/j.1538-7305.1948.tb01338.x', publisher: 'Bell System Technical Journal', year: 1948 }
    ],
    frequency_division_multiplexing: [
        { title: 'Telecommunications media - Frequency-division multiplexing', url: 'https://www.britannica.com/technology/telecommunications-media/Frequency-division-multiplexing', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' }
    ],
    time_division_multiplexing: [
        { title: 'Telecommunications media - Time-division multiplexing', url: 'https://www.britannica.com/technology/telecommunications-media/Time-division-multiplexing', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' }
    ],
    computer_networking: [
        { title: 'A Brief History of the Internet', url: 'https://www.internetsociety.org/internet/history-internet/brief-history-internet/', publisher: 'Internet Society', year: 2026 }
    ],
    packet_switching: [
        { title: 'On Distributed Communications: I. Introduction to Distributed Communications Networks', url: 'https://www.rand.org/pubs/research_memoranda/RM3420.html', publisher: 'RAND Corporation', year: 1964 }
    ],
    internet_protocols_tcp_ip_arpanet: [
        { title: 'A Protocol for Packet Network Intercommunication', url: 'https://doi.org/10.1109/TCOM.1974.1092259', publisher: 'IEEE Transactions on Communications', year: 1974 }
    ],
    local_area_networks: [
        { title: 'Networking', url: 'https://www.computerhistory.org/revolution/networking/19', publisher: 'Computer History Museum', year: 2026 }
    ],
    ethernet: [
        { title: 'Ethernet', url: 'https://www.computerhistory.org/revolution/networking/19/381', publisher: 'Computer History Museum', year: 2026 }
    ],
    internet: [
        { title: 'ARPANET', url: 'https://www.darpa.mil/about-us/timeline/arpanet', publisher: 'DARPA', year: 2026 }
    ],
    domain_name_system: [
        { title: 'RFC 1034: Domain Names - Concepts and Facilities', url: 'https://datatracker.ietf.org/doc/html/rfc1034', publisher: 'RFC Editor', year: 1987 }
    ],
    border_gateway_protocol: [
        { title: 'RFC 4271: A Border Gateway Protocol 4 (BGP-4)', url: 'https://datatracker.ietf.org/doc/html/rfc4271', publisher: 'RFC Editor', year: 2006 }
    ],
    network_time_protocol: [
        { title: 'RFC 5905: Network Time Protocol Version 4', url: 'https://datatracker.ietf.org/doc/html/rfc5905', publisher: 'RFC Editor', year: 2010 }
    ],
    world_wide_web: [
        { title: 'The World Wide Web Project', url: 'https://info.cern.ch/hypertext/WWW/TheProject.html', publisher: 'CERN', year: 1991 }
    ],
    http_protocol: [
        { title: 'RFC 9110: HTTP Semantics', url: 'https://datatracker.ietf.org/doc/html/rfc9110', publisher: 'RFC Editor', year: 2022 }
    ],
    web_browsers: [
        { title: 'The WorldWideWeb browser', url: 'https://www.w3.org/People/Berners-Lee/WorldWideWeb.html', publisher: 'World Wide Web Consortium', year: 1990 }
    ],
    fiber_optics: [
        { title: 'The Nobel Prize in Physics 2009 - Charles K. Kao', url: 'https://www.nobelprize.org/prizes/physics/2009/kao/facts/', publisher: 'Nobel Prize', year: 2026 }
    ],
    dense_wavelength_division_multiplexing: [
        { title: 'ITU-T G.694.1 Spectral grids for WDM applications', url: 'https://www.itu.int/rec/T-REC-G.694.1', publisher: 'International Telecommunication Union', year: 2020 }
    ],
    submarine_fiber_optic_cables: [
        { title: 'Submarine Cable', url: 'https://www.britannica.com/technology/submarine-cable', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' }
    ],
    cellular_networks: [
        { title: 'Mobile Computing', url: 'https://www.computerhistory.org/revolution/mobile-computing/18', publisher: 'Computer History Museum', year: 2026 }
    ],
    gsm_digital_cellular: [
        { title: '2G - Global System for Mobile Communication', url: 'https://www.etsi.org/technologies/mobile/2g', publisher: 'ETSI', year: 2026 }
    ],
    lte_4g_networks: [
        { title: 'LTE', url: 'https://www.3gpp.org/technologies/lte', publisher: '3GPP', year: 2026 }
    ],
    five_g_new_radio: [
        { title: '5G System Overview', url: 'https://www.3gpp.org/technologies/5g-system-overview', publisher: '3GPP', year: 2026 }
    ],
    mobile_phones: [
        { title: 'Mobile Computing', url: 'https://www.computerhistory.org/revolution/mobile-computing/18', publisher: 'Computer History Museum', year: 2026 }
    ],
    mobile_broadband_networks: [
        { title: 'IMT-2000', url: 'https://www.itu.int/rec/R-REC-M.1457', publisher: 'International Telecommunication Union', year: 2026 }
    ],
    wifi_wireless_networking: [
        { title: 'IEEE 802.11 Wireless LAN', url: 'https://standards.ieee.org/ieee/802.11/7028/', publisher: 'IEEE Standards Association', year: 2020 }
    ],
    bluetooth_short_range: [
        { title: 'Bluetooth Technology Overview', url: 'https://www.bluetooth.com/learn-about-bluetooth/tech-overview/', publisher: 'Bluetooth SIG', year: 2026 }
    ],
    smartphones: [
        { title: 'Mobile Computing', url: 'https://www.computerhistory.org/revolution/mobile-computing/18', publisher: 'Computer History Museum', year: 2026 }
    ],
    internet_of_things_iot_ubiquitous_connectivity: [
        { title: 'NIST Cybersecurity for IoT Program', url: 'https://www.nist.gov/itl/applied-cybersecurity/nist-cybersecurity-iot-program', publisher: 'NIST', year: 2026 }
    ],
    rfid_tracking: [
        { title: 'EPC/RFID Standards', url: 'https://www.gs1.org/standards/epc-rfid', publisher: 'GS1', year: 2026 }
    ],
    email_messaging_protocols: [
        { title: 'RFC 5321: Simple Mail Transfer Protocol', url: 'https://datatracker.ietf.org/doc/html/rfc5321', publisher: 'RFC Editor', year: 2008 }
    ],
    voice_over_ip: [
        { title: 'RFC 3261: SIP: Session Initiation Protocol', url: 'https://datatracker.ietf.org/doc/html/rfc3261', publisher: 'RFC Editor', year: 2002 }
    ],
    content_delivery_networks: [
        { title: 'Akamai: A Case Study in Internet Content Delivery', url: 'https://dl.acm.org/doi/10.1145/347057.347425', publisher: 'ACM SIGCOMM Computer Communication Review', year: 2000 }
    ],
    mesh_wifi_networks: [
        { title: 'IEEE 802.11s Wireless LAN Mesh Networking', url: 'https://standards.ieee.org/ieee/802.11s/4243/', publisher: 'IEEE Standards Association', year: 2011 }
    ],
    cable_modems_docsis: [
        { title: 'A 101 on DOCSIS Technology', url: 'https://www.cablelabs.com/blog/a-101-on-docsis-technology-the-heart-of-cable-broadband', publisher: 'CableLabs', year: 2018 }
    ],
    digital_subscriber_line_dsl: [
        { title: 'ITU-T G.992.1 ADSL transceivers', url: 'https://www.itu.int/rec/T-REC-G.992.1', publisher: 'International Telecommunication Union', year: 1999 }
    ],
    network_management_snmp: [
        { title: 'RFC 1157: Simple Network Management Protocol', url: 'https://datatracker.ietf.org/doc/html/rfc1157', publisher: 'RFC Editor', year: 1990 }
    ],
    software_defined_networking: [
        { title: 'Software-Defined Networking Definition', url: 'https://opennetworking.org/sdn-definition/', publisher: 'Open Networking Foundation', year: 2026 }
    ],
    tls_ssl_secure_transport: [
        { title: 'RFC 8446: The Transport Layer Security Protocol Version 1.3', url: 'https://datatracker.ietf.org/doc/html/rfc8446', publisher: 'RFC Editor', year: 2018 }
    ],
    communications_satellites: [
        { title: 'Telstar Opened Era of Global Satellite Television', url: 'https://www.nasa.gov/history/telstar-opened-era-of-global-satellite-television/', publisher: 'NASA', year: 2012 }
    ],
    quantum_internet: [
        { title: 'The Quantum Internet', url: 'https://doi.org/10.1126/science.aam9288', publisher: 'Science', year: 2018, source_type: 'primary_paper', supports: ['node', 'roadmap', 'maturity'] }
    ],
    '5g_6g_communication_networks': [
        { title: 'IMT-2030', url: 'https://www.itu.int/en/ITU-R/study-groups/rsg5/rwp5d/imt-2030/Pages/default.aspx', publisher: 'International Telecommunication Union', year: 2026, supports: ['node', 'roadmap', 'maturity'] }
    ],
    water_carrying_techniques: [WATER_SOURCES.whoDrinking],
    wells_and_cisterns: [WATER_SOURCES.britannicaWaterSupply],
    rainwater_harvesting: [WATER_SOURCES.whoDrinking],
    dams_and_reservoirs: [WATER_SOURCES.britannicaDam],
    qanat_water_supply: [WATER_SOURCES.britannicaQanat],
    municipal_water_supply: [WATER_SOURCES.britannicaWaterSupply],
    water_towers_pressure_distribution: [WATER_SOURCES.britannicaWaterSupply],
    irrigation: [WATER_SOURCES.britannicaWaterSupply],
    irrigation_canals_local: [WATER_SOURCES.britannicaWaterSupply],
    irrigation_sluice_gates: [WATER_SOURCES.britannicaWaterSupply],
    aqueducts: [WATER_SOURCES.britannicaAqueduct],
    aqueduct_siphons_lead_pipes: [WATER_SOURCES.britannicaAqueduct],
    water_distribution_pipes: [WATER_SOURCES.britannicaWaterSupply],
    plumbing: [WATER_SOURCES.britannicaPlumbing],
    canal_lock_gates: [WATER_SOURCES.britannicaWaterSupply],
    water_powered_pumps: [WATER_SOURCES.britannicaWaterSupply],
    latrines_and_waste_pits: [WATER_SOURCES.whoSanitationSafety],
    public_latrines: [WATER_SOURCES.whoSanitationSafety],
    sewers_and_drainage: [WATER_SOURCES.britannicaSewerage],
    flush_toilet_trap_seal: [WATER_SOURCES.britannicaToilet],
    sanitary_sewer_networks: [WATER_SOURCES.britannicaSewerage],
    public_sanitation_modern: [WATER_SOURCES.whoSanitationSafety],
    septic_tank_systems: [WATER_SOURCES.epaSeptic],
    stormwater_drainage_systems: [WATER_SOURCES.britannicaSewerage],
    water_filtration_sand_charcoal: [WATER_SOURCES.britannicaFiltration],
    slow_sand_filtration: [WATER_SOURCES.cdcDrinkingWater],
    rapid_sand_filtration: [WATER_SOURCES.epaDrinkingWater],
    coagulation_flocculation_water_treatment: [WATER_SOURCES.epaDrinkingWater],
    municipal_water_treatment: [WATER_SOURCES.epaDrinkingWater],
    urban_water_chlorination: [WATER_SOURCES.epaDrinkingRegulations],
    fluoridated_drinking_water: [WATER_SOURCES.epaDrinkingRegulations],
    ozone_water_treatment: [WATER_SOURCES.epaDrinkingWater],
    ultraviolet_water_disinfection: [WATER_SOURCES.cdcDrinkingWater],
    water_quality_testing: [WATER_SOURCES.epaSdwa],
    municipal_wastewater_treatment: [WATER_SOURCES.epaWastewater],
    activated_sludge_process: [WATER_SOURCES.epaWastewater],
    membrane_bioreactors: [WATER_SOURCES.epaWastewater],
    water_reuse_reclamation: [WATER_SOURCES.epaWaterReuseBasics],
    filters_membranes_early: [WATER_SOURCES.britannicaFiltration],
    industrial_water_softening: [WATER_SOURCES.epaDrinkingWater],
    ion_exchange_water_softening: [WATER_SOURCES.epaDrinkingWater],
    membrane_filtration_water_treatment: [WATER_SOURCES.epaDrinkingWater],
    reverse_osmosis_desalination: [WATER_SOURCES.epaDrinkingWater],
    desalination_energy_recovery: [WATER_SOURCES.nawi],
    advanced_oxidation_water_treatment: [WATER_SOURCES.epaDrinkingWater],
    pfas_treatment_water_systems: [WATER_SOURCES.epaPfas],
    civic_water_meters: [WATER_SOURCES.britannicaWaterSupply],
    water_management_guilds: [WATER_SOURCES.britannicaWaterSupply],
    water_quality_ordinances: [WATER_SOURCES.whoDrinking],
    public_health_inspections: [WATER_SOURCES.whoSanitationSafety],
    scada_water_systems: [WATER_SOURCES.epaDrinkingWater],
    acoustic_leak_detection: [WATER_SOURCES.britannicaWaterSupply],
    smart_water_networks: [WATER_SOURCES.epaDrinkingWater],
    low_energy_desalination_membranes: [
        { ...WATER_SOURCES.nawi, supports: ['node', 'roadmap', 'maturity'] }
    ],
    pharmacopoeia: [PHARMA_SOURCES.britannicaPharmacy],
    pharmacopoeia_compilation: [PHARMA_SOURCES.britannicaPharmacy],
    hospital_pharmacies: [PHARMA_SOURCES.britannicaPharmacy],
    experimental_pharmacology: [PHARMA_SOURCES.britannicaPharmacology],
    dose_response_testing: [PHARMA_SOURCES.britannicaPharmacology],
    organic_chemistry: [PHARMA_SOURCES.britannicaOrganic],
    alkaloid_isolation: [PHARMA_SOURCES.britannicaAlkaloid],
    tablet_pressing: [PHARMA_SOURCES.britannicaPharmaIndustry],
    sterile_injectable_drugs: [PHARMA_SOURCES.fdaCgmp],
    good_manufacturing_practice: [PHARMA_SOURCES.fdaCgmp],
    continuous_pharmaceutical_manufacturing: [PHARMA_SOURCES.fdaContinuousManufacturing],
    randomized_controlled_trials: [PHARMA_SOURCES.bmjStreptomycin, PHARMA_SOURCES.clinicalTrialsGlossary],
    double_blind_clinical_trials: [PHARMA_SOURCES.clinicalTrialsGlossary],
    good_laboratory_practice_toxicology: [PHARMA_SOURCES.fdaGlp],
    phase_i_iii_clinical_trials: [PHARMA_SOURCES.fdaDrugDevelopment, PHARMA_SOURCES.clinicalTrialsGlossary],
    regulatory_drug_approval: [PHARMA_SOURCES.fdaDrugDevelopment],
    pharmaceuticals_drug_design: [PHARMA_SOURCES.britannicaPharmaIndustry, PHARMA_SOURCES.fdaDevelopmentDefinitions],
    antibiotics: [PHARMA_SOURCES.nobelPenicillin, PHARMA_SOURCES.britannicaPharmaIndustry],
    antibiotic_susceptibility_testing: [PHARMA_SOURCES.fdaAntimicrobialTesting],
    pharmacokinetics_pharmacodynamics: [PHARMA_SOURCES.fdaPharmacometrics, PHARMA_SOURCES.ncbiPk, PHARMA_SOURCES.ncbiPd],
    controlled_release_formulations: [PHARMA_SOURCES.fdaModifiedRelease],
    medicinal_chemistry: [PHARMA_SOURCES.britannicaPharmaIndustry],
    high_throughput_screening: [PHARMA_SOURCES.ncatsScreening],
    combinatorial_chemistry: [PHARMA_SOURCES.britannicaPharmaIndustry],
    lead_optimization: [PHARMA_SOURCES.britannicaPharmaIndustry, PHARMA_SOURCES.natureDrugDiscoveryComputational],
    structure_based_drug_design: [PHARMA_SOURCES.natureDrugDiscoveryComputational],
    computer_aided_drug_design: [PHARMA_SOURCES.natureDrugDiscoveryComputational],
    in_vitro_adme_toxicology: [PHARMA_SOURCES.ncbiAdmeTox],
    pharmacogenomics: [PHARMA_SOURCES.fdaPharmacogenomics],
    adverse_event_reporting_systems: [PHARMA_SOURCES.fdaFaers],
    real_world_evidence_regulatory_science: [PHARMA_SOURCES.fdaRealWorldEvidence],
    recombinant_dna_genetic_engineering: [PHARMA_SOURCES.genomeRecombinantDna],
    recombinant_protein_drugs: [PHARMA_SOURCES.genomeRecombinantDna, PHARMA_SOURCES.fdaBiologics],
    biopharmaceutical_manufacturing: [PHARMA_SOURCES.fdaBiologics, PHARMA_SOURCES.fdaCgmp],
    monoclonal_antibodies: [PHARMA_SOURCES.nciMonoclonal],
    vaccine_development_modern: [PHARMA_SOURCES.fdaVaccines, PHARMA_SOURCES.cdcVaccineDevelopment],
    insulin_therapy: [PHARMA_SOURCES.nobelInsulin, PHARMA_SOURCES.genomeRecombinantDna],
    gene_therapy_vectors: [PHARMA_SOURCES.fdaGeneTherapy],
    immuno_oncology_checkpoint_inhibitors: [PHARMA_SOURCES.nciCheckpoint],
    biosimilars: [PHARMA_SOURCES.fdaBiosimilars],
    mrna_vaccines: [PHARMA_SOURCES.hhsVaccineTypes, PHARMA_SOURCES.fdaVaccines],
    mrna_vaccine_platforms: [PHARMA_SOURCES.hhsVaccineTypes, PHARMA_SOURCES.pubmedLipidNanoparticles],
    messenger_rna_therapeutics: [PHARMA_SOURCES.hhsVaccineTypes, PHARMA_SOURCES.pubmedLipidNanoparticles],
    cell_culture: [PHARMA_SOURCES.atccCellCulture],
    molecular_biology: [PHARMA_SOURCES.ncbiMolecularBiology],
    lipid_nanoparticles: [PHARMA_SOURCES.nistLipidNanoparticles, PHARMA_SOURCES.pubmedLipidNanoparticles],
    nanomedicine_drug_delivery: [PHARMA_SOURCES.pubmedLipidNanoparticles, PHARMA_SOURCES.fdaGeneTherapy],
    dna_sequencing: [PHARMA_SOURCES.genomeDnaSequencing],
    bioinformatics: [PHARMA_SOURCES.genomeBioinformatics],
    cas12_cas13_editing_platforms: [CRISPR_SOURCES.cpf1Cas12, CRISPR_SOURCES.cas13RnaTargeting],
    crispr_gene_editing: [
        CRISPR_SOURCES.congGenomeEngineeringPmc,
        CRISPR_SOURCES.maliHumanGenomeEngineeringPubmed,
        {
            title: 'The Nobel Prize in Chemistry 2020',
            url: 'https://www.nobelprize.org/prizes/chemistry/2020/summary/',
            publisher: 'Nobel Prize',
            year: 2020,
            source_type: 'museum'
        }
    ],
    protein_structure_prediction_ai: [PHARMA_SOURCES.natureAlphaFold],
    ai_driven_drug_discovery: [
        { ...PHARMA_SOURCES.natureAiDrugDiscovery, supports: ['node', 'roadmap', 'maturity'] }
    ],
    ai_closed_loop_drug_discovery: [
        { ...PHARMA_SOURCES.natureSelfDrivingLabs, supports: ['node', 'roadmap', 'maturity'] }
    ],
    recommender_systems: [
        {
            title: 'Recommender Systems Handbook',
            url: 'https://link.springer.com/book/10.1007/978-1-0716-2197-4',
            publisher: 'Springer',
            year: 2022,
            source_type: 'textbook',
            supports: ['node', 'edge', 'maturity']
        }
    ],
    vector_databases: [
        {
            title: 'Lucene for Approximate Nearest-Neighbors Search on Arbitrary Dense Vectors',
            url: 'https://arxiv.org/abs/1910.10208',
            publisher: 'arXiv',
            year: 2019,
            source_type: 'primary_paper',
            supports: ['node', 'edge', 'maturity']
        }
    ]
};

function inferSourceType(source) {
    const text = `${source.publisher || ''} ${source.title || ''} ${source.url || ''}`.toLowerCase();
    if (/nist\.gov\/materials\b/.test(text) || /title: materials/.test(text)) return 'generic_overview';
    if (/doi\.org|nature\.com|science\.org|nejm|cell\.com|proceedings\.neurips|arxiv|journal|transactions|sigcomm|acm|bell system technical/.test(text)) return 'primary_paper';
    if (/handbook|textbook|springer|swebok|stanford encyclopedia|plato\.stanford/.test(text)) return 'textbook';
    if (/review|survey/.test(text)) return 'review';
    if (/museum|computerhistory|nobelprize|sciencemuseumgroup|american precision|sparkmuseum|mercedes-benz|ethw|ieee history/.test(text)) return 'museum';
    if (/ipcc|climate change 20\d\d|systematic review|survey/.test(text)) return 'review';
    if (/nist|energy\.gov|faa|fhwa|fcc|cisa|gps\.gov|who|iaea|iea|un|darpa|usda|fda|nih|ncats|nci|cancer\.gov|ncbi|nlm\.nih|genome\.gov|clinicaltrials\.gov|cdc|hhs|epa|usgs|nawi|esa|nasa|cern|uic|ietf|rfc-editor|cgiar|fao|ifr|world robotics|jedec|loc\.gov|library of congress|britishmuseum|ieee|computer\.org|nano\.gov|national nanotechnology initiative|itu|international telecommunication union|etsi|3gpp|w3\.org|world wide web consortium|internet society|internetsociety|gs1|bluetooth|wi-fi alliance|cablelabs|open networking foundation/.test(text)) return 'official_agency';
    if (/britannica|encyclopaedia/.test(text)) return 'generic_overview';
    return 'weak_web';
}

function normalizeSource(source, item) {
    const source_type = source.source_type || inferSourceType(source);
    const supports = source.supports || ['node'];
    if (item.maturity && !supports.includes('maturity')) supports.push('maturity');
    if (item.roadmap && !supports.includes('roadmap')) supports.push('roadmap');
    return { ...source, source_type, supports };
}

function inferEdgeType(item, prerequisite) {
    if (item.era === 'Future' || item.maturity === 'forecast' || prerequisite.era === 'Future') return 'speculative';
    const itemText = `${item.id} ${item.name}`.toLowerCase();
    const prereqText = `${prerequisite.id} ${prerequisite.name}`.toLowerCase();
    if (/steam_engine|electric_motor|internal_combustion_engine|siege_engineering|construction|precision_machine_tools|software_engineering/.test(prereqText)) {
        if (/diesel_engine|automobile_prototype|powered_flight|submarines|electric_traction|electric_generators|electric_elevators|electric_fans|operating_systems|object_oriented_programming|internet_protocols/.test(itemText)) return 'required';
        return /factory|production|manufacturing|logistics|grid|railroad|ship|mass|industrial|appliances|lighting|tools|machining|skyscraper|cinematography/.test(itemText)
            ? 'commercial_or_scaling_dependency'
            : 'enabling';
    }
    if (/manufacturing|production|factory|supply|logistics|grid|market|commercial|platform|therapy|therapeutic|approval|charging|warehouse/.test(itemText)) {
        if (/mass_production|factory|grid|logistics|supply|software|database|internet|clinical|regulatory|delivery|manufacturing/.test(prereqText)) {
            return 'commercial_or_scaling_dependency';
        }
    }
    if (/oral|law|legal|tax|census|ritual|religion|bureaucracy|governance|education|university|theater|museum|library/.test(itemText)) {
        return 'common_dependency';
    }
    if (/early|basic|root|stone_tool|fire_control|writing|record_keeping/.test(prereqText)) return 'historical_predecessor';
    if (/semiconductor|transistor|integrated_circuit|engine|motor|battery|laser|pcr|cas9|flash_memory|photolithography/.test(prereqText)) return 'required';
    return 'enabling';
}

function inferEvidenceLevel(item, prerequisite, type) {
    if (type === 'speculative') return 'speculative';
    if (item.reviewStatus === 'source_checked' && prerequisite.reviewStatus === 'source_checked') return 'expert_inference';
    if ((item.sources || []).some(source => sourceQualityWeight(source.source_type) >= 0.8)) return 'expert_inference';
    return type === 'common_dependency' ? 'weak_inference' : 'expert_inference';
}

function confidenceFor(type, evidenceLevel) {
    if (type === 'required') return 0.82;
    if (type === 'historical_predecessor') return 0.75;
    if (type === 'commercial_or_scaling_dependency') return 0.72;
    if (type === 'enabling') return 0.68;
    if (type === 'common_dependency') return 0.55;
    if (type === 'accelerates') return 0.52;
    if (type === 'speculative') return 0.35;
    return evidenceLevel === 'weak_inference' ? 0.5 : 0.6;
}

function noteFor(type, prerequisite) {
    return {
        required: `${prerequisite.name} is modeled as a necessary component or method for this technology in the current graph.`,
        enabling: `${prerequisite.name} provides a capability that enables this technology without being the only possible path.`,
        accelerates: `${prerequisite.name} accelerates development or adoption but is not strictly required.`,
        historical_predecessor: `${prerequisite.name} is an earlier historical predecessor or foundation, not a one-to-one engineering dependency.`,
        common_dependency: `${prerequisite.name} is contextual infrastructure or shared knowledge, not a strict hard prerequisite.`,
        commercial_or_scaling_dependency: `${prerequisite.name} supports manufacturing, deployment, commercialization, or operational scaling.`,
        speculative: `${prerequisite.name} is a plausible dependency for a forecast technology and should be treated as speculative.`
    }[type];
}

function applyFieldMetadata(item) {
    const override = FIELD_OVERRIDES[item.id];
    if (!override) return;
    item.fields = [...new Set([...(item.fields || []), ...(override.fields || [])])];
    item.fieldLanes = { ...(item.fieldLanes || {}), ...(override.fieldLanes || {}) };
    if (override.maturity) item.maturity = override.maturity;
    if (override.roadmap) item.roadmap = override.roadmap;
}

function makeEdge(item, prerequisiteId, byId) {
    const prerequisite = byId.get(prerequisiteId);
    if (!prerequisite) return null;
    const override = EDGE_OVERRIDES[`${item.id}|${prerequisiteId}`];
    if (override === null) return null;
    const crisprOverride = CRISPR_EDGE_TYPES[`${item.id}|${prerequisiteId}`];
    let type = inferEdgeType(item, prerequisite);
    let note = noteFor(type, prerequisite);
    let evidence_level = inferEvidenceLevel(item, prerequisite, type);
    let confidence = confidenceFor(type, evidence_level);
    let reviewStatus = item.reviewStatus === 'source_checked' ? 'source_checked' : 'structurally_validated';
    let sources = null;

    if (crisprOverride) {
        [type, note] = crisprOverride;
        evidence_level = 'expert_inference';
        confidence = type === 'required' ? 0.88 : 0.78;
        reviewStatus = 'source_checked';
    }
    if (override) {
        ({ type, note, evidence_level, confidence, reviewStatus, sources } = { type, note, evidence_level, confidence, reviewStatus, sources, ...override });
    }

    const edge = {
        prerequisite: prerequisiteId,
        type,
        confidence,
        evidence_level,
        note,
        reviewStatus
    };
    const edgeSources = Array.isArray(sources) && sources.length
        ? sources
        : reviewStatus === 'source_checked' && Array.isArray(item.sources) && item.sources.length
            ? [item.sources[0]]
            : [];
    if (edgeSources.length) {
        edge.sources = edgeSources.map(source => {
            const edgeSource = { ...source };
            edgeSource.supports = [...new Set([...(edgeSource.supports || []), 'edge'])];
            return edgeSource;
        });
    }
    return edge;
}

function applyDependencyCorrections(item) {
    let prereqs = [...(item.prerequisites || [])]
        .map(id => {
            if (id === 'precision_mechanics_miniaturization' || (id === 'precision_machine_tools' && item.era === 'Renaissance')) {
                return item.era === 'Renaissance' ? 'scientific_instrument_making_guilds' : 'precision_machine_tools';
            }
            return DEPENDENCY_REPLACEMENTS[id] || id;
        })
        .filter(id => !(REMOVE_DEPENDENCIES.get(item.id)?.has(id)));
    for (const extra of ADD_DEPENDENCIES.get(item.id) || []) {
        if (!prereqs.includes(extra)) prereqs.push(extra);
    }
    prereqs = [...new Set(prereqs)].filter(id => id !== item.id);
    item.prerequisites = prereqs;
}

const byFile = new Map();
const allItems = [];
for (const file of DATA_FILES) {
    const items = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
    byFile.set(file, items);
    for (const item of items) allItems.push(item);
}

for (const item of allItems) {
    applyDependencyCorrections(item);
}

const byId = new Map(allItems.map(item => [item.id, item]));

for (const item of allItems) {
    const defaults = ERA_DEFAULT_DATES[item.era] || ERA_DEFAULT_DATES.Modern;
    Object.assign(item, defaults, NODE_DATE_OVERRIDES[item.id] || {});
    applyFieldMetadata(item);
    if (Array.isArray(item.sources)) {
        item.sources = item.sources.map(source => normalizeSource(source, item));
    }
    if (SOURCE_OVERRIDES[item.id]) item.sources = SOURCE_OVERRIDES[item.id].map(source => normalizeSource(source, item));
    const bestSourceWeight = Math.max(0, ...(item.sources || []).map(source => sourceQualityWeight(source.source_type)));
    item.reviewStatus = bestSourceWeight > 0.45 ? 'source_checked' : 'structurally_validated';

    const edges = [];
    for (const prerequisite of item.prerequisites || []) {
        const edge = makeEdge(item, prerequisite, byId);
        if (edge) edges.push(edge);
    }
    item.dependencyEdges = edges;
    item.prerequisites = getPrerequisiteIds(item);
}

for (let pass = 0; pass < 12; pass += 1) {
    let changed = false;
    for (const item of allItems) {
        for (const edge of item.dependencyEdges || []) {
            const prerequisite = byId.get(edge.prerequisite);
            if (!prerequisite) continue;
            if (typeof prerequisite.firstKnownDate === 'number' && prerequisite.firstKnownDate > item.firstKnownDate) {
                item.firstKnownDate = prerequisite.firstKnownDate;
                if (item.datePrecision === 'millennium') item.datePrecision = prerequisite.datePrecision || 'century';
                changed = true;
            }
        }
    }
    if (!changed) break;
}

for (const [file, items] of byFile.entries()) {
    fs.writeFileSync(path.join(DATA_DIR, file), `${JSON.stringify(items, null, 2)}\n`);
}

console.log(`Migrated ${allItems.length} technologies to typed dependencyEdges.`);
