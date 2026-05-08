"""Definir modelos y excepciones del CLI."""

from dataclasses import dataclass
from typing import List

# ============================================================================
# EXCEPCIONES
# ============================================================================


class WorkflowError(Exception):
    """Definir la excepción base para errores de workflow."""

    pass


class WorkflowParseError(WorkflowError):
    """Definir un error por parseo de workflow."""

    pass


class WorkflowValidationError(WorkflowError):
    """Definir un error por validación de workflow."""

    pass


class WorkflowAPIError(WorkflowError):
    """Definir un error por fallos de la API de workflow."""

    pass


class WorkflowCycleError(WorkflowError):
    """Definir un error por ciclo en las dependencias."""

    def __init__(self, cycle_steps: List[str]) -> None:
        self.cycle_steps = cycle_steps
        cycle_str = " -> ".join(cycle_steps)
        super().__init__(f"Ciclo detectado: {cycle_str}")


class DependencyNotFoundError(WorkflowError):
    """Definir un error por dependencia inexistente."""

    def __init__(self, step_name: str, missing_dep: str) -> None:
        self.step_name = step_name
        self.missing_dep = missing_dep
        super().__init__(
            f"El paso '{step_name}' depende de '{missing_dep}' que no existe"
        )


class ExecutionError(WorkflowError):
    """Definir un error por fallo de ejecución."""

    def __init__(self, step_name: str, command: str, returncode: int) -> None:
        self.step_name = step_name
        self.command = command
        self.returncode = returncode
        super().__init__(f"El comando '{command}' fallo con codigo {returncode}")


# ============================================================================
# DOMAIN ENTITIES
# ============================================================================


@dataclass
class Step:
    """Modelar un paso en un workflow.

    Attributes:
        name: Nombre único del paso.
        run: Comando a ejecutar.
        depends_on: Lista de nombres de pasos de los que depende.
    """

    name: str
    run: str
    depends_on: List[str]

    @classmethod
    def from_dict(cls: type["Step"], data: dict) -> "Step":
        """Crea un Step desde un diccionario.

        Args:
            data: Diccionario con los datos del paso.

        Returns:
            Instancia de Step.
        """
        return cls(
            name=data.get("name", ""),
            run=data.get("run", ""),
            depends_on=data.get("depends_on", data.get("requires", [])),
        )


@dataclass
class Workflow:
    """Modelar un workflow completo.

    Attributes:
        name: Nombre del workflow.
        description: Descripción opcional.
        version: Versión del workflow.
        steps: Lista de pasos del workflow.
    """

    name: str
    description: str
    version: str
    steps: List[Step]

    @classmethod
    def from_dict(cls: type["Workflow"], data: dict) -> "Workflow":
        """Crea un Workflow desde un diccionario.

        Args:
            data: Diccionario con los datos del workflow.

        Returns:
            Instancia de Workflow.
        """
        steps = [Step.from_dict(s) for s in data.get("steps", [])]
        return cls(
            name=data.get("name", ""),
            description=data.get("description", ""),
            version=data.get("version", "1.0"),
            steps=steps,
        )
