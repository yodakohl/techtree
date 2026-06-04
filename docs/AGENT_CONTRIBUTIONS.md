# Agent Contributions

Public log of source-backed corrections prompted by AI-agent or MoltBook review.

The first contribution unit is intentionally small: identify one falsifiable
claim, provide or prompt a source-backed correction, and let the maintainer
convert it into a validated data change.

Accepted outside PRs that include a source-backed edge claim, receipt, and
validation output are credited here. The first accepted PR from the current
one-edge challenge will be recorded as the first outside agent contribution.

## Guardrail Improvements

### 2026-06-04: Adversarial graph invariant guard

- External prompt: MoltBook review challenged whether file replay, served API
  readback, and a changed behavior signature can still pass after a plausible
  but semantically wrong edit.
- MoltBook thread:
  https://www.moltbook.com/post/104d25a8-c9d1-4bf8-81d0-2baebf153ee8
- GitHub issue: https://github.com/yodakohl/techtree/issues/66
- Change: added `npm run graph-invariants`, backed by
  `docs/graph-invariants/`, so corrections can define adversarial
  postconditions such as absent false paths, preserved true paths, exact typed
  edge verbs, and source-backed chronology locks.
- First invariant: the semiconductor-process-scope correction now asserts that
  `semiconductors` does not route to CVD or ALD, while the scoped
  `semiconductors -> ion_implantation` path remains present.
- Follow-up coverage: the invariant set now also protects prior PCR
  time-reversal, TSV packaging-direction, and CRISPR PAM-specificity
  corrections from silent regression.
- Coverage audit: `npm run invariant-coverage` now fails if a removed edge,
  replaced edge, or semantic edge retype receipt lacks matching invariant
  coverage.
- Validation:
  - `npm run graph-invariants`
  - `npm run invariant-coverage`
  - `npm run graph-invariants -- --api http://localhost:3000/api/tech-tree`
  - `npm test`
  - `npm run quality`

### 2026-06-03: Node-scope behavior replay guard

- External prompt: `neo_konsi_s2bw` on MoltBook challenged whether a
  node-scope invariant could still grade the node caption while the graph
  rerouted ambiguity through neighboring prerequisites and dependents.
- MoltBook thread:
  https://www.moltbook.com/post/104d25a8-c9d1-4bf8-81d0-2baebf153ee8
- GitHub issue: https://github.com/yodakohl/techtree/issues/66
- Change: added `npm run node-packet`, `npm run node-snapshot`, and
  `npm run node-snapshot-diff` so broad-node changes can be checked against
  incoming edges, outgoing edges, and prerequisite-through-dependent paths.
- Validation:
  - `npm run node-packet -- semiconductors --issue 66`
  - `npm run --silent node-snapshot -- semiconductors`
  - `npm run node-snapshot-diff -- /tmp/semiconductors.before.json /tmp/semiconductors.after.json --require-behavior-change`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`

### 2026-06-01: Edge removal receipt guard

- Strategy follow-up: issue #62 tested whether a bad direct dependency should
  be replaced with another edge or removed when the source rejects the
  relationship.
- GitHub issue: https://github.com/yodakohl/techtree/issues/62
- Change: `npm run edge-receipts` now supports `removed_edge: true` topology
  receipts. The audit verifies that both the dependency edge and bare
  prerequisite are absent, and requires `source_supports_edge: "no"` plus a
  `refutes_dependency` source-shape relationship.
- Validation:
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`

### 2026-05-29: Edge topology-replacement guard

- External prompt: `neo_konsi_s2bw` on MoltBook challenged whether the
  `crispr_gene_editing -> pam_specificity_engineering` edge should mean
  "cannot perform the task without it" or only "cannot perform the task well
  without it."
- MoltBook thread:
  https://www.moltbook.com/post/9826aa03-c768-4589-b701-f182bf620fa6
- GitHub issue: https://github.com/yodakohl/techtree/issues/54
- Change: `npm run edge-receipts` now supports `replaced_edge` on topology
  changes and verifies that the old edge no longer exists in the current graph.
  This catches fixes that add a better edge while leaving the misleading old
  edge in place.
- Validation:
  - `npm run edge-receipts`
  - `npm test`
  - `npm run quality`

### 2026-05-29: Edge demotion-preservation guard

- External prompt: `neo_konsi_s2bw` on MoltBook flagged that demoting bogus
  `required` edges is only safe if the receipt proves which concrete mechanism
  or context edges still carry the dependent technology.
- MoltBook thread:
  https://www.moltbook.com/post/9826aa03-c768-4589-b701-f182bf620fa6
- GitHub issue: https://github.com/yodakohl/techtree/issues/53
- Change: `npm run edge-receipts` now requires `demotion_preserves` for
  semantic retypes from `required` to a non-`required` edge type, and verifies
  that each preserved edge still exists with the expected type.
- Validation:
  - `npm run edge-receipts`
  - `npm test`
  - `npm run quality`

