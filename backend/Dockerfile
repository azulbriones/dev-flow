FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias primero (cache de Docker)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar CLI como módulo (para ejecución de workflows)
COPY cli/src/devflow /app/devflow

# Copiar código backend
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
