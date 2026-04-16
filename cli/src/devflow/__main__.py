"""DevFlow CLI - Main entry point."""

import sys
from typing import List

import click
import yaml


def validate_workflow(workflow: dict) -> List[str]:
    """Valida que el workflow tenga los campos obligatorios.

    Args:
        workflow: Diccionario con los datos del workflow.

    Returns:
        Lista de errores encontrados. Si esta vacia, el workflow es valido.
    """
    errors: List[str] = []

    # Validar campo 'name' (obligatorio)
    if not workflow.get("name"):
        errors.append("El campo 'name' es obligatorio")

    # Validar campo 'steps' (obligatorio)
    if "steps" not in workflow:
        errors.append("El campo 'steps' es obligatorio")
    else:
        steps = workflow.get("steps", [])

        # Validar que haya al menos un paso
        if not steps:
            errors.append("Debe haber al menos un paso en el workflow")

        # Validar cada paso
        for i, step in enumerate(steps, start=1):
            if not step.get("name"):
                errors.append(f"El paso {i} no tiene 'name' (obligatorio)")

    return errors


@click.group()
def cli() -> None:
    """DevFlow - Automatiza tus workflows de developer."""
    pass


@cli.command()
@click.argument("workflow_file", type=click.Path(exists=True))
def run(workflow_file: str) -> None:
    """Ejecuta un workflow.

    Este comando lee un archivo YAML de workflow y ejecuta
    sus pasos en el orden correcto resolviendo dependencias.

    Args:
        workflow_file: Ruta al archivo YAML del workflow.
    """
    click.echo(f"Ejecutando workflow: {workflow_file}")

    # Leer el archivo YAML
    with open(workflow_file, "r", encoding="utf-8") as f:
        workflow = yaml.safe_load(f)

    # Validar que no este vacio
    if not workflow:
        click.echo("Error: El archivo esta vacio.", err=True)
        sys.exit(1)

    # Validar el workflow
    errors = validate_workflow(workflow)

    if errors:
        click.echo("\nError de validacion:", err=True)
        for error in errors:
            click.echo(f"  - {error}", err=True)
        sys.exit(1)

    # Mostrar informacion del workflow
    name = workflow.get("name", "Sin nombre")
    description = workflow.get("description", "Sin descripcion")
    version = workflow.get("version", "1.0")

    click.echo(f"\n{'='*50}")
    click.echo(f"Workflow: {name}")
    click.echo(f"Descripcion: {description}")
    click.echo(f"Version: {version}")
    click.echo(f"{'='*50}\n")

    # Mostrar pasos
    steps = workflow.get("steps", [])

    click.echo(f"Pasos ({len(steps)}):")
    for i, step in enumerate(steps, start=1):
        step_name = step.get("name", f"Paso {i}")
        step_run = step.get("run", "")
        click.echo(f"  {i}. {step_name}")
        if step_run:
            click.echo(f"     Comando: {step_run}")

    click.echo("\nWorkflow cargado correctamente.")


@cli.command()
def init() -> None:
    """Inicializa un nuevo workflow.

    Crea la estructura basica de un archivo de workflow
    en el directorio actual.
    """
    click.echo("Workflow inicializado!")


if __name__ == "__main__":
    cli()  # type: ignore
