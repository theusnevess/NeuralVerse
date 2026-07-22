"""Create the canonical Stage 16 schema baseline.

The historical migration directory remains immutable and is intentionally not
reachable from this canonical script location.  The ORM metadata is the
single declarative schema contract for a clean install; legacy databases must
first pass the explicit reconciliation bridge before being stamped here.
"""

from collections.abc import Sequence

from alembic import op

# Import all model modules so metadata is complete when Alembic invokes this
# revision directly, including in offline SQL generation.
import neuralverse_backend.persistence.models  # noqa: F401,E402
from neuralverse_backend.persistence.metadata import metadata

revision: str = "c00000000001"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # The canonical ORM includes the BIP-M5 embedding column.  A clean
    # PostgreSQL install must provision its type before metadata.create_all.
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    metadata.create_all(bind=op.get_bind(), checkfirst=True)


def downgrade() -> None:
    metadata.drop_all(bind=op.get_bind(), checkfirst=True)
