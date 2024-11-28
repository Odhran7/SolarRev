import pytest
from app.services.cost_service.area.area_analysis.area_analysis_service import AreaAnalysisService, Coordinate

@pytest.mark.asyncio
async def test_area_calculation():
    service = AreaAnalysisService()
    test_coordinates = [
        Coordinate(x=-6.260310, y=53.349805),
        Coordinate(x=-6.260310, y=53.339805),
        Coordinate(x=-6.250310, y=53.339805),
        Coordinate(x=-6.250310, y=53.349805),
    ]
    result = await service.analyse_area(test_coordinates)
    assert result is not None
    assert "total_area_sqm" in result
    assert "usable_area_sqm" in result
    assert "terrain_analysis" in result
    assert result["total_area_sqm"] > 0
    print(f"\nTest result: {result}")

@pytest.mark.asyncio
async def test_area_calculation_direct():
    service = AreaAnalysisService()
    test_coordinates = [
        Coordinate(x=-6.260310, y=53.349805),
        Coordinate(x=-6.260310, y=53.339805),
        Coordinate(x=-6.250310, y=53.339805),
        Coordinate(x=-6.250310, y=53.349805),
    ]
    
    area = await service._calculate_area(test_coordinates)
    
    assert area > 0
    print(f"\nCalculated area: {area} square meters")