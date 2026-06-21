# Artifact Registry Schema

## Purpose

This document describes the canonical fields used by human-readable Artifact Registry entries.

The registry schema is descriptive.

It does not prescribe storage technology.

It does not prescribe serialization format.

It does not prescribe APIs.

It does not prescribe databases.

No executable schema, validation engine, parser, backend, or runtime service is introduced by this document.

## Field Model

The following fields describe a canonical registry entry. Required fields identify the minimum information needed to catalogue an artifact. Optional fields improve editorial discoverability and governance context.

## Identity Fields

### artifact_id

Required.

A stable editorial identifier for the registered Learning Artifact.

Relationship to NV-800-M7: records the artifact identity used by authoring and governance processes.

### artifact_title

Required.

The human-readable title of the Learning Artifact.

Relationship to NV-800-M7: mirrors the title used by the authored artifact.

### artifact_family

Required.

The canonical artifact family from NV-800-M7 Phase 1.

Allowed families:

```text
Instruction Artifacts
Interactive Artifacts
Practice Artifacts
Reference Artifacts
```

### artifact_type

Required.

The canonical artifact type from NV-800-M7 Phase 1 and Phase 2.

The registry records the type. It does not redefine the type contract.

## Governance Fields

### canonical_status

Required.

The current governance status of the artifact.

Relationship to NV-800-M7: records a status value supplied by Phase 3.

The registry does not assign status automatically.

### registry_created

Optional.

The date or editorial note indicating when the registry entry was created.

This is registry bookkeeping only and is not lifecycle automation.

### registry_updated

Optional.

The date or editorial note indicating when the registry entry was last updated.

This is registry bookkeeping only and is not lifecycle automation.

## Pedagogical Index Fields

### instructional_objectives

Optional.

A list of instructional objectives associated with the artifact.

Relationship to NV-800-M7: records values supplied by Phase 5.

### learning_depths

Optional.

A list of learning depth levels associated with the artifact.

Relationship to NV-800-M7: records values supplied by Phase 5.

### supported_learning_levels

Optional.

A list of learner levels supported by the artifact.

Relationship to NV-800-M7: records metadata expectations supplied by Phase 5.

### estimated_duration

Optional.

An editorial estimate of learner-facing time or author-facing usage context.

The registry records this estimate but does not use it for scheduling automation.

## Reuse Fields

### reuse_mode

Optional.

The reuse mode associated with the artifact when governed reuse applies.

Relationship to NV-800-M7: records values supplied by Phase 4.

An empty value means no reuse mode is assumed by the registry.

## Dependency Fields

### dependencies

Optional.

A grouped set of dependency relationships.

Relationship to NV-800-M7: records dependency categories supplied by Phase 6.

Canonical categories:

```text
prerequisite
recommended_before
recommended_after
complementary
alternative
```

The registry records dependency references. It does not implement a dependency graph engine.

## Location Fields

### artifact_location

Required.

The human-readable path, link, or editorial pointer to the artifact file.

The registry records where the artifact can be found. It does not load, parse, synchronize, or validate the artifact.

## Editorial Fields

### notes

Optional.

Freeform editorial notes for maintainers.

Notes should not contain full instructional content, assessment scoring, learner performance, or Competency Evidence.

## Canonical Registry Entry Shape

The following shape is documentation only:

```yaml
artifact_id:
artifact_title:
artifact_family:
artifact_type:

canonical_status:

instructional_objectives:
learning_depths:
supported_learning_levels:

estimated_duration:

reuse_mode:

dependencies:

registry_created:
registry_updated:

artifact_location:

notes:
```

## Implementation Independence

This schema is a governance document.

It must remain compatible with Markdown, Obsidian, future automation, and manual editorial review.

It must not be treated as:

* JSON Schema;
* database schema;
* API contract;
* frontend data model;
* backend model;
* validation rule engine;
* artifact parser.

## Evidence Boundary

The registry indexes Learning Artifacts.

It does not store Competency Evidence.

It does not store assessment results.

It does not store learner scores or grades.

It does not determine mastery.
