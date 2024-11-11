export function connectSocket(mapId) {
  socket = io();

  socket.on('marker:created', function({ marker }) {
      if (marker.map_id !== mapId) return;

      L.marker([parseFloat(marker.latitude), parseFloat(marker.longitude)], {
          id: marker._id.toString()
      })
      .bindPopup(marker.title || marker._id)
      .on('click', function(e) {
          this.openPopup(); // Muestra el popup al clicar
          navigator.clipboard.writeText(marker._id.toString());
      })
      .addTo(map)
      .openPopup(); // Abre el popup por defecto

      markers.push(marker);
  });

  socket.on('marker:deleted', function({ marker }) {
      if (marker.map_id !== mapId) return;

      map.eachLayer(function(layer) {
          if (layer instanceof L.Marker && layer.options.id === marker._id.toString()) {
              map.removeLayer(layer);
          }
      });
  });

  socket.on('map:updated', function({ map: currentMap }) {
      if (currentMap.id !== mapId) return;

      map.setView([currentMap.latitude, currentMap.longitude], currentMap.zoom);
      document.getElementById('map-title').textContent = currentMap.title;
      document.getElementById('map-description').textContent = currentMap.description;
      document.getElementById('map-description').style.display = currentMap.description ? 'block' : 'none';
  });

  socket.on('connect_error', (error) => {
      console.error('Error de conexión:', error);
  });
}
