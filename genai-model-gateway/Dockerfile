FROM python:3.12-slim

RUN pip install uv --no-cache-dir && useradd -m appuser

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv export --frozen --no-dev --no-hashes --no-emit-project -o /tmp/requirements.txt && \
    uv pip install --system --no-cache -r /tmp/requirements.txt

COPY --chown=appuser src/ ./src/
RUN uv pip install --system --no-cache --no-deps .

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

CMD ["python", "-m", "uvicorn", "genai_model_gateway.main:app", "--host", "0.0.0.0", "--port", "8000"]
