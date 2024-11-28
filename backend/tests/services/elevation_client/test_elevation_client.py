import pytest
import asyncio
from app.services.elevation_client.elevation_client import ElevationClient

@pytest.mark.asyncio
async def test_single_elevation():
    """Test single point elevation lookup"""
    async with ElevationClient() as client:
        coordinates = [(53.349805, -6.260310)]  # Dublin
        points = await client.get_elevations(coordinates)
        
        print("\nTest Results - Single Point:")
        print(f"Location: Dublin")
        print(f"Elevation: {points[0].elevation}m")
        
        assert len(points) == 1
        assert points[0].elevation is not None

@pytest.mark.asyncio
async def test_batch_processing():
    """Test batch processing with rate limit handling"""
    async with ElevationClient() as client:
        coordinates = [
            (53.349805, -6.260310),
            (53.339805, -6.260310),
            (53.339805, -6.250310),
        ]
        
        points = await client.get_elevations(coordinates, batch_size=2)
        
        print("\nTest Results - Batch Processing:")
        for point in points:
            print(f"Elevation: {point.elevation}m")
        
        assert len(points) == len(coordinates)
        assert all(point.elevation is not None for point in points)

@pytest.mark.asyncio
async def test_area_elevation_stats():
    """Test area statistics with smaller batches"""
    async with ElevationClient() as client:
        coordinates = [
            (53.349805, -6.260310),
            (53.339805, -6.260310),
            (53.339805, -6.250310),
            (53.349805, -6.250310)
        ]
        
        stats = await client.get_area_elevation_stats(coordinates)
        
        print("\nTest Results - Area Statistics:")
        for key, value in stats.items():
            print(f"{key}: {value}")
        
        assert "points_requested" in stats
        assert "points_received" in stats
        if "error" not in stats:
            assert "min_elevation" in stats
            assert "max_elevation" in stats
            assert stats["points_received"] > 0

@pytest.mark.asyncio
async def test_error_handling():
    """Test error handling with invalid coordinates"""
    async with ElevationClient() as client:
        invalid_coordinates = [(91.0, 181.0)] 
        
        points = await client.get_elevations(invalid_coordinates)
        
        print("\nTest Results - Error Handling:")
        print(f"Response for invalid coordinates: {points}")
        
        assert len(points) == 0 