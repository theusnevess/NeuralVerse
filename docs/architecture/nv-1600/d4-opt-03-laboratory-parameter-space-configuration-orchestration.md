# D4-OPT-03 — Laboratory Parameter Space & Configuration Orchestration

## Purpose

Implements the canonical Laboratory Parameter Space & Configuration Orchestration layer described by the Laboratory Agent specification. This layer is responsible only for describing configurable laboratory parameters, parameter domains, parameter validation, parameter grouping, parameter presets, and deterministic configuration metadata.

This phase **never executes** a laboratory.

It **never evaluates** parameters.

It **never optimizes** parameters.

It only models them.

---

## Architecture

Parameter Space is metadata.

Configuration is metadata.

Execution consumes configuration.

This phase defines neither execution nor optimization.

---

## Parameter Model

Each parameter contains metadata only:

- `parameterId` — Unique identifier
- `name` — Human-readable name
- `description` — Description of the parameter
- `parameterType` — The type of parameter (integer, float, boolean, etc.)
- `parameterCategory` — The category of parameter (algorithm, visualization, etc.)
- `defaultValue` — The default value as a string
- `constraints` — List of constraints on the parameter
- `groupId` — The group this parameter belongs to
- `required` — Whether the parameter is required
- `visible` — Whether the parameter is visible
- `editable` — Whether the parameter is editable
- `provenance` — Provenance metadata

No executable callbacks.

No runtime objects.

---

## Parameter Types (10)

```text
integer
float
boolean
categorical
enum
string
vector
matrix
distribution
seed
```

---

## Parameter Categories (10)

```text
algorithm
visualization
simulation
dataset
preprocessing
postprocessing
execution
hardware
evaluation
experimental
```

---

## Constraint Model

Represent only metadata.

Allowed examples:

- `minimum` — Minimum value for range constraints
- `maximum` — Maximum value for range constraints
- `allowedValues` — List of allowed values for set constraints
- `pattern` — Regex pattern for string constraints
- `dependsOn` — Parameter this depends on
- `exclusiveWith` — Parameters that are mutually exclusive

Forbidden:

- `validator()`
- `callback()`
- `function()`
- `script()`
- expression evaluator

---

## Constraint Types (10)

```text
range
set
fixed
regex
dependency
exclusive
required
optional
readonly
computed
```

---

## Parameter Groups

Groups organize parameters:

- `Algorithm` — Algorithm-related parameters
- `Visualization` — Visualization-related parameters
- `Simulation` — Simulation-related parameters
- `Dataset` — Dataset-related parameters
- `Hardware` — Hardware-related parameters
- `Evaluation` — Evaluation-related parameters
- `Advanced` — Advanced parameters

Groups contain metadata only.

---

## Configuration Model

A configuration references:

- `configurationId` — Unique identifier
- `laboratoryId` — The laboratory this configuration belongs to
- `parameterIds` — List of parameter IDs in this configuration
- `groupIds` — List of group IDs in this configuration
- `status` — The configuration status
- `governanceStatus` — The governance status
- `provenance` — Provenance metadata

Configurations never contain execution state.

---

## Configuration Status (6)

```text
draft
review
approved
published
deprecated
archived
```

---

## Registry

Registry stores:

- `configurations` — List of configurations
- `parameters` — List of parameters
- `groups` — List of groups
- `trace` — Deterministic trace
- `provenance` — Provenance metadata

No runtime values.

---

## Provenance

Every configuration requires:

- `configurationId`
- `source`
- `governanceStatus`
- `rationale`
- `providedBy`

Every parameter requires provenance.

Every group requires provenance.

---

## Validation Layer

### Functions

- `validateParameter()` — Validates a single parameter
- `validateConstraint()` — Validates a constraint
- `validateParameterGroup()` — Validates a parameter group
- `validateConfiguration()` — Validates a configuration
- `validateConfigurationRegistry()` — Validates a complete registry
- `validateLaboratoryArtifactWithConfiguration()` — Validates a complete artifact
- `validateConfigurationInput()` — Validates input data

