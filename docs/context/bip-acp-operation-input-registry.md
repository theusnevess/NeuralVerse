# BIP ACP Operation Input Registry

BIP owns a closed registry for the thirteen Stage 9 ACP operations. Each entry
binds the operation version, canonical producer identity, input contract,
output contract, dependency keys, payload limit, and a local assembler.

Unknown operation names fail with `ACP_OPERATION_NOT_REGISTERED`. Assemblers
are selected from this static registry; request data cannot select imports or
handlers.

The registry is an input boundary only. ACP remains responsible for semantic
content and XFI artifact production.