### 2026-05-28: Edge receipt relationship-compatibility guard

- External prompt: `neo_konsi_s2bw` on MoltBook flagged that a receipt could
  cite a pristine source while pairing a weak support relationship with a strong
  edge type.
- MoltBook thread:
  https://www.moltbook.com/post/9826aa03-c768-4589-b701-f182bf620fa6
- GitHub issue: https://github.com/yodakohl/techtree/issues/51
- Change: `npm run edge-receipts` now checks that
  `source_shape.support_relationship` is compatible with `new_claim.type`, so
  a `required` edge cannot be justified by chronology or generic method-use
  support.
- Validation:
  - `npm run edge-receipts`
  - `npm test`
  - `npm run quality`

### 2026-05-28: Edge receipt source-shape guard

- External prompt: `neo_konsi_s2bw` on MoltBook flagged that a semantic edge
  receipt could still launder weak evidence if it only required a URL-shaped
  source object.
- MoltBook thread:
  https://www.moltbook.com/post/9826aa03-c768-4589-b701-f182bf620fa6
- GitHub issue: https://github.com/yodakohl/techtree/issues/46
- Change: `npm run edge-receipts` now requires a `source_shape` object with
  source type, locator, claim summary, and support rationale, and checks that
  the receipt source type matches the cited edge source.
- Validation:
  - `npm run edge-receipts`
  - `npm test`
  - `npm run quality`

### 2026-05-28: Edge receipt support-relationship guard

- External prompt: `neo_konsi_s2bw` on MoltBook flagged that
  `source_support_rationale` could still merely restate the source claim unless
  it named the exact support relationship.
- MoltBook thread:
  https://www.moltbook.com/post/9826aa03-c768-4589-b701-f182bf620fa6
- GitHub issue: https://github.com/yodakohl/techtree/issues/48
- Change: `npm run edge-receipts` now requires a finite
  `source_shape.support_relationship` value and rejects rationales that are too
  similar to the source summary or new edge note.
- Validation:
  - `npm run edge-receipts`
  - `npm test`
  - `npm run quality`

## Accepted Corrections

### 2026-06-04: Dialysis and radiotherapy device sample audit

- Manual sample audit: dialysis machines and medical linear accelerators were
  inspected because both had generated placeholder dates and direct dependencies
  on `hospital_information_systems`.
- Old claim: `dialysis_machines` was anchored to a generated 1948 decade date
  and depended on `laboratory_diagnostic_medicine`,
  `filters_membranes_early`, and `hospital_information_systems`.
  `medical_linear_accelerators` was anchored to a generated 1948 date and
  treated particle accelerators, radiology departments, and hospital information
  systems as generic enablers.
- Corrected claim: dialysis machines are anchored to Kolff's 1943 rotating-drum
  artificial kidney and now depend on membrane separation, pump/flow scaling,
  and clinical treatment context. The shared early filters/membranes foundation
  is anchored to Graham's 1861 dialysis membrane work rather than a generated
  1945 placeholder. Medical linear accelerators are anchored to the 1953
  Hammersmith therapy-linac patient, with particle acceleration as the required
  device architecture and radiology departments as clinical deployment context.
  Hospital information systems were removed from both device nodes.
- Sources:
  - https://edren.org/ren/unit/history/the-early-development-of-dialysis-and-transplantation/
  - https://laskerfoundation.org/wp-content/uploads/2021/01/2002_kolff.pdf
  - https://homedialysis.org/types/museum/p5
  - https://museum.aapm.org/exhibit/12-external-beam-radiotherapy/
  - https://www.bir.org.uk/useful-information/history-of-radiology/1950s/1950s-radiotherapy/
- Validation:
  - `npm run edge-receipts`
  - `npm run graph-invariants`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --timeout-ms 30000 --concurrency 2`

### 2026-06-04: IVF and implantable-pacemaker sample audit

- Manual sample audit: IVF and implantable pacemakers were inspected after the
  suspicious-node pass flagged default dates and dependencies on hospital
  information systems or later product technologies.
- Old claim: `in_vitro_fertilization` had a generated 1995 chronology and
  depended on `molecular_diagnostics` and `hospital_information_systems`.
  `pacemakers_implantable` had a generated 1948 chronology and depended on
  `lithium_ion_batteries_rechargeable_power` and
  `hospital_information_systems`.
- Corrected claim: IVF is anchored to the 1978 Louise Brown milestone and now
  depends on cell culture, clinical medicine, and reproductive physiology.
  Implantable pacemakers are anchored to the 1958 implant chronology and now
  depend on electronics, portable electrochemical batteries, and clinical
  medicine. A general `portable_electrochemical_batteries` foundation node was
  added so early medical devices do not misuse lithium-ion batteries as a
  proxy for battery power.
- Sources:
  - https://www.nobelprize.org/prizes/medicine/2010/advanced-information/
  - https://www.nobelprize.org/prizes/medicine/2010/popular-information/
  - https://www.research.va.gov/research_in_action/The-invention-of-the-cardiac-pacemaker.cfm/default.cfm
  - https://www.acc.org/latest-in-cardiology/articles/2021/04/01/01/42/focus-on-ep-leadless-technology-a-paradigm-shift-in-cardiac-implantable-electronic-devices
  - https://www.si.edu/stories/five-batteries-gave-world-jolt
  - https://www.britannica.com/technology/battery-electronics/Development-of-batteries
- Validation:
  - `npm run edge-receipts`
  - `npm run graph-invariants`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --timeout-ms 15000 --concurrency 4`

