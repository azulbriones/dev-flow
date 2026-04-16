import click


@click.group()
def cli() -> None:
    """DevFlow - Automatiza tus workflows de developer."""
    pass


@cli.command()
def run() -> None:
    """Ejecuta un workflow.

    Este comando lee un archivo YAML de workflow y ejecuta
    sus pasos en el orden correcto resolviendo dependencias.
    """
    click.echo("Ejecutando workflow...")


@cli.command()
def init() -> None:
    """Inicializa un nuevo workflow.

    Crea la estructura básica de un archivo de workflow
    en el directorio actual.
    """
    click.echo("Workflow inicializado!")


if __name__ == "__main__":
    cli()  # type: ignore