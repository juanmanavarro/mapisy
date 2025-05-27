# Mapisy

Create maps easily, mark spots instantly. Mapisy allows you to effortlessly create and share maps with customized markers. Perfect for tracking locations, sharing points of interest, and visualizing data with minimal setup.

## Features

- **Easy Map Creation**: Simply visit a new path to create a map. If the path is available, your map is instantly ready.
- **Customization**: Set the center, zoom level, title, and description of your map.
- **Add Markers**: Use a simple API to add markers to your map in seconds.
- **Share and Explore**: Share your map with a simple link.

## Getting Started

1.  **Create Your Map**: Navigate to `/{your_map_id}`. If `your_map_id` is not taken, a new map will be created for you.
2.  **Customize**: Use the API to set the initial view (latitude, longitude, zoom) and add a title and description.
3.  **Add Markers**: Populate your map with markers using the API.
4.  **Share**: Share the link `/{your_map_id}` with anyone.

## API Documentation

Your API key is generated when you first create a map. You can find it by inspecting the `map.api_key` property in your browser's developer console when viewing your map, or by checking the network response when the map loads.

Replace `{map_id}` with the ID of your map and `{api_key}` with your generated API key in the examples below.

### Create a Map

To create a map, simply visit a new, unique path in your browser:

`GET /{map_id}`

If the `map_id` is available, a new map will be created. You will also receive an `api_key` for this map.

### Update Map Configuration

Update the settings of an existing map.

`PUT /api/maps/{map_id}`

**Authorization**: `Bearer {api_key}`
**Content-Type**: `application/json`

**Body**:

```json
{
    "latitude": {latitude},
    "longitude": {longitude},
    "zoom": {zoom},
    "title": "{title}",
    "description": "{description}"
}
```

-   `latitude` (optional): New latitude for the map center.
-   `longitude` (optional): New longitude for the map center.
-   `zoom` (optional): New zoom level for the map.
-   `title` (optional): New title for the map.
-   `description` (optional): New description for the map.

**Example Request**:

```bash
curl -X PUT https://yourdomain.com/api/maps/my-special-map \
    -H "Authorization: Bearer your_api_key_here" \
    -H "Content-Type: application/json" \
    -d '{
        "latitude": 40.7128,
        "longitude": -74.0060,
        "zoom": 12,
        "title": "My Awesome Map Title",
        "description": "A description of my awesome map."
    }'
```

### Add a Marker to a Map

Add a new marker to a specific map.

`POST /api/maps/{map_id}/markers`

**Authorization**: `Bearer {api_key}`
**Content-Type**: `application/json`

**Body**:

```json
{
    "latitude": {latitude},
    "longitude": {longitude},
    "title": "{title}"
}
```

-   `latitude` (required): Latitude of the marker.
-   `longitude` (required): Longitude of the marker.
-   `title` (optional): Title/label for the marker.

**Example Request**:

```bash
curl -X POST https://yourdomain.com/api/maps/my-special-map/markers \
    -H "Authorization: Bearer your_api_key_here" \
    -H "Content-Type: application/json" \
    -d '{
        "latitude": 34.0522,
        "longitude": -118.2437,
        "title": "Los Angeles"
    }'
```

### Delete a Marker from a Map

Remove a specific marker from a map.

`DELETE /api/maps/{map_id}/markers/{marker_id}`

**Authorization**: `Bearer {api_key}`
**Content-Type**: `application/json`

-   `marker_id` (required): The ID of the marker to delete.

**Example Request**:

```bash
curl -X DELETE https://yourdomain.com/api/maps/my-special-map/markers/marker_id_to_delete \
    -H "Authorization: Bearer your_api_key_here" \
    -H "Content-Type: application/json"
```

## More Functionality

More features and API endpoints are coming soon!

---

&copy; 2024 Juanma Navarro. All rights reserved.
