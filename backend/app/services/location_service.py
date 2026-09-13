import math

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees) using Haversine formula.
    Returns distance in kilometers.
    """
    # Convert decimal degrees to radians
    r_lat1, r_lon1, r_lat2, r_lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlat = r_lat2 - r_lat1
    dlon = r_lon2 - r_lon1
    a = math.sin(dlat / 2.0) ** 2 + math.cos(r_lat1) * math.cos(r_lat2) * math.sin(dlon / 2.0) ** 2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of earth in kilometers
    r = 6371.0
    return round(c * r, 2)

def sort_responders_by_distance(lat: float, lon: float, responders: list) -> list:
    """
    Takes a target lat/lon and a list of responder objects/dicts with latitude & longitude.
    Returns a sorted list of tuples (responder, distance_km).
    """
    results = []
    for resp in responders:
        # Handle dict or ORM object
        r_lat = getattr(resp, "latitude", None) if hasattr(resp, "latitude") else resp.get("latitude")
        r_lon = getattr(resp, "longitude", None) if hasattr(resp, "longitude") else resp.get("longitude")
        
        if r_lat is not None and r_lon is not None:
            dist = haversine_distance(lat, lon, r_lat, r_lon)
            results.append((resp, dist))
    
    # Sort by distance ascending
    results.sort(key=lambda item: item[1])
    return results
