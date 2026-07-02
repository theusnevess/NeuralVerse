# Local LLM Setup

## Overview

NeuralVerse AI Copilot can connect to a local Ollama server for LLM inference. This provides:

- No API keys required
- No cloud provider calls
- Full privacy (data stays on your machine)
- Optimized for 16GB RAM + RTX 4060 (8GB VRAM)

## Default Model

**qwen3:8b** — General NeuralVerse Copilot

- 8B parameters
- Good balance of quality and speed
- Fits in 8GB VRAM with 4K context

## Fallback Model

**qwen2.5-coder:7b** — Optional coding-focused fallback

- 7B parameters
- Better for code generation tasks
- Lighter on resources

## Installation

### 1. Install Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from https://ollama.com/download
```

### 2. Pull Default Model

```bash
ollama pull qwen3:8b
```

### 3. Pull Optional Fallback (for coding tasks)

```bash
ollama pull qwen2.5-coder:7b
```

### 4. Start Ollama

```bash
ollama serve
```

The server starts on `http://localhost:11434` by default.

## Configuration

### Environment Variables

```bash
# Provider selection (default: mock)
NEURALVERSE_LLM_PROVIDER=local

# Ollama server URL (default: http://localhost:11434)
NEURALVERSE_LOCAL_LLM_URL=http://localhost:11434

# Model to use (default: qwen3:8b)
NEURALVERSE_LOCAL_LLM_MODEL=qwen3:8b

# Generation parameters
NEURALVERSE_LLM_TEMPERATURE=0.3
NEURALVERSE_LLM_TOP_P=0.9
NEURALVERSE_LLM_NUM_CTX=4096
```

### Quick Start

```bash
# Start Ollama
ollama serve

# In another terminal, test the model
ollama run qwen3:8b "Explain linear regression in one paragraph."
```

## Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 8 GB | 16 GB |
| GPU VRAM | 4 GB | 8 GB (RTX 4060) |
| Storage | 5 GB | 10 GB |

### Model Memory Usage

| Model | Parameters | VRAM (4K ctx) | VRAM (8K ctx) |
|-------|-----------|---------------|---------------|
| qwen3:8b | 8B | ~5 GB | ~6 GB |
| qwen2.5-coder:7b | 7B | ~4 GB | ~5 GB |

## Troubleshooting

### Model Not Found

```
Error: model 'qwen3:8b' not found
```

**Solution:**
```bash
ollama pull qwen3:8b
ollama list  # Verify model is installed
```

### Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:11434
```

**Solution:**
```bash
# Check if Ollama is running
ps aux | grep ollama

# Start Ollama
ollama serve

# Verify it's running
curl http://localhost:11434/api/tags
```

### Out of Memory

```
Error: out of memory
```

**Solution:**
1. Close other GPU-intensive applications
2. Reduce context size: `NEURALVERSE_LLM_NUM_CTX=2048`
3. Use smaller model: `NEURALVERSE_LOCAL_LLM_MODEL=qwen2.5-coder:7b`

### Slow Generation

If responses are slow:

1. Check GPU utilization: `nvidia-smi`
2. Reduce context size
3. Ensure no other processes are using GPU
4. Consider using a smaller model

### Fallback to Mock

If the local LLM is unavailable, NeuralVerse automatically falls back to MockProvider. In Developer Mode, you'll see:

```
Provider: MockProvider
Reason: LocalProvider unavailable (Ollama not running)
```

To fix:
1. Start Ollama: `ollama serve`
2. Verify model: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`

## Verification

### Check Ollama Status

```bash
# List installed models
ollama list

# Check server health
curl http://localhost:11434/api/tags

# Test a prompt
ollama run qwen3:8b "Hello, are you working?"
```

### Check NeuralVerse Integration

1. Open NeuralVerse AI Copilot
2. Click the `</>` Developer Mode button
3. Verify:
   - Provider: LocalProvider
   - Model: qwen3:8b
   - Endpoint: http://localhost:11434
   - Status: Connected

## Performance Tuning

### Optimal Settings for RTX 4060

```bash
NEURALVERSE_LLM_TEMPERATURE=0.3
NEURALVERSE_LLM_TOP_P=0.9
NEURALVERSE_LLM_NUM_CTX=4096
```

### For Faster Responses

```bash
NEURALVERSE_LLM_NUM_CTX=2048  # Reduce context window
```

### For Higher Quality

```bash
NEURALVERSE_LLM_TEMPERATURE=0.5  # More creative
NEURALVERSE_LLM_NUM_CTX=8192     # Larger context (needs more VRAM)
```

## Security

- **Local only**: LocalProvider only connects to localhost (127.0.0.1, ::1)
- **No external calls**: Non-localhost URLs are rejected
- **No API keys**: Ollama doesn't require API keys
- **No data upload**: All inference happens locally
- **No network**: Traffic never leaves your machine

## Testing

Tests use mocked fetch transport and never call real Ollama:

```bash
npm test  # Runs all tests including LocalProvider tests
```

## Architecture

```
NeuralVerse Copilot UI
    ↓
Copilot Runtime
    ↓
LocalProvider
    ↓
Ollama Server (localhost:11434)
    ↓
qwen3:8b Model
    ↓
Response
```

D1-D10 deterministic agents remain separate and are never called by the LLM layer.