### 2026-06-04: Medical imaging sample audit

- Manual sample audit: CT, MRI, ultrasound, and advanced electron microscopy
  were inspected because they are high-risk modality nodes where bundled names
  and neighbor technologies can create misleading dependency edges.
- Old claim: `magnetic_resonance_imaging`,
  `electron_microscopy_advanced`, and future `brain_mapping` referenced the
  synthetic `computerized_tomography_ct_mri` bundle. `ultrasound_medical_imaging`
  depended on `x_ray_imaging` and `hospital_information_systems`.
  `positron_emission_tomography_pet` depended on CT despite being scoped as
  standalone PET. CT and MRI carried generated placeholder chronology.
- Corrected claim: the CT/MRI bundle was removed. MRI now depends on
  `nuclear_magnetic_resonance`; ultrasound depends on
  `piezoelectric_ultrasonic_transducers`; standalone PET depends on nuclear
  medicine and radionuclide production context instead of CT; advanced electron
  microscopy depends on computational reconstruction; CT is anchored to X-ray
  tomography and computer reconstruction. The sample now has receipt-backed
  invariants for the corrected direct edges and dates.
- Sources:
  - https://www.nobelprize.org/prizes/medicine/1979/press-release/
  - https://www.nobelprize.org/prizes/medicine/2003/press-release/
  - https://www.nobelprize.org/prizes/physics/1952/summary/
  - https://www.bmus.org/for-patients/history-of-ultrasound/
  - https://www.ipem.ac.uk/news/150th-anniversary-of-the-father-of-modern-ultrasound/
  - https://collection.sciencemuseumgroup.org.uk/objects/co6036/samples-of-crystals-used-in-the-development-of-asdic-transducers-1917-1918
  - https://lamethodecurie.fr/en/article13.html
  - https://pubmed.ncbi.nlm.nih.gov/22658288/
  - https://www.ncbi.nlm.nih.gov/books/NBK232475/
- Validation:
  - `npm run edge-receipts`
  - `npm run graph-invariants`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Medical Imaging & Diagnostics" --timeout-ms 15000 --concurrency 4`
  - `npm run source-urls -- --field "Materials Science & Manufacturing" --timeout-ms 15000 --concurrency 4`

### 2026-06-04: Semiconductor process scope and roadmap chronology cleanup

- Follow-up prompt: issue #66 and MoltBook review challenged whether the
  semiconductor correction still left broad materials processes downstream of
  `semiconductors` and whether roadmap nodes still carried placeholder dates.
- MoltBook thread:
  https://www.moltbook.com/post/104d25a8-c9d1-4bf8-81d0-2baebf153ee8
- GitHub issue: https://github.com/yodakohl/techtree/issues/66
- Old claim: `chemical_vapor_deposition` and `atomic_layer_deposition`
  required `semiconductors`; `gate_all_around_nanosheet_transistors`,
  `backside_power_delivery`, `high_na_euv_lithography`, and
  `finfet_transistors` retained generated 1960-era chronology.
- Corrected claim: CVD and ALD are modeled as general thin-film and
  nanofabrication methods rather than semiconductor-dependent technologies.
  FinFET, GAA nanosheet, backside-power, and High-NA EUV dates now follow
  source-backed semiconductor history and roadmap milestones. The GAA/FinFET
  and backside-power/GAA edges were weakened from hard prerequisites to
  lineage or scaling relationships.
- Sources:
  - https://www.britannica.com/technology/chemical-vapour-deposition
  - https://link.springer.com/article/10.1007/s41871-022-00136-8
  - https://ewh.ieee.org/conf/edtm/2020/program/abstract/Digh_Hisamoto.html
  - https://research.ibm.com/blog/2-nm-chip
  - https://semiconductor.samsung.com/news-events/news/samsung-begins-chip-production-using-3nm-process-technology-with-gaa-architecture/
  - https://newsroom.intel.com/client-computing/powervia-test-shows-industry-leading-performance
  - https://www.asml.com/en/en/products/euv-lithography-systems
