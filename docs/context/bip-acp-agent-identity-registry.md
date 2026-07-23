# BIP ACP Agent Identity Registry

The BIP registry uses the ACP canonical identifiers:

`curriculum-dependency`, `research`, `knowledge`, `application`, `laboratory`,
`assessment`, `narrative`, `curiosity`, `didactic`, and
`obsidian-governance`.

Identity is not derived from display labels, task queues, workflow stages, or
request-provided producer strings. An operation and producer must match the
closed registry exactly or BIP returns `ACP_PRODUCER_NOT_AUTHORIZED`.
