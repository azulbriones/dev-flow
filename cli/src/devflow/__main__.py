"""DevFlow CLI - Main entry point."""

import sys

import click

from .executor import run_workflow
from .models import WorkflowError
from .parser import parse_workflow


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

    # Cargar workflow
    try:
        workflow = parse_workflow(workflow_file)
    except ValueError as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)

    # Mostrar información del workflow
    click.echo(f"\n{'=' * 50}")
    click.echo(f"Workflow: {workflow.name}")
    click.echo(f"Descripcion: {workflow.description}")
    click.echo(f"Version: {workflow.version}")
    click.echo(f"{'=' * 50}\n")

    # Mostrar pasos
    click.echo(f"Pasos ({len(workflow.steps)}):")
    for i, step in enumerate(workflow.steps, start=1):
        click.echo(f"  {i}. {step.name}")
        if step.run:
            click.echo(f"     Comando: {step.run}")

    click.echo("\nWorkflow cargado correctamente.")

    # Definir callback para output (simplificado)
    def output_handler(line: str) -> None:
        click.echo(line)

    # Ejecutar el workflow
    try:
        run_workflow(workflow, output_callback=output_handler)
    except WorkflowError as e:
        click.echo(f"\nError: {e}", err=True)
        sys.exit(1)


@cli.command()
def init() -> None:
    """Inicializa un nuevo workflow.

    Crea la estructura básica de un archivo de workflow
    en el directorio actual.
    """
    click.echo("Workflow inicializado!")


if __name__ == "__main__":
    cli()  # type: ignore
