FROM python:3.12-slim

WORKDIR /app
COPY pyproject.toml uv.lock ./
COPY README.md ./
COPY alembic.ini ./
COPY migrations ./migrations
COPY src ./src
COPY vendor ./vendor
RUN pip install --no-cache-dir uv && uv sync --frozen --no-default-groups --group migration

ENV PYTHONUNBUFFERED=1
