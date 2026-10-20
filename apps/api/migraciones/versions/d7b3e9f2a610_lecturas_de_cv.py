"""lecturas de cv

Revision ID: d7b3e9f2a610
Revises: c4a1d2e3f501
Create Date: 2026-10-19 21:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd7b3e9f2a610'
down_revision: Union[str, Sequence[str], None] = 'c4a1d2e3f501'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('lecturas_cv',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('id_postulacion', sa.Integer(), nullable=False),
        sa.Column('estado', sa.Enum('pendiente', 'leyendo', 'leido', 'error', name='estado_lectura_cv', native_enum=False, create_constraint=True), server_default=sa.text("'pendiente'"), nullable=False),
        sa.Column('modelo', sa.String(length=100), nullable=True),
        sa.Column('paginas_documento', sa.Integer(), nullable=True),
        sa.Column('paginas_leidas', sa.Integer(), nullable=True),
        sa.Column('contenido', sa.Text(), nullable=True),
        sa.Column('parrafos', sa.Text(), nullable=True),
        sa.Column('error', sa.String(length=500), nullable=True),
        sa.Column('creado_en', sa.DateTime(), server_default=sa.text('sysutcdatetime()'), nullable=False),
        sa.Column('actualizado_en', sa.DateTime(), server_default=sa.text('sysutcdatetime()'), nullable=False),
        sa.ForeignKeyConstraint(['id_postulacion'], ['postulaciones.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_lecturas_cv_id_postulacion'), 'lecturas_cv', ['id_postulacion'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_lecturas_cv_id_postulacion'), table_name='lecturas_cv')
    op.drop_table('lecturas_cv')
