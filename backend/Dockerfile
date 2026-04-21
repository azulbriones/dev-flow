FROM python:3.11-slim

WORKDIR /app

# Copiar requirements y dependencias
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código backend
COPY backend/ .

# Copiar CLI (necesario para ejecutar workflows)
COPY cli/src /app/cli_src

# Instalar CLI como módulo editable
RUN pip install -e /app/cli_src

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
