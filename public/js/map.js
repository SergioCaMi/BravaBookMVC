document.addEventListener('DOMContentLoaded', async () => {
  // Inicializa el mapa y lo centra en España
  const map = L.map('map').setView([40.4168, -3.7038], 6);
  
  // Añade una capa de mapa de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  
  // Convierte los datos de los apartamentos a JSON
  const apartments = window.apartmentsData || [];
  
  // Obtiene todos los elementos de la lista de apartamentos
  const apartmentItems = document.querySelectorAll('.apartment-item');
  
  // Array para almacenar los marcadores del mapa
  const markers = [];
  
  // Función para geocodificar la dirección de un apartamento
  async function geocodeApartment(apartment) {
    const address = `${apartment.location.municipality.nm}, ${apartment.location.province.nm}, España`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    
    try {
      // Realiza una solicitud a Nominatim para obtener las coordenadas
      const response = await fetch(url);
      const data = await response.json();
      
      // Si se obtienen datos, devuelve las coordenadas
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
      // Obtiene las coordenadas del apartamento
      const coords = await geocodeApartment(apartment);
      
      // Si se obtienen coordenadas, coloca un marcador en el mapa
      if (coords) {
        const marker = L.marker([coords.lat, coords.lon]).addTo(map);
        
        // Añade un popup al marcador con información del apartamento
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
        
        // Guarda el marcador en el array de marcadores
        markers.push({ id: apartment._id, marker });
      }
      
      // Espera un segundo para evitar bloqueos por Nominatim
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Añade un evento de clic a cada elemento de la lista de apartamentos
  apartmentItems.forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      
      // Remueve la clase 'selected' de todos los elementos
      apartmentItems.forEach(i => i.classList.remove('selected'));
      
      // Añade la clase 'selected' al elemento clickeado
      item.classList.add('selected');
      
      // Encuentra el marcador correspondiente al apartamento clickeado
      const markerObj = markers.find(m => m.id === id);
      
      // Si se encuentra el marcador, abre su popup y centra el mapa en él
      if (markerObj) {
        markerObj.marker.openPopup();
        map.setView(markerObj.marker.getLatLng(), 14);
      }
    });
  });
  
  // Llama a la función para colocar los marcadores en el mapa
  await placeMarkers();
});