- Validation:
  - `npm run edge-receipts`
  - `npm run node-snapshot-diff -- /tmp/chemical_vapor_deposition.before.json /tmp/chemical_vapor_deposition.after.json --require-behavior-change`
  - `npm run node-snapshot-diff -- /tmp/atomic_layer_deposition.before.json /tmp/atomic_layer_deposition.after.json --require-behavior-change`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Semiconductors & Integrated Circuits" --timeout-ms 15000 --concurrency 4`
  - `npm run source-urls -- --field "Materials Science & Manufacturing" --timeout-ms 15000 --concurrency 4`

### 2026-06-03: Semiconductor scope and chronology correction

- External prompt: MoltBook review and GitHub issue #66 challenged the broad
  `semiconductors` node for mixing 1874 semiconductor rectification with later
  chip-manufacturing infrastructure such as clean rooms.
- MoltBook thread:
  https://www.moltbook.com/post/104d25a8-c9d1-4bf8-81d0-2baebf153ee8
- GitHub issue: https://github.com/yodakohl/techtree/issues/66
- Old claim: `semiconductors` was a Modern 1945 node depending on
  `electronics`, `quantum_physics`, `crystal_growth_techniques`, and
  `clean_rooms`.
- Corrected claim: `semiconductors` is now an Industrial 1874 node scoped to
  semiconductor materials and point-contact rectifier behavior. Later
  electronics, quantum theory, crystal growth, and clean-room manufacturing no
  longer flow through every downstream semiconductor-dependent technology.
- Source:
  - https://www.computerhistory.org/siliconengine/semiconductor-point-contact-rectifier-effect-is-discovered/
- Validation:
  - `npm run edge-receipts`
  - `npm run node-snapshot-diff -- /tmp/semiconductors.before.json /tmp/semiconductors.after.json --require-behavior-change`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Semiconductors & Integrated Circuits" --timeout-ms 15000 --concurrency 4`

### 2026-06-01: TSV advanced-packaging edge direction fix

- Strategy follow-up: issue #65 tested whether
  `through_silicon_vias -> advanced_semiconductor_packaging_2_5d_3d` had the
  direction backwards.
- GitHub issue: https://github.com/yodakohl/techtree/issues/65
- Old claim: TSVs were modeled as requiring the broad 2.5D/3D advanced
  packaging category.
- Corrected claim: the edge now points from
  `advanced_semiconductor_packaging_2_5d_3d` to `through_silicon_vias` as an
  `enabling` relationship. TSV fabrication itself remains grounded in
  lithography and plasma etching.
- Data-quality update: TSV and advanced-packaging nodes now have less
  misleading first-known dates and cite NIST/TSMC sources instead of relying on
  generated 1945 defaults.
- Source:
  - https://www.nist.gov/publications/metrology-needs-25d3d-interconnect
  - https://3dfabric.tsmc.com/english/dedicatedFoundry/technology/3DFabric.htm
- Validation:
  - `npm run edge-receipts`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Semiconductors & Integrated Circuits" --timeout-ms 15000 --concurrency 4`

### 2026-06-01: PCR time-reversal cleanup in sequencing and recombinant DNA

- Strategy follow-up: issue #63 tested whether PCR should be a hard
  prerequisite for broad DNA sequencing after Sanger sequencing had already
  been established.
- GitHub issue: https://github.com/yodakohl/techtree/issues/63
- Old claims: `dna_sequencing -> pcr_polymerase_chain_reaction` and
  `recombinant_dna_genetic_engineering -> pcr_polymerase_chain_reaction` were
  modeled as `required` edges despite PCR's corrected 1985 first-known date.
- Corrected claim: both direct dependency edges are removed. Broad DNA
  sequencing and recombinant DNA predate PCR; PCR remains connected through
  later PCR diagnostics and molecular-diagnostics workflows.
- Data-quality update: PCR now has a 1985 exact date and a specific NCBI
  Bookshelf source; PCR diagnostics now has a 1985 primary-paper source;
  molecular diagnostics now has a source-backed 1995 field date.
- Guardrail update: `scripts/migrate-semantic-edges.js` now preserves all
  receipt-backed edge overrides during regeneration, so `npm run edge-receipts`
  remains valid after migration.
- Sources:
  - https://www.ncbi.nlm.nih.gov/books/NBK21117/
  - https://pubmed.ncbi.nlm.nih.gov/271968/
  - https://pubmed.ncbi.nlm.nih.gov/2999980/
  - https://www.ncbi.nlm.nih.gov/books/NBK589663/
  - https://www.si.edu/spotlight/birth-of-biotech/recombinant-dna-in-the-lab
- Validation:
  - `npm run edge-receipts`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Medical Imaging & Diagnostics" --timeout-ms 15000 --concurrency 4`
  - `npm run source-urls -- --field "Pharmaceuticals & Drug Development" --timeout-ms 15000 --concurrency 4`

### 2026-06-01: Green-hydrogen battery-storage dependency removal

- Strategy follow-up: issue #64 tested the new source-locator funnel on a
  suspicious Energy Systems edge.
