let provinces = []; // Array global para almacenar los datos de las provincias.
let cities = [];    // Array global para almacenar los datos de las ciudades/municipios.

// Se ejecuta cuando el contenido del DOM ha sido completamente cargado.
window.addEventListener("DOMContentLoaded", async () => {
  // Realiza peticiones asíncronas para obtener los datos de 'province.json' y 'city.json'
  // de forma concurrente utilizando `Promise.all`.
  const [provinceRes, cityRes] = await Promise.all([
    fetch("/data/province.json"), // Petición para obtener datos de provincias.
    fetch("/data/city.json"),     // Petición para obtener datos de ciudades/municipios.
  ]);

  // Convierte las respuestas de las peticiones a formato JSON y las asigna a las variables globales.
  provinces = await provinceRes.json();
  cities = await cityRes.json();

  // Ordena el array de provincias alfabéticamente por su nombre (`nm`).
  provinces.sort((a, b) => a.nm.localeCompare(b.nm));

  // Obtiene las referencias a los elementos select del DOM para provincias y municipios.
  const provinceSelect = document.getElementById("provinceSelect");
  const municipalitySelect = document.getElementById("municipalitySelect");

  // Obtiene las referencias a los campos de input ocultos que almacenarán los IDs y nombres
  // de la provincia y el municipio seleccionados.
  const provinceIdInput = document.getElementById("provinceIdInput");
  const provinceNameInput = document.getElementById("provinceNameInput");
  const municipalityIdInput = document.getElementById("municipalityIdInput");
  const municipalityNameInput = document.getElementById("municipalityNameInput");

  // --- Rellenar el Select de Provincias Inicialmente ---

  // Itera sobre el array de provincias y crea una opción `<option>` para cada una.
  provinces.forEach((prov) => {
    const option = document.createElement("option"); // Crea un nuevo elemento <option>.
    option.value = prov.id;       // Establece el valor de la opción con el ID de la provincia.
    option.textContent = prov.nm; // Establece el texto visible de la opción con el nombre de la provincia.
    provinceSelect.appendChild(option); // Añade la opción al select de provincias.
  });

  // --- Manejo de Evento al Cambiar la Selección de Provincia ---

  // Añade un event listener al select de provincias para detectar cambios en la selección.
  provinceSelect.addEventListener("change", () => {
    // Obtiene el ID de la provincia seleccionada del valor del select.
    const selectedProvinceId = provinceSelect.value;
    // Busca el objeto completo de la provincia seleccionada en el array `provinces`.
    const selectedProvince = provinces.find((p) => String(p.id) === selectedProvinceId); // Compara como string.

    // Actualiza los campos ocultos de ID y nombre de provincia.
    // Utiliza el operador de encadenamiento opcional `?.` para evitar errores si `selectedProvince` es `undefined`.
    provinceIdInput.value = selectedProvince?.id || "";
    provinceNameInput.value = selectedProvince?.nm || "";

    // Limpia las opciones existentes en el select de municipios.
    municipalitySelect.innerHTML = '<option value="">-- Selecciona un municipio --</option>';
    // Limpia los campos ocultos de ID y nombre de municipio.
    municipalityIdInput.value = "";
    municipalityNameInput.value = "";

    // Si se ha seleccionado una provincia (es decir, `selectedProvinceId` no está vacío).
    if (selectedProvinceId) {
      // Filtra las ciudades/municipios para obtener solo las que pertenecen a la provincia seleccionada.
      // `city.id` suele comenzar con el ID de la provincia. Se asegura la comparación como string.
      const filteredCities = cities.filter((city) =>
        String(city.id).startsWith(selectedProvinceId)
      );
      // Ordena las ciudades/municipios filtrados alfabéticamente por su nombre.
      filteredCities.sort((a, b) => a.nm.localeCompare(b.nm));

      // Itera sobre las ciudades/municipios filtrados y crea una opción para cada uno.
      filteredCities.forEach((city) => {
        const option = document.createElement("option"); // Crea un nuevo elemento <option>.
        option.value = city.id;       // Establece el valor de la opción con el ID del municipio.
        option.textContent = city.nm; // Establece el texto visible de la opción con el nombre del municipio.
        municipalitySelect.appendChild(option); // Añade la opción al select de municipios.
      });
    }
  });

  // --- Manejo de Evento al Cambiar la Selección de Municipio ---

  // Añade un event listener al select de municipios para detectar cambios en la selección.
  municipalitySelect.addEventListener("change", () => {
    // Obtiene el ID del municipio seleccionado del valor del select.
    const selectedCityId = municipalitySelect.value;
    // Busca el objeto completo del municipio seleccionado en el array `cities`.
    const selectedCity = cities.find((c) => String(c.id) === selectedCityId); // Compara como string.

    // Actualiza los campos ocultos de ID y nombre de municipio.
    municipalityIdInput.value = selectedCity?.id || "";
    municipalityNameInput.value = selectedCity?.nm || "";
  });

  // Llamar a generateBedInputs inicialmente para generar los campos si ya hay un valor en 'rooms'
  // (Esto asume que `generateBedInputs` y su elemento 'rooms' están definidos en otro script
  // y que es deseable que se ejecute al cargar los datos de ubicación).
  // Si `generateBedInputs` está definida globalmente, se puede descomentar la siguiente línea:
  // if (typeof generateBedInputs === 'function') {
  //   generateBedInputs();
  // }
});