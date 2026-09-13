import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.services.location_service import haversine_distance, sort_responders_by_distance

def test_haversine_distance_calculation():
    # Distance between Nagpur (21.1458, 79.0882) and KM 528 (21.2300, 79.1500)
    dist = haversine_distance(21.1458, 79.0882, 21.2300, 79.1500)
    assert isinstance(dist, float)
    assert 10.0 < dist < 15.0  # Approx ~11.2 km

def test_sort_responders_by_distance():
    lat, lon = 21.1458, 79.0882
    responders = [
        {"name": "Far Away Unit", "latitude": 22.0000, "longitude": 80.0000},
        {"name": "Close Unit", "latitude": 21.1500, "longitude": 79.0900},
    ]
    sorted_resps = sort_responders_by_distance(lat, lon, responders)
    assert len(sorted_resps) == 2
    assert sorted_resps[0][0]["name"] == "Close Unit"
    assert sorted_resps[0][1] < sorted_resps[1][1]
