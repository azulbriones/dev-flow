"""DevFlow CLI - Main entry point."""

import asyncio

import click
from rich.console import Console
from rich.live import Live
from rich.panel import Panel

from .api import create_execution, get_execution, stream_execution
from .executor import run_workflow
from .models import WorkflowError
from .parser import parse_workflow


console = Console()


@click.group()
def cli() -> None:
    """DevFlow CLI - Automatización de Workflows."""
    pass


@cli.command()
@click.argument("yaml_path", type=click.Path(exists=True))
@click.option("--remote", "-r", is_flag=True, help="Ejecutar en backend remoto.")
@click.option("--watch", "-w", is_flag=True, help="Monitorear ejecución (solo remote).")
def run(yaml_path: str, remote: bool, watch: bool) -> None:
    """Ejecuta un workflow desde un archivo YAML."""
    if remote:
        _run_remote(yaml_path, watch)
    else:
        _run_local(yaml_path)


def _run_remote(yaml_path: str, watch: bool) -> None:
    """Ejecuta en el backend remoto."""
    try:
        console.print(f"[bold blue]🚀 Enviando workflow:[/bold blue] {yaml_path}")
        result = create_execution(yaml_path)

        exec_id = result["id"]
        console.print(f"[bold green]✅ Ejecución creada![/bold green] ID: [yellow]{exec_id}[/yellow]")

        if watch:
            _monitor_execution(exec_id)
        else:
            console.print(f"\nUsa 'devflow status {exec_id}' para ver el progreso.")

    except ValueError as e:
        console.print(f"[bold red]Error:[/bold red] {e}")


def _run_local(yaml_path: str) -> None:
    """Ejecuta localmente."""
    try:
        console.print(f"[bold blue]📦 Cargando workflow:[/bold blue] {yaml_path}")
        workflow = parse_workflow(yaml_path)

        console.print(f"\n{'=' * 50}")
        console.print(f"[bold]{workflow.name}[/bold]")
        console.print(f"{workflow.description or 'Sin descripción'}")
        console.print(f"Versión: {workflow.version}")
        console.print(f"{'=' * 50}\n")

        console.print(f"Pasos ({len(workflow.steps)}):")
        for i, step in enumerate(workflow.steps, start=1):
            console.print(f"  {i}. {step.name}")

        console.print("\n[bold blue]▶ Ejecutando...[/bold blue]\n")

        def output_handler(line: str) -> None:
            console.print(line)

        run_workflow(workflow, output_callback=output_handler)
        console.print("\n[bold green]✅ Completado![/bold green]")

    except (ValueError, WorkflowError) as e:
        console.print(f"[bold red]Error:[/bold red] {e}")


@cli.command()
@click.argument("yaml_path", type=click.Path(exists=True))
def validate(yaml_path: str) -> None:
    """Valida un archivo YAML sin ejecutar."""
    try:
        workflow = parse_workflow(yaml_path)

        console.print(f"[bold green]✅ YAML válido[/bold green]")
        console.print(f"\n[bold]Workflow:[/bold] {workflow.name}")
        console.print(f"[bold]Versión:[/bold] {workflow.version}")
        console.print(f"[bold]Pasos:[/bold] {len(workflow.steps)}")

        console.print("\n[bold]Dependencias:[/bold]")
        for step in workflow.steps:
            if step.requires:
                console.print(f"  - {step.name} → {', '.join(step.requires)}")

    except ValueError as e:
        console.print(f"[bold red]Error:[/bold red] {e}")
        raise click.Abort()


@cli.command()
@click.argument("name", default="workflow.yaml")
def init(name: str) -> None:
    """Crea un archivo de workflow de ejemplo."""
    template = """name: Mi Workflow
version: "1.0"
description: Descripción del workflow

steps:
  - name: primer-paso
    run: echo "Hola mundo"

  - name: segundo-paso
    run: echo "Segundo paso"
    requires:
      - primer-paso
"""
    with open(name, "w") as f:
        f.write(template)
    console.print(f"[bold green]✅ Creado:[/bold green] {name}")


@cli.command()
@click.argument("execution_id", type=int)
def status(execution_id: int) -> None:
    """Ver el estado de una ejecución remota."""
    try:
        exec_data = get_execution(execution_id)
        status_val = exec_data.get("status", "unknown")

        color = "green" if status_val == "completed" else "yellow"
        if status_val == "failed":
            color = "red"

        console.print(f"[bold]Estado:[/bold] [{color}]{status_val}[/{color}]")
        if output := exec_data.get("output"):
            console.print(f"[bold]Salida:[/bold]\n{output}")

    except ValueError as e:
        console.print(f"[bold red]Error:[/bold red] {e}")


def _monitor_execution(execution_id: int) -> None:
    """Monitorea ejecución via WebSocket."""
    def on_message(msg: str) -> None:
        console.print(msg)

    try:
        asyncio.run(stream_execution(execution_id, on_message))
    except KeyboardInterrupt:
        console.print("\n[bold yellow]⏹ Monitoreo interrumpido[/bold yellow]")
    except (OSError, asyncio.CancelledError):
        console.print(f"[dim]WebSocket no disponible, usando polling...[/dim]")
        _poll_execution(execution_id)


def _poll_execution(execution_id: int) -> None:
    """Fallback polling si WebSocket no está disponible."""
    try:
        with Live(console=console, refresh_per_second=2) as live:
            while True:
                exec_data = get_execution(execution_id)
                status = exec_data["status"]

                color = "green" if status == "completed" else "yellow"
                if status == "failed":
                    color = "red"

                live.update(
                    Panel(
                        f"Estado: [bold {color}]{status}[/bold {color}]\n"
                        f"Salida: \n{exec_data.get('output', '')}",
                        title=f"Ejecución #{execution_id}",
                    )
                )

                if status in ["completed", "failed"]:
                    break
    except KeyboardInterrupt:
        console.print("\n[bold yellow]⏹ Monitoreo interrumpido[/bold yellow]")


if __name__ == "__main__":
    cli()
