# NV-800 Artifact Registry

## Purpose

The Artifact Registry is the first human-readable registry layer for NeuralVerse Learning Artifacts.

It catalogues which instructional artifacts exist, where they live, and how they relate to the canonical NV-800-M7 authoring and governance model.

The registry is editorial infrastructure only. It is not a database, search engine, API, UI component, runtime service, parser, automation layer, or validation framework.

## Scope

The registry supports:

* editorial discoverability;
* manual artifact review;
* governance coordination;
* future automation readiness;
* artifact inventory maintenance.

The registry does not store:

* learner progress;
* Competency Evidence;
* assessments;
* mastery decisions;
* scores;
* execution state;
* runtime metadata.

## Relationship With Templates

```text
Authoring Template
    ↓
creates
Learning Artifact

Artifact Registry Entry
    ↓
indexes
Learning Artifact
```

The registry is not the artifact itself.

Learning Artifact authoring templates define how artifact files should be authored. Registry entries describe the existence, location, and governance-facing index information for those artifact files.

## Relationship With NV-800-M7

The registry records canonical fields defined by NV-800-M7. It does not redefine them.

* Phase 1 defines artifact families and artifact types.
* Phase 2 defines artifact type contracts.
* Phase 3 defines lifecycle status values.
* Phase 4 defines reuse modes.
* Phase 5 defines metadata and instructional objective expectations.
* Phase 6 defines dependency categories.
* Phase 7 defines quality governance expectations.
* NV-800-M7-I1 provides authoring templates.
* NV-800-M7-I2 provides this registry index layer.

## How Artifacts Are Registered

Authors or maintainers should create one registry entry for each Learning Artifact intended to be tracked by governance.

Each registry entry should:

* identify the artifact;
* record its canonical family and type;
* record its current canonical status;
* point to the artifact location;
* summarize relevant objectives, depths, levels, reuse, and dependencies;
* preserve notes useful for editorial review.

Registry entries should use the placeholder structure in [ARTIFACT_INDEX_TEMPLATE.md](ARTIFACT_INDEX_TEMPLATE.md).

## Registry Entries vs Artifact Files

Artifact files contain instructional content created from authoring templates.

Registry entries contain catalogue information about artifact files.

The registry may point to an artifact, but it must not duplicate the artifact's full instructional content.

## Governance Expectations

Registry entries should be maintained by editors or governance maintainers.

The registry may support manual review, audit, and inventory work. It must not make automatic canonical status decisions, assessment decisions, mastery decisions, or quality certifications.

## Future Extensibility

This directory is intentionally documentation-first.

Future systems may read or transform registry entries, but this implementation does not introduce:

* storage technology;
* serialization requirements;
* runtime services;
* synchronization services;
* validation engines;
* indexing automation;
* frontend surfaces;
* backend logic.

## Directory Structure

```text
artifact-registry/
├── README.md
├── REGISTRY_SCHEMA.md
├── ARTIFACT_INDEX_TEMPLATE.md
└── artifacts/
```

The `artifacts/` directory is reserved for future registry entries.

## Example Registry Entries

The `artifacts/` directory includes seed entries that demonstrate registry conventions for each canonical artifact family.

These entries are illustrative governance examples. They are not Learning Artifact content, assessments, Competency Evidence, mastery records, runtime metadata, or approval decisions.

## Draft Content Registry Entries

The `artifacts/` directory may also include draft registry entries for real authored Learning Artifacts.

Draft registry entries point to artifact files and support editorial discoverability. They do not imply review completion, canonical approval, assessment use, Competency Evidence, or mastery certification.

## Evidence Boundary

The Artifact Registry indexes Learning Artifacts.

It does not generate Competency Evidence.

It does not certify mastery.

It does not store assessments, scores, grades, or learner performance.
