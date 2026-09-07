# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend runtime
FROM python:3.10-slim AS backend-runtime
WORKDIR /app

# System dependencies for psycopg2 and compiling packages if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend assets to FastAPI static folder
COPY --from=frontend-builder /app/frontend/dist /app/backend/app/static

WORKDIR /app/backend

# Create directory for local uploads and artifacts
RUN mkdir -p storage/uploads artifacts

# Expose single full-stack port
EXPOSE 8000

ENV DATABASE_URL="sqlite:///./menstrual_health.db"
ENV SCHEDULER_ENABLED="false"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
