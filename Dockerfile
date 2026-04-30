FROM node:18-bullseye AS frontend-build
WORKDIR /app/frontend

COPY frontend/package.json ./
COPY frontend/package-lock.json ./
RUN npm install --silent

COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=7860

COPY backend/ /app/backend/
COPY models/ /app/models/
COPY assets/ /app/assets/

RUN pip install --no-cache-dir -r /app/backend/requirements.txt \
    && python -m spacy download en_core_web_sm

COPY --from=frontend-build /app/frontend/dist /app/backend/app/static

CMD ["bash", "-lc", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT}"]
