# Code Review Rules

Reglas de codigo para el proyecto DevFlow. Estas reglas se aplican a cada commit.

## Python (CLI + Backend)

### Estilo de Codigo

- Usar **4 espacios** para indentacion (no tabs)
- **Snake case** para funciones y variables: `def get_workflow()`, `my_variable`
- **PascalCase** para clases: `class WorkflowRunner`
- **UPPER_CASE** para constantes: `MAX_RETRIES = 3`
- Maximo **88 caracteres** por linea (follow Black default)
- **Dunder methods** (`__init__`, `__str__`) van al principio de la clase
- Imports ordenados: stdlib -> third-party -> local

### Type Hints

- **Siempre** usar type hints en funciones publicas
- Usar `Union` en lugar de `|` para Python < 3.10
- No usar `Any` excepto en funciones genericas

```python
# Correcto
def get_workflow(workflow_id: str) -> dict:
    pass

# Incorrecto
def get_workflow(workflow_id):
    pass
```

### Docstrings

- Usar **Google style** para docstrings
- Primera linea: descripcion imperativa corta
- Args, Returns, Raises cuando sea necesario

```python
def process_workflow(workflow: dict) -> bool:
    """Procesa un workflow y ejecuta sus pasos.

    Args:
        workflow: Diccionario con la configuracion del workflow.

    Returns:
        True si el workflow se ejecuto correctamente.

    Raises:
        WorkflowError: Si el workflow es invalido.
    """
    pass
```

### Errores

- Usar excepciones personalizadas heredando de `Exception`
- Nombre de excepcion terminar en `Error`: `WorkflowValidationError`
- Capturar excepciones especificas, nunca `Exception` generico

---

## JavaScript/React (Frontend)

### Estilo de Codigo

- Usar **4 espacios** para indentacion
- **camelCase** para variables y funciones: `getWorkflow()`, `workflowData`
- **PascalCase** para componentes y clases: `WorkflowCard`, `DashboardView`
- **SCREAMING_SNAKE_CASE** para constantes: `MAX_RETRIES`
- Usar `const` sobre `let`, nunca `var`
- Punto y coma al final de statements (EXCEPTO en JSX/TSX - las etiquetas HTML dentro de return no necesitan punto y coma)

### Componentes React

- Usar **functional components** con arrow functions
- Props con type hints (TypeScript)
- Componentes pequenos (maximo 200 lineas)
- Un componente por archivo
- Nombrar componentes: `WorkflowCard.tsx`, `DashboardView.tsx`

```tsx
// Correcto
interface WorkflowCardProps {
    name: string;
    status: 'running' | 'completed' | 'failed';
    onClick: () => void;
}

export const WorkflowCard = ({ name, status, onClick }: WorkflowCardProps) => {
    return (
        <div onClick={onClick}>
            {name} - {status}
        </div>
    );
};
```

### State Management

- **Zustand** para estado global de la app
- **TanStack Query** para estado del servidor
- **Context API** solo para theme y auth

### Hooks

- Custom hooks: `useWorkflow()`, `useSocket()`
- dependency array siempre completa en `useEffect`

### Estilos

- **SCSS Modules** para estilos especificos de componente
- Classes en kebab-case: `.workflow-card`
- Variables CSS para colores y spacing
- No usar estilos inline excepto para dynamic values

---

## Git

### Conventional Commits

Usar conventional commits:

```
feat: add new workflow feature
fix: resolve validation error
docs: update README
refactor: simplify workflow parser
test: add tests for CLI commands
chore: update dependencies
```

### Pre-commit

- No hacer commit de codigo con errores de lint
- Verificar que los tests pasen antes de commitear
- Revisar los archivos staged antes de commitear

---

## Docker

- Usar imagenes slim para Python
- Usar Alpine para Node
- Multi-stage builds para produccion
- Exponer solo los puertos necesarios
- No guardar secrets en imagenes