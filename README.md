# DevFlow

[![CI](https://github.com/azulbriones/dev-flow/actions/workflows/ci.yml/badge.svg)](https://github.com/azulbriones/dev-flow/actions)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![Node](https://img.shields.io/badge/Node-22+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Automatiza tus workflows de developer con CLI y visualizalos en un Dashboard en tiempo real.

## Descripción

DevFlow es una herramienta para automatizar workflows de developers. Define tus workflows en YAML, ejecutalos via CLI y monitorealos en un dashboard en tiempo real.

## Stack Tecnológico

| Componente          | Tecnología                     |
| ------------------- | ------------------------------ |
| **CLI**             | Python + Click                 |
| **Backend**         | FastAPI + SQLAlchemy + Redis   |
| **Frontend**        | React + Vite + SCSS + Recharts |
| **Tiempo Real**     | WebSockets                     |
| **Background Jobs** | Celery + Redis                 |
| **Contenedores**    | Docker + Docker Compose        |

## Estructura del Proyecto

```
dev-flow/
├── docker-compose.yml     # Orquestación de servicios
├── backend/               # API REST + WebSockets
│   ├── app/
│   │   └── main.py        # FastAPI entry point
│   ├── requirements.txt   # Dependencias Python
│   └── Dockerfile        # Imagen Docker
├── frontend/              # Dashboard React
│   ├── src/               # Código fuente
│   ├── package.json      # Dependencias Node
│   └── Dockerfile        # Imagen Docker
└── cli/                   # CLI de comandos
    ├── src/
    │   ├── devflow/       # Paquete CLI
    │   └── pyproject.toml
    └── venv/             # Entorno virtual (no versionado)
```

## Requisitos Previos

- Docker Desktop
- Python 3.11+
- Node.js 22+
- pnpm (opcional)

## 🚀 Cómo Empezar

### Con Docker (Recomendado)

```bash
# Levantar todos los servicios
docker-compose up --build

# Servicios disponibles:
# - Backend:   http://localhost:8000
# - Frontend: http://localhost:5173
# - Redis:    localhost:6379
```

### Desarrollo Local

#### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

#### CLI

```bash
cd cli
python3 -m venv venv
source venv/bin/activate
pip install -e ./src
devflow --help
```

## Comandos CLI

```bash
devflow run      # Ejecuta un workflow
devflow init     # Inicializa un nuevo workflow
devflow validate # Valida YAML de workflow
```

## API Endpoints

| Método | Endpoint            | Descripción         |
| ------ | ------------------- | ------------------- |
| GET    | `/`                 | Health check        |
| GET    | `/health`           | Estado del servicio |
| GET    | `/api/v1/workflows` | Listar workflows    |
| POST   | `/api/v1/workflows` | Crear workflow      |

## Tecnologías que vas a aprender

- ✅ React Context API (WorkflowContext, ThemeContext)
- ✅ Integración con WebSockets para actualizaciones en vivo
- ✅ Recharts para timeline y gráficos de ejecución
- ✅ Python Click para framework CLI
- ✅ FastAPI para API REST
- ✅ Docker y Docker Compose para containers

## Licencia

MIT