- GitHub issue: https://github.com/yodakohl/techtree/issues/64
- Old claim: `green_hydrogen -> grid_scale_battery_storage` was a `required`
  edge with `expert_inference` and no edge source.
- Corrected claim: no direct dependency edge remains. Green hydrogen is modeled
  through electrochemical production and renewable-energy context, not as
  requiring grid-scale batteries.
- Source shape: IEA and IRENA support electrolysis plus renewable or
  low-emissions electricity as the production route; IRENA frames electrolysers
  as grid-flexibility resources alongside alternatives such as batteries.
- Data-quality update: `green_hydrogen` now belongs to the
  `Energy Systems & Grid` field and has official-agency sources.
- Source:
  - https://www.irena.org/Energy-Transition/Technology/Hydrogen
  - https://www.iea.org/energy-system/low-emission-fuels/electrolysers
- Validation:
  - `npm run edge-receipts`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Energy Systems & Grid" --timeout-ms 15000 --concurrency 4`

### 2026-06-01: Rocketry jet-engine dependency removal

- Strategy follow-up: issue #62 tested whether broad `rocketry` should depend
  on the local `jet_engine` node.
- GitHub issue: https://github.com/yodakohl/techtree/issues/62
- Old claim: `rocketry -> jet_engine` was a `required` edge, but `jet_engine`
  is scoped as an airbreathing engine.
- Corrected claim: no direct dependency edge remains. NASA's practical
  rocketry material distinguishes jets, which draw oxygen from surrounding air,
  from rockets, which carry oxidizer and can operate where there is no air.
- Invariant preserved: rocketry still carries propellant, chemistry,
  thermodynamics, construction, mathematics, and historical gunpowder context.
- Source:
  - https://www.grc.nasa.gov/WWW/k-12/rocket/TRCRocket/practical_rocketry.html
- Validation:
  - `npm run edge-receipts`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Spaceflight & Satellites" --timeout-ms 15000 --concurrency 4`

### 2026-06-01: ZFN recombinant-DNA evidence upgrade

- Strategy follow-up: issue #61 tested whether recombinant-DNA genetic
  engineering is only broad context for zinc-finger nucleases or a direct
  construction-method dependency.
- GitHub issue: https://github.com/yodakohl/techtree/issues/61
- Old claim: `zinc_finger_nucleases -> recombinant_dna_genetic_engineering`
  was a `required` edge but still relied on `expert_inference` and a generic
  Nobel source.
- Corrected claim: the edge remains `required`, now with `primary_source`
  evidence. The source describes ZFN construction by building selected
  zinc-finger coding sequences, linking them to the FokI cleavage-domain coding
  sequence in cloning vectors, expressing the ZFNs, and testing cleavage.
- Invariant preserved: #60 carries the hard protein-domain architecture claim;
  this edge carries the recombinant coding-sequence construction and expression
  method dependency.
- Guardrail update: the edge-receipt checker now permits
  `demonstrates_method_dependency` as a valid support relationship for a
  `required` edge, matching the edge-review playbook's method-dependency rule.
- Source:
  - https://pubmed.ncbi.nlm.nih.gov/17406419/
- Validation:
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4`

### 2026-05-31: ZFN protein-engineering evidence upgrade

- Strategy follow-up: issue #60 tested whether the same hard
  protein-architecture rule used for TALENs also applies to zinc-finger
  nucleases.
- GitHub issue: https://github.com/yodakohl/techtree/issues/60
- Old claim: `zinc_finger_nucleases -> protein_engineering` was a `required`
  edge but still relied on `expert_inference` and a generic Nobel source.
- Corrected claim: the edge remains `required`, now with `primary_source`
  evidence. ZFNs are zinc-finger DNA-binding protein domains fused to FokI
  cleavage domains, so the platform depends on engineered protein-domain
  architecture.
- Date fix: the ZFN node first-known date changed from generated `1977` /
  `decade` to exact `1996`.
- Invariant preserved: this is a hard component-architecture dependency;
  adjacent recombinant-DNA context remains tracked separately in issue #61.
- Source:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC40048/
- Validation:
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4`

### 2026-05-31: TALENs protein-engineering evidence upgrade

- Strategy follow-up: issue #59 used an unfinished MoltBook edge challenge to
  test a case where a hard edge might survive the modal-scope test.
- GitHub issue: https://github.com/yodakohl/techtree/issues/59
- Old claim: `talens -> protein_engineering` was a `required` edge but still
  relied on `expert_inference`.
- Corrected claim: the edge remains `required`, now with `primary_source`
  evidence. TALENs are transcription activator-like effector DNA-binding
  proteins with customized repeat arrays fused to FokI nuclease domains, so the
  platform depends on engineered protein architecture.
- Invariant preserved: this is a hard component-architecture dependency, unlike
  the broad-field edges that were demoted.
- Source:
  - https://pubmed.ncbi.nlm.nih.gov/21493687/
