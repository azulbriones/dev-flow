# DevFlow

[![CI](https://github.com/azulbriones/dev-flow/actions/workflows/ci.yml/badge.svg)](https://github.com/azulbriones/dev-flow/actions)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![Node](https://img.shields.io/badge/Node-22+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

DevFlow es una plataforma para definir, ejecutar y monitorear workflows de desarrollo desde una CLI y un dashboard en tiempo real.
El proyecto combina automatización local, ejecución asíncrona y observabilidad para seguir el estado de cada workflow sin perder contexto.

## Qué incluye

- **CLI en Python** para inicializar, validar y ejecutar workflows.
- **Backend en FastAPI** para exponer la API, coordinar ejecuciones y servir WebSockets.
- **Workers con Celery** para procesar tareas en segundo plano.
- **Frontend en React** para visualizar ejecuciones, estados y métricas.
- **Persistencia y coordinación con Redis**.
- **Contenedores Docker** para levantar el stack completo de forma reproducible.

## Arquitectura general

| Componente | Responsabilidad | Tecnologías |
| --- | --- | --- |
| CLI | Entrada principal para usuarios y automatizaciones | Python, Click |
| Backend | API REST, WebSockets y lógica de coordinación | FastAPI, SQLAlchemy |
| Worker | Ejecución asíncrona de workflows | Celery, Redis |
| Frontend | Dashboard de monitoreo en tiempo real | React, Vite, SCSS, Recharts |
| Infraestructura | Orquestación local de servicios | Docker, Docker Compose |

## Estructura del repositorio

```text
dev-flow/
├── backend/        # API, migraciones y workers
├── cli/            # CLI instalada como paquete Python
├── frontend/       # Dashboard web
├── docker-compose.yml
└── README.md
```

## Requisitos previos

- Docker Desktop
- Python 3.11 o superior
- Node.js 22 o superior
- pnpm 11.x

## Inicio rápido

### Con Docker (recomendado)

```bash
docker-compose up --build
```

Servicios disponibles:

- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- Redis: localhost:6379

### Desarrollo local

#### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Migraciones

```bash
cd backend
alembic -c alembic.ini upgrade head
```

#### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Scripts disponibles en `frontend/package.json`:

- `pnpm dev` — arranque de desarrollo
- `pnpm build` — build de producción
- `pnpm lint` — lint del frontend
- `pnpm preview` — vista previa del build

#### CLI

```bash
cd cli
python3 -m venv venv
source venv/bin/activate
pip install -e ./src
devflow --help
```

## Comandos principales de la CLI

```bash
devflow init     # Inicializa un workflow nuevo
devflow validate # Valida un archivo YAML de workflow
devflow run      # Ejecuta un workflow
```

## Variables de entorno

| Variable | Descripción | Valor típico |
| --- | --- | --- |
| `REDIS_URL` | Conexión a Redis para backend y workers | `redis://localhost:6379/0` |
| `VITE_API_URL` | URL base del backend para el frontend | `http://localhost:8000` |
| `VITE_WS_URL` | URL de WebSocket para actualizaciones en vivo | `ws://localhost:8000` |

> El stack Docker ya define estas variables en `docker-compose.yml`.

## API y tiempo real

Endpoints relevantes:

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/` | Health check |
| GET | `/health` | Estado del servicio |
| GET | `/api/v1/workflows` | Listar workflows |
| POST | `/api/v1/workflows` | Crear workflow |

El backend también expone WebSockets para reflejar el estado de ejecución en el dashboard en tiempo real.

## Flujo recomendado de uso

1. Definí el workflow en YAML.
2. Validalo con la CLI.
3. Ejecutalo desde la CLI o el backend.
4. Seguile el progreso desde el dashboard.
5. Revisá logs, resultados y errores desde la UI o la API.

## Tecnologías principales

- Python 3.11+
- FastAPI
- SQLAlchemy
- Redis
- Celery
- React
- Vite
- Recharts
- SCSS
- Docker

## Licencia

MIT
