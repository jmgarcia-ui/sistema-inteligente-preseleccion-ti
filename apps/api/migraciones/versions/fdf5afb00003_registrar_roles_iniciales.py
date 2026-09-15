"""registrar roles iniciales

Revision ID: fdf5afb00003
Revises: 4cea817ebca5
Create Date: 2026-09-14 15:48:12.175106

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fdf5afb00003'
down_revision: Union[str, Sequence[str], None] = '4cea817ebca5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    tabla_roles = sa.table(
        "roles",
        sa.column("nombre", sa.String()),
    )

    op.bulk_insert(
        tabla_roles,
        [
            {"nombre": "administrador"},
            {"nombre": "reclutador"}
        ]
    )


def downgrade() -> None:
    op.execute(
        sa.text(
            "DELETE FROM roles "
            "WHERE nombre IN ('administrador', 'reclutador')"
        )
    )