- Validation:
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4`

### 2026-05-31: Synthetic-biology genetic-engineering edge retype

- Strategy follow-up: issue #58 tested the modal-scope rule on another broad
  field relationship after #57 showed when a `required` edge can be preserved
  by narrowing node scope.
- GitHub issue: https://github.com/yodakohl/techtree/issues/58
- Old claim: `synthetic_biology -> genetic_engineering` was a `required` edge,
  implying the broad genetic-engineering field was necessary across all of the
  broad synthetic-biology node.
- Corrected claim: the edge is now `enabling` with `review` evidence. Genetic
  engineering remains a major toolkit and predecessor context, but synthetic
  biology also covers DNA synthesis, systems modeling, standardized parts,
  circuits, pathways, and broader design-and-assembly work.
- Invariant changed deliberately: broad field context is not treated as a hard
  prerequisite when the source supports toolkit/context rather than necessity.
- Source:
  - https://www.nature.com/articles/nrg2775
- Validation:
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4`

### 2026-05-29: Single-guide RNA Cas9 architecture evidence upgrade

- External prompt: `neo_konsi_s2bw` on MoltBook sharpened the rule for
  overbroad hard edges: `required` should pass a modal-scope test across the
  dependent node's actual scope.
- GitHub issue: https://github.com/yodakohl/techtree/issues/57
- Old claim: `single_guide_rna_design -> cas9_programmable_nuclease` was a
  `required` edge but still relied on `expert_inference`.
- Corrected claim: the edge remains `required`, now with `primary_source`
  evidence. The node text is scoped to Cas9-compatible single-guide RNA design,
  and the 2012 Jinek et al. paper supports the architecture relationship:
  engineered single RNA chimeras combine guide/scaffold features to program
  Cas9 cleavage.
- Invariant preserved: this is not a claim about all CRISPR guide-RNA design
  across every Cas effector family; it is a hard architecture edge for the
  Cas9-scoped sgRNA node.
- Source:
  - https://pubmed.ncbi.nlm.nih.gov/22745249/
- Validation:
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4`

### 2026-05-29: Genetic-engineering recombinant-DNA edge retype

- Internal follow-up: issue #55 asked whether a broad `genetic_engineering`
  umbrella node should hard-depend on the narrower
  `recombinant_dna_genetic_engineering` method family.
- GitHub issue: https://github.com/yodakohl/techtree/issues/55
- Old claim: `genetic_engineering -> recombinant_dna_genetic_engineering` was
  a `required` edge, implying recombinant-DNA construction was necessary for
  every method covered by the broad genetic-engineering node.
- Corrected claim: the edge is now `historical_predecessor` with `review`
  evidence. Recombinant-DNA methods remain a foundational traditional method
  family, while broad genetic engineering can also include later editing and
  delivery approaches.
- Invariant changed deliberately: broad field context is not treated as a hard
  method-family prerequisite.
- Sources:
  - https://www.nature.com/articles/35093556
  - https://www.ncbi.nlm.nih.gov/books/NBK424553/
- Validation:
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4`

### 2026-05-29: CRISPR-Cas9 PAM dependency split

- External prompt: `neo_konsi_s2bw` on MoltBook identified the core ambiguity
  in issue #54: engineered PAM specificity may improve targeting scope, but
  ordinary CRISPR-Cas9 editing only has a hard dependency on PAM compatibility.
- GitHub issue: https://github.com/yodakohl/techtree/issues/54
- Old claim: `crispr_gene_editing -> pam_specificity_engineering` was a
  `required` edge, implying later engineered PAM-specificity variants were a
  hard prerequisite for CRISPR-Cas9 genome editing.
- Corrected claim: `crispr_gene_editing` now requires
  `pam_recognition_constraint`, a separate source-backed node for the basic
  Cas9 target-DNA PAM constraint. `pam_specificity_engineering` now represents
  later engineered PAM-specificity variants built on CRISPR-Cas9, PAM
  recognition, and protein engineering.
- Invariant preserved: CRISPR-Cas9 editing still has a hard PAM dependency, but
  the prerequisite is the basic recognition constraint rather than a later
  optimization technology.
- Sources:
  - https://www.nature.com/articles/nature13579
  - https://www.nature.com/articles/nature14592
- Validation:
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`

### 2026-05-29: CRISPR-Cas9 genetic-engineering edge retype

- Internal follow-up: the CRISPR edge audit identified
  `crispr_gene_editing -> genetic_engineering` as the next required edge still
  relying on `expert_inference`.
- GitHub issue: https://github.com/yodakohl/techtree/issues/52
- Old claim: `crispr_gene_editing -> genetic_engineering` was a `required`
  edge, implying the broad genetic-engineering field was a hard component or
  method prerequisite for CRISPR-Cas9 genome editing.
- Corrected claim: the edge is now `historical_predecessor` with `review`
  evidence. The review supports genetic engineering/genome engineering as the
  broader field context while the direct hard dependencies remain on Cas9,
  guide RNA, PAM targeting, and repair biology.
- Invariant changed deliberately: broad field context is not treated as a hard
  component dependency.
- Source:
  - https://pubmed.ncbi.nlm.nih.gov/24906146/
- Validation:
  - `node scripts/migrate-semantic-edges.js`
  - `npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4`
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`

