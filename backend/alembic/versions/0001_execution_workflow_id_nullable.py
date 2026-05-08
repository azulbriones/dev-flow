"""Make executions.workflow_id nullable.

Revision ID: 0001_execution_workflow_id_nullable
Revises:
Create Date: 2026-05-02 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


class MigrationSafetyError(Exception):
    """Raised when a downgrade would drop required execution data."""


# revision identifiers, used by Alembic.
revision = "0001_execution_workflow_id_nullable"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Allow ad hoc executions by making workflow_id nullable."""
    with op.batch_alter_table("executions") as batch_op:
        batch_op.alter_column(
            "workflow_id",
            existing_type=sa.Integer(),
            nullable=True,
        )

    op.execute(
        sa.text("UPDATE executions SET workflow_id = NULL WHERE workflow_id = 0")
    )


def downgrade() -> None:
    """Restore the non-null workflow_id constraint when safe."""
    conn = op.get_bind()
    null_count = conn.execute(
        sa.text("SELECT COUNT(*) FROM executions WHERE workflow_id IS NULL")
    ).scalar_one()
    if null_count:
        raise MigrationSafetyError(
            "Cannot downgrade: executions with NULL workflow_id exist"
        )

    with op.batch_alter_table("executions") as batch_op:
        batch_op.alter_column(
            "workflow_id",
            existing_type=sa.Integer(),
            nullable=False,
        )
