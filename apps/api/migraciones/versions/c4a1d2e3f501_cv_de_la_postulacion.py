"""cv de la postulacion

Revision ID: c4a1d2e3f501
Revises: 987101b761e7
Create Date: 2026-10-19 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4a1d2e3f501'
down_revision: Union[str, Sequence[str], None] = '987101b761e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    #nullable: las postulaciones que ya existen no tienen CV
    op.add_column('postulaciones', sa.Column('cv_nombre', sa.String(length=255), nullable=True))
    op.add_column('postulaciones', sa.Column('cv_clave', sa.String(length=500), nullable=True))
    op.add_column('postulaciones', sa.Column('cv_tamano', sa.Integer(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('postulaciones', 'cv_tamano')
    op.drop_column('postulaciones', 'cv_clave')
    op.drop_column('postulaciones', 'cv_nombre')
