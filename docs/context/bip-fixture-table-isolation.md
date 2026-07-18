# Fixture Table Isolation

`fixture_records` remains test infrastructure only. Canonical repositories
read and write canonical tables and never treat fixture rows as domain
aggregates. The fixture model retains its non-canonicality checks and is not a
dependency of the Stage 5 domain migration.
