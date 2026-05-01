"""
Graph UI Data Provider.
Responsible for loading, validating, and serving graph fixtures.
"""

from pathlib import Path
try:
    from .contracts.graph_data import GraphData
except ImportError:
    from contracts.graph_data import GraphData


class GraphProvider:
    """Provides validated graph data from fixtures or external sources."""

    def __init__(self, fixtures_dir: str | Path | None = None):
        if fixtures_dir is None:
            # Default to the internal desk/fixtures directory
            self.fixtures_dir = Path(__file__).parent.parent / "desk" / "fixtures"
        else:
            self.fixtures_dir = Path(fixtures_dir)

    def load_fixture(self, name: str) -> GraphData:
        """Load and validate a JSON fixture by name (without extension)."""
        path = self.fixtures_dir / f"{name}.json"
        if not path.exists():
            raise FileNotFoundError(f"Fixture not found at {path}")
            
        return GraphData.model_validate_json(path.read_text())

    def get_ecosystem_slice(self) -> GraphData:
        """Retrieve the canonical ecosystem core slice."""
        return self.load_fixture("ecosystem_slice")
