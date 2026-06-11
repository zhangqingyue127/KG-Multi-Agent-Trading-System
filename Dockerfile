FROM node:20-bookworm-slim AS frontend-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY public ./public
COPY src ./src
RUN npm run build


FROM python:3.11-slim AS runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY api_server.py ./
COPY generate_analysis.py ./
COPY generate_sample_analysis.py ./
COPY test_api.py ./
COPY .env.example ./
COPY --from=frontend-builder /app/build ./build

EXPOSE 10000

CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-10000} api_server:app"]
