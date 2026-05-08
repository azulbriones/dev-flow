"""Definir la carga y validación de workflows."""

from collections.abc import Mapping
from typing import List

import yaml

from .models import Workflow, WorkflowParseError, WorkflowValidationError


def load_workflow_file(path: str) -> dict:
    """Carga un archivo YAML de workflow.

    Args:
        path: Ruta al archivo YAML.

    Returns:
        Diccionario con los datos del workflow.

    Raises:
        WorkflowParseError: Si el archivo no existe o el YAML es inválido.
    """
    try:
        with open(path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        raise WorkflowParseError(f"No se encontró el archivo: {path}")
    except yaml.YAMLError as e:
        raise WorkflowParseError(f"YAML inválido: {e}")


def validate_workflow(workflow_data: object) -> List[str]:
    """Valida que el workflow tenga los campos obligatorios.

    Args:
        workflow_data: Diccionario con los datos del workflow.

    Returns:
        Lista de errores encontrados. Si está vacía, el workflow es válido.
    """
    errors: List[str] = []

    if not isinstance(workflow_data, Mapping):
        return ["El workflow debe ser un objeto YAML con claves name y steps"]

    # Validar campo 'name' (obligatorio)
    if not workflow_data.get("name"):
        errors.append("El campo 'name' es obligatorio")

    # Validar campo 'steps' (obligatorio)
    if "steps" not in workflow_data:
        errors.append("El campo 'steps' es obligatorio")
    else:
        steps = workflow_data.get("steps", [])

        if not isinstance(steps, list):
            errors.append("El campo 'steps' debe ser una lista")
        elif not steps:
            errors.append("Debe haber al menos un paso en el workflow")
        else:
            # Validar cada paso
            for i, step in enumerate(steps, start=1):
                if not isinstance(step, dict):
                    errors.append(f"El paso {i} debe ser un objeto YAML")
                    continue

                if not step.get("name"):
                    errors.append(f"El paso {i} no tiene 'name' (obligatorio)")
                if not step.get("run"):
                    errors.append(f"El paso {i} no tiene 'run' (obligatorio)")

    return errors


def parse_workflow(path: str) -> Workflow:
    """Carga y parsea un archivo de workflow.

    Args:
        path: Ruta al archivo YAML.

    Returns:
        Instancia de Workflow.

    Raises:
        WorkflowValidationError: Si el workflow es inválido.
    """
    workflow_data = load_workflow_file(path)

    if not workflow_data:
        raise WorkflowValidationError("El archivo está vacío")

    errors = validate_workflow(workflow_data)
    if errors:
        raise WorkflowValidationError("\n".join(errors))

    return Workflow.from_dict(workflow_data)