### 2026-05-28: CRISPR-Cas9 genome-editing Cas9 dependency source

- Internal follow-up: the CRISPR edge audit identified
  `crispr_gene_editing -> cas9_programmable_nuclease` as the next required
  edge still relying on `expert_inference`.
- GitHub issue: https://github.com/yodakohl/techtree/issues/50
- Old claim: `crispr_gene_editing -> cas9_programmable_nuclease` was a
  `required` edge, but its evidence level was still `expert_inference`.
- Corrected claim: the edge remains `required`, now with `primary_source`
  evidence from the 2013 genome-engineering papers that demonstrate Cas9 and
  guide RNAs as the method used for early CRISPR-Cas9 genome editing.
- Invariant preserved: programmable Cas9 nuclease remains a hard component
  dependency for the CRISPR-Cas9 genome-editing node; source specificity,
  confidence, and note quality improved.
- Sources:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC3795411/
  - https://pubmed.ncbi.nlm.nih.gov/23287722/
- Validation:
  - `node scripts/migrate-semantic-edges.js`
  - `npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4`
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`

### 2026-05-28: Programmable Cas9 protein-engineering edge retype

- Internal follow-up: the CRISPR edge audit identified
  `cas9_programmable_nuclease -> protein_engineering` as the next required edge
  still relying on `expert_inference`.
- GitHub issue: https://github.com/yodakohl/techtree/issues/49
- Old claim: `cas9_programmable_nuclease -> protein_engineering` was a
  `required` edge, implying protein engineering was a hard prerequisite for the
  original programmable Cas9 nuclease platform.
- Corrected claim: the edge is now `enabling` with `primary_source` evidence.
  Jinek et al. 2012 supports protein engineering as relevant to Cas9 domain
  characterization and later optimization, while the core platform is
  RNA-guided Cas9 activity rather than engineered Cas9 variants.
- Invariant changed deliberately: the graph no longer treats engineered Cas9
  protein variants as required for the 2012 programmable nuclease platform.
- Source:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC6286148/
- Validation:
  - `node scripts/migrate-semantic-edges.js`
  - `npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4`
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`

### 2026-05-28: Base editing protein-engineering dependency source

- Internal follow-up: the CRISPR edge audit identified
  `base_editing -> protein_engineering` as the next required edge still relying
  on `expert_inference`.
- GitHub issue: https://github.com/yodakohl/techtree/issues/47
- Old claim: `base_editing -> protein_engineering` was a `required` edge, but
  its evidence level was still `expert_inference`.
- Corrected claim: the edge remains `required`, but is now supported as
  `primary_source` evidence because base editors are engineered protein fusions
  combining catalytic and DNA-targeting protein components.
- Invariant preserved: edge type stayed `required`; evidence class, confidence,
  note, and source specificity improved.
- Source:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC4873371/
- Validation:
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`

### 2026-05-28: Base editing CRISPR-Cas9 genome-editing retype

- External prompt: `neo_konsi_s2bw` challenged whether an edge-count
  improvement could hide ontology drift and asked for the smallest retype
  receipt that could block a bad `base_editing` edge change.
- MoltBook thread:
  https://www.moltbook.com/post/9826aa03-c768-4589-b701-f182bf620fa6
- GitHub issue: https://github.com/yodakohl/techtree/issues/45
- Old claim: `base_editing -> crispr_gene_editing` was a `required` edge,
  implying CRISPR-Cas9 genome editing as a hard component or method prerequisite
  for base editing.
- Corrected claim: the edge is now a `historical_predecessor` with
  `primary_source` evidence. Base editing remains directly dependent on
  `cas9_programmable_nuclease` as the hard component edge.
- Invariant changed deliberately: the graph no longer treats
  double-strand-break CRISPR-Cas9 genome editing as required for base editing.
- Guard added: `npm run edge-receipts` validates semantic edge-change receipts
  in `docs/edge-change-receipts/`.
- Source:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC4873371/
- Validation:
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`

### 2026-05-28: Base editing Cas9 dependency source

- External prompt: `neo_konsi_s2bw` on MoltBook answered issue #44's
  no-PR microtask and recommended keeping
  `base_editing -> cas9_programmable_nuclease` as `required`.
- MoltBook reply:
  https://www.moltbook.com/post/9826aa03-c768-4589-b701-f182bf620fa6
- GitHub issue: https://github.com/yodakohl/techtree/issues/44
- Old claim: `base_editing -> cas9_programmable_nuclease` was a `required`
  edge, but its evidence level was still `expert_inference`.
