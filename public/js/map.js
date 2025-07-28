document.addEventListener('DOMContentLoaded', async () => {
  const map = L.map('map').setView([40.4168, -3.7038], 6);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  
  const apartments = window.apartmentsData || [];
  
  const apartmentItems = document.querySelectorAll('.apartment-item');
  
  const markers = [];
  
  // Función para geocodificar la dirección de un apartamento
  async function geocodeApartment(apartment) {
    const address = `${apartment.location.municipality.nm}, ${apartment.location.province.nm}, España`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
    } catch (err) {
      console.error(`Error geocoding: ${address}`, err);
    }
    return null;
  }
  
  // Función para colocar los marcadores en el mapa
  async function placeMarkers() {
    for (const apartment of apartments) {
      const coords = await geocodeApartment(apartment);
      
      if (coords) {
        const marker = L.marker([coords.lat, coords.lon]).addTo(map);
        
        marker.bindPopup(`
          <div style="text-align: center;">
            <b>${apartment.title}</b><br>
            <small class="text-muted">${apartment.location.municipality.nm}, ${apartment.location.province.nm}</small><br>
            <a href="/apartments/${apartment._id}" class="btn btn-primary btn-sm mt-2" style="
              background: linear-gradient(135deg, #0d6efd, #6610f2);
              border: none;
              border-radius: 20px;
              padding: 0.5rem 1rem;
              text-decoration: none;
              color: white;
              font-weight: 500;
              display: inline-block;
              margin-top: 0.5rem;
              transition: all 0.3s ease;
            ">Ver detalles</a>
          </div>
        `);
        
        markers.push({ id: apartment._id, marker });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  apartmentItems.forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      
      apartmentItems.forEach(i => i.classList.remove('selected'));
      
      item.classList.add('selected');
      
      const markerObj = markers.find(m => m.id === id);
      
      if (markerObj) {
        markerObj.marker.openPopup();
        map.setView(markerObj.marker.getLatLng(), 14);
      }
    });
  });
  
  await placeMarkers();
});
