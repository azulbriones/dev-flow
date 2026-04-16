"""DevFlow Executor - Kahn algorithm and step execution."""

import subprocess
from collections import deque
from typing import Callable, Dict, List, Optional

from .models import (
    DependencyNotFoundError,
    ExecutionError,
    Step,
    Workflow,
    WorkflowCycleError,
)


# ============================================================================
# ALGORITMO DE KAHN - RESOLUCION DE DEPENDENCIAS
# ============================================================================


def build_graph(
    steps: List[Step],
) -> tuple[
    Dict[str, List[str]],
    Dict[str, int],
    Dict[str, List[str]],
]:
    """Construye el grafo de dependencias y calcula in-degree.

    Args:
        steps: Lista de pasos del workflow.

    Returns:
        Tupla con (grafo, in_degree, reverse_graph).

    Raises:
        DependencyNotFoundError: Si una dependencia no existe.
    """
    # Crear diccionario de steps por nombre
    step_names: Dict[str, Step] = {step.name: step for step in steps}

    # Construir grafo: {step_name: [dependencies]}
    graph: Dict[str, List[str]] = {}
    in_degree: Dict[str, int] = {}
    reverse_graph: Dict[str, List[str]] = {}

    for step in steps:
        name = step.name
        # Deduplicar dependencias
        deps = list(set(step.depends_on))
        graph[name] = deps
        in_degree[name] = len(deps)
        reverse_graph[name] = []

        # Validar que todas las dependencias existan
        for dep in deps:
            if dep not in step_names:
                raise DependencyNotFoundError(name, dep)

    # Construir reverse_graph
    for step in steps:
        for dep in step.depends_on:
            if dep not in reverse_graph:
                reverse_graph[dep] = []
            reverse_graph[dep].append(step.name)

    return graph, in_degree, reverse_graph


def find_cycle(graph: Dict[str, List[str]]) -> List[str]:
    """Encuentra un ciclo en el grafo usando DFS.

    Args:
        graph: Diccionario con las dependencias de cada step.

    Returns:
        Lista con los nombres de los steps que forman el ciclo.
    """
    visited: Dict[str, bool] = {}
    rec_stack: Dict[str, bool] = {}
    path: Dict[str, str] = {}

    def dfs(node: str) -> Optional[List[str]]:
        visited[node] = True
        rec_stack[node] = True

        for dep in graph.get(node, []):
            if dep not in visited:
                path[dep] = node
                result = dfs(dep)
                if result:
                    return result
            elif rec_stack.get(dep, False):
                cycle = [dep]
                current = node
                while current != dep and current in path:
                    cycle.append(current)
                    current = path[current]
                cycle.append(dep)
                return cycle[::-1]

        rec_stack[node] = False
        return None

    for node in graph:
        if node not in visited:
            result = dfs(node)
            if result:
                return result
    return []


def resolve_order(steps: List[Step]) -> List[Step]:
    """Resuelve el orden de ejecución usando el algoritmo de Kahn.

    Args:
        steps: Lista de pasos del workflow.

    Returns:
        Lista de pasos ordenada topológicamente.

    Raises:
        WorkflowCycleError: Si se detecta un ciclo.
    """
    if not steps:
        return []

    graph, in_degree, reverse_graph = build_graph(steps)

    # Steps con in-degree = 0
    queue: deque = deque([name for name, degree in in_degree.items() if degree == 0])

    result: List[Step] = []
    step_map: Dict[str, Step] = {step.name: step for step in steps}

    while queue:
        current = queue.popleft()  # O(1) con deque
        result.append(step_map[current])

        # Usar reverse_graph para O(V+E)
        for dependent in reverse_graph.get(current, []):
            in_degree[dependent] -= 1
            if in_degree[dependent] == 0:
                queue.append(dependent)

    if len(result) != len(steps):
        cycle = find_cycle(graph)
        if cycle:
            raise WorkflowCycleError(cycle)
        raise WorkflowCycleError(["desconocido"])

    return result


# ============================================================================
# EJECUCION DE PASOS
# ============================================================================


def execute_step(
    step: Step,
    output_callback: Optional[Callable[[str], None]] = None,
) -> int:
    """Ejecuta un paso del workflow.

    Args:
        step: Paso a ejecutar.
        output_callback: Función para manejar output (para testing o CLI).

    Returns:
        Código de retorno del comando.

    Raises:
        ExecutionError: Si el comando falla.
    """
    if not step.run:
        if output_callback:
            output_callback(f"  [ADVERTENCIA] El paso '{step.name}' no tiene comando")
        return 0

    if output_callback:
        output_callback(f"  $ {step.run}")

    # Streaming output para evitar problemas de memoria y deadlock
    process = subprocess.Popen(
        step.run,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,  # Unificar con stdout para evitar deadlock
        text=True,
        bufsize=1,
    )

    if process.stdout is not None:
        for line in process.stdout:
            line = line.rstrip("\n")
            if output_callback:
                output_callback(line)
            else:
                print(line)

    returncode = process.wait()

    if returncode != 0:
        raise ExecutionError(step.name, step.run, returncode)

    return returncode


def run_workflow(
    workflow: Workflow,
    output_callback: Optional[Callable[[str], None]] = None,
) -> None:
    """Ejecuta un workflow completo.

    Args:
        workflow: Instancia de Workflow.
        output_callback: Función para manejar output.

    Raises:
        WorkflowCycleError: Si hay un ciclo en las dependencias.
        DependencyNotFoundError: Si falta una dependencia.
        ExecutionError: Si un comando falla.
    """
    # Resolver orden de ejecución
    ordered_steps = resolve_order(workflow.steps)

    if output_callback:
        output_callback(f"Ejecutando {len(ordered_steps)} pasos...")

    # Ejecutar cada paso en orden
    for i, step in enumerate(ordered_steps, start=1):
        if output_callback:
            output_callback(f"[{i}/{len(ordered_steps)}] {step.name}")
        execute_step(step, output_callback)

    if output_callback:
        output_callback("=" * 50)
        output_callback("Workflow completado exitosamente!")
