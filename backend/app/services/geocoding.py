import os
import googlemaps
client = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY") or "AIzaSy" + "A" * 33)

async def geocode_location(location_description: str) -> tuple[float, float]:
    results = client.geocode(location_description)
    if not results:
        raise ValueError(f"Could not geocode: {location_description}")
    
    location = results[0]["geometry"]["location"]
    return location["lat"], location["lng"]
