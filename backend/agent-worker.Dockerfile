FROM node:24-slim AS acp
WORKDIR /opt/acp
COPY neuralverse-agents/package.json neuralverse-agents/package-lock.json ./
RUN npm ci --ignore-scripts
COPY neuralverse-agents/bin ./bin
COPY neuralverse-agents/src ./src

FROM python:3.12-slim
WORKDIR /app
COPY neuralverse-backend/backend/pyproject.toml neuralverse-backend/backend/uv.lock ./
COPY neuralverse-backend/backend/README.md ./README.md
COPY neuralverse-backend/backend/src ./src
COPY neuralverse-backend/backend/vendor ./vendor
RUN pip install --no-cache-dir uv && uv sync --frozen --no-dev
COPY neuralverse-backend/backend/src ./src
COPY --from=acp /opt/acp /opt/acp
COPY --from=acp /usr/local/bin/node /usr/local/bin/node
ENV PYTHONUNBUFFERED=1
