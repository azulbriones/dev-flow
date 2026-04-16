"""DevFlow Parser - YAML loading and validation."""

from typing import List

import yaml

from .models import Workflow


def load_workflow_file(path: str) -> dict:
    """Carga un archivo YAML de workflow.

    Args:
        path: Ruta al archivo YAML.

    Returns:
        Diccionario con los datos del workflow.

    Raises:
        FileNotFoundError: Si el archivo no existe.
        yaml.YAMLError: Si el archivo no es válido.
    """
    try:
        with open(path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        raise FileNotFoundError(f"No se encontró el archivo: {path}")


def validate_workflow(workflow_data: dict) -> List[str]:
    """Valida que el workflow tenga los campos obligatorios.

    Args:
        workflow_data: Diccionario con los datos del workflow.

    Returns:
        Lista de errores encontrados. Si está vacía, el workflow es válido.
    """
    errors: List[str] = []

    # Validar campo 'name' (obligatorio)
    if not workflow_data.get("name"):
        errors.append("El campo 'name' es obligatorio")

    # Validar campo 'steps' (obligatorio)
    if "steps" not in workflow_data:
        errors.append("El campo 'steps' es obligatorio")
    else:
        steps = workflow_data.get("steps", [])

        # Validar que haya al menos un paso
        if not steps:
            errors.append("Debe haber al menos un paso en el workflow")

        # Validar cada paso
        for i, step in enumerate(steps, start=1):
            if not step.get("name"):
                errors.append(f"El paso {i} no tiene 'name' (obligatorio)")

    return errors


def parse_workflow(path: str) -> Workflow:
    """Carga y parsea un archivo de workflow.

    Args:
        path: Ruta al archivo YAML.

    Returns:
        Instancia de Workflow.

    Raises:
        ValueError: Si el workflow es inválido.
    """
    workflow_data = load_workflow_file(path)

    if not workflow_data:
        raise ValueError("El archivo está vacío")

    errors = validate_workflow(workflow_data)
    if errors:
        raise ValueError("\n".join(errors))

    return Workflow.from_dict(workflow_data)
