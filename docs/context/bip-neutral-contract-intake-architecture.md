# BIP Neutral Contract Intake Architecture

```text
ACP canonical artifact
  -> /cross-front/canonical-input
  -> strict UTF-8 parser
  -> pinned release and checksum verification
  -> compatibility verification
  -> released JSON Schema validation
  -> lossless CanonicalIntake
  -> future workflow and persistence boundaries
```

`neuralverse_backend.canonical_input` is the canonical intake boundary. The
HTTP route reads the original request bytes and delegates to the injected
reader. It does not import ACP, normalize fields, sort arrays, infer semantic
values, or hand invalid input to the existing workflow service.

The older `NV-XFI-000` envelope route remains a separate legacy workflow
boundary. M3 adds canonical input validation without expanding the scope into
durable execution or storage.
