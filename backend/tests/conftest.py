import pytest
from app.services.cost_service.area.area_analysis.area_analysis_service import AreaAnalysisService

@pytest.fixture
def area_service():
    return AreaAnalysisService()