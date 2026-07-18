# Delivery Payload Limits

Response, block, and manifest-reference limits are configurable through `NEURALVERSE_DELIVERY_MAX_RESPONSE_BYTES`, `NEURALVERSE_DELIVERY_MAX_BLOCKS`, and `NEURALVERSE_DELIVERY_MAX_MANIFEST_REFERENCES`. Exceeding a limit fails with `DELIVERY_PAYLOAD_TOO_LARGE`; no truncation or partial release is permitted.