- Corrected claim: the edge remains `required`, but is now supported as
  `primary_source` evidence with a specific note that cytosine base editors use
  catalytically impaired Cas9 as the programmable DNA-targeting component fused
  to a deaminase.
- Invariant preserved: edge type stayed `required`; evidence class and source
  specificity improved.
- Source:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC4873371/
- Validation:
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`

### 2026-05-28: Ex vivo CRISPR therapy edge source

- External prompt: MoltBook comparative-receipt experiment produced issue #43
  from the new CRISPR edge audit.
- GitHub issue: https://github.com/yodakohl/techtree/issues/43
- Old claim: `ex_vivo_crispr_cell_therapy -> crispr_gene_editing` was a
  `required` edge, but its evidence level was still `expert_inference`.
- Corrected claim: the edge remains `required`, but is now supported as
  `primary_source` evidence with a specific note about CRISPR-Cas9 editing of
  patient-derived cells before reinfusion.
- Source:
  - https://pubmed.ncbi.nlm.nih.gov/33283989/
- Validation:
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`

### 2026-05-27: Instruction tuning and RLHF sources

- External prompt: TechTree issue asked agents to correct the bundled
  `instruction_tuning_rlhf` node's chronology and replace a weak web source
  with primary papers.
- GitHub issue: https://github.com/yodakohl/techtree/issues/42
- Old claim: `instruction_tuning_rlhf` had a generated `firstKnownDate: 2017`
  with `datePrecision: "decade"`, `reviewStatus: "structurally_validated"`,
  and a weak OpenAI web source.
- Corrected claim: `instruction_tuning_rlhf` now has `firstKnownDate: 2020`
  with `datePrecision: "exact"`, `reviewStatus: "source_checked"`, and
  primary-paper sources covering RLHF for language-model summarization,
  instruction tuning, and instruction-following with human feedback.
- Generated consistency update: `ai_safety_alignment_methods` now has a
  no-earlier-than-2020 generated date floor because it depends on
  `instruction_tuning_rlhf`.
- Sources:
  - https://arxiv.org/abs/2009.01325
  - https://arxiv.org/abs/2109.01652
  - https://arxiv.org/abs/2203.02155
- Validation:
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Artificial Intelligence & Machine Learning" --timeout-ms 15000 --concurrency 4`

### 2026-05-27: Foundation model chronology

- External prompt: MoltBook/TechTree follow-up issue asked agents to test
  whether Foundation Models should inherit a generic neural-network or
  Transformer-era first-known date.
- GitHub issue: https://github.com/yodakohl/techtree/issues/41
- Old claim: `foundation_models` had a generated `firstKnownDate: 2017` with
  `datePrecision: "decade"` after the Transformer chronology correction. The
  original issue was opened when it still inherited `1983`.
- Corrected claim: `foundation_models` now has `firstKnownDate: 2021` with
  `datePrecision: "exact"`, matching the node's source and the named
  foundation-model framing.
- Source:
  - https://arxiv.org/abs/2108.07258
- Validation:
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Artificial Intelligence & Machine Learning" --timeout-ms 15000 --concurrency 4`

### 2026-05-27: Transformer architecture chronology

- External prompt: MoltBook challenge thread asked agents to test whether
  Transformer Architectures should really have a `1983` first-known date.
- MoltBook challenge: https://www.moltbook.com/post/e4d8f642-755d-48ea-ae54-f7d5a4bb8e59
- GitHub issue: https://github.com/yodakohl/techtree/issues/40
- Old claim: `transformer_architectures` had `firstKnownDate: 1983` with
  `datePrecision: "decade"`.
- Corrected claim: `transformer_architectures` now has `firstKnownDate: 2017`
  with `datePrecision: "exact"`, matching the node's primary source,
  "Attention Is All You Need."
- Generated consistency update: downstream AI nodes that depend on Transformer
  Architectures now have no-earlier-than-2017 generated date floors. More
  precise dates for `foundation_models` and `instruction_tuning_rlhf` remain
  tracked separately.
- Source:
  - https://proceedings.neurips.cc/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html
- Validation:
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Artificial Intelligence & Machine Learning" --timeout-ms 15000 --concurrency 4`

### 2026-05-27: Cas12/Cas13 edge semantics

- External prompt: Ting_Fodder on MoltBook flagged the claim that Cas12/Cas13
  platforms require CRISPR-Cas9 genome editing as overly broad.
- GitHub issue: https://github.com/yodakohl/techtree/issues/39
- Old claim: `cas12_cas13_editing_platforms` required
  `crispr_gene_editing`.
- Corrected claim: `cas12_cas13_editing_platforms` now uses
  `crispr_adaptive_immunity` as a source-backed historical predecessor. The
  `rna_interference` edge was also downgraded to a historical predecessor for
  the Cas13/RNA-targeting part of the bundled node.
- Sources:
  - https://www.broadinstitute.org/publications/broad7290
  - https://www.broadinstitute.org/publications/broad125381
- Validation:
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4`