### Validation Codes

```text
PARAMETER_UNKNOWN_TYPE
PARAMETER_UNKNOWN_CATEGORY
PARAMETER_DUPLICATE_ID
PARAMETER_DUPLICATE_NAME
PARAMETER_INVALID_DEFAULT
PARAMETER_MISSING_PROVENANCE
PARAMETER_MISSING_SOURCE
PARAMETER_MISSING_RATIONALE
PARAMETER_MISSING_PROVIDED_BY
CONSTRAINT_UNKNOWN_TYPE
CONSTRAINT_INVALID_REFERENCE
GROUP_DUPLICATE_ID
GROUP_EMPTY
CONFIGURATION_DUPLICATE_ID
CONFIGURATION_INVALID_REFERENCE
CONFIGURATION_EMPTY
CONFIGURATION_INVALID_STATUS
CONFIGURATION_MISSING_PROVENANCE
REGISTRY_EMPTY
TRACE_NOT_DETERMINISTIC
TRACE_RANDOM_USED
TRACE_TIME_DEPENDENCY
TRACE_LABORATORY_MUTATED
```

Validation returns structured errors. Never throws exceptions.

---

## Deterministic Guarantees

The implementation never uses:

```text
Math.random
Date.now
performance.now
new Date()
crypto.randomUUID()
uuid
```

No runtime clocks. No randomness.

---

## Deterministic Ordering

Registry ordering:

```text
configurationId
↓
laboratoryId
↓
parameterGroup
↓
parameterId
```

Always identical.

---

## Public API

### Kernel Functions

- `composeParameterProvenance()` — Composes parameter provenance
- `composeParameterGroupProvenance()` — Composes group provenance
- `composeConfigurationProvenance()` — Composes configuration provenance
- `composeParameterConstraint()` — Composes a constraint
- `composeParameter()` — Composes a parameter
- `composeParameterGroup()` — Composes a parameter group
- `composeConfiguration()` — Composes a configuration
- `composeConfigurationTrace()` — Composes a trace
- `composeConfigurationRegistry()` — Composes a registry
- `composeLaboratoryConfiguration()` — Main entry point

### Helper Functions

- `isSupportedParameterType()` — Type guard for parameter types
- `isSupportedParameterCategory()` — Type guard for parameter categories
- `isSupportedConstraintType()` — Type guard for constraint types
- `isSupportedConfigurationStatus()` — Type guard for configuration statuses
- `isSupportedParameterGovernanceStatus()` — Type guard for governance statuses
- `getCanonicalParameterTypes()` — Returns canonical parameter types
- `getCanonicalParameterCategories()` — Returns canonical parameter categories
- `getCanonicalConstraintTypes()` — Returns canonical constraint types
- `getCanonicalConfigurationStatuses()` — Returns canonical configuration statuses

---

## Relationships with D4-OPT-01 and D4-OPT-02

- **D4-OPT-01** — Laboratory Contract & Registry Kernel: Provides the foundational laboratory metadata, registry, provenance, and validation. D4-OPT-03 extends these contracts with parameter and configuration types.
- **D4-OPT-02** — Safe Deterministic Execution Model: Provides execution plans, policies, environments, and traces. D4-OPT-03's configurations are consumed by execution plans.

---

## Out-of-Scope

This phase MUST NOT:

- Execute laboratories
- Evaluate parameters
- Optimize parameters
- Generate parameter values
- Infer defaults
- Infer best parameters
- Perform hyperparameter optimization
- Perform search
- Execute callbacks
- Evaluate expressions
- Generate code
- Generate scripts
- Access filesystem
- Access browser APIs
- Access network
- Mutate configuration
- Mutate registry

---

## Runtime Limitations

This phase defines metadata only.

Execution consumes metadata.

Optimization consumes metadata.

Neither execution nor optimization exists in this phase.
