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

    // --- Lógica de precarga para el formulario de EDICIÓN ---
    // Lee los IDs de provincia y municipio preseleccionados de los atributos data-selected en los <select>
    const preselectedProvinceId = provinceSelect.dataset.selected;
    const preselectedMunicipalityId = municipalitySelect.dataset.selected;

    if (preselectedProvinceId) {
        // Establece el valor del select de provincia al ID preseleccionado
        provinceSelect.value = preselectedProvinceId;

        // Dispara manualmente el evento 'change' en el select de provincia.
        // Esto fuerza la ejecución del manejador de eventos `provinceSelect.addEventListener("change", ...)`
        // que limpiará el select de municipios y lo rellenará con los municipios de la provincia seleccionada.
        // Es crucial para que la lista de municipios se cargue.
        provinceSelect.dispatchEvent(new Event('change'));

        // Después de que los municipios de la provincia seleccionada se hayan cargado,
        // establece el municipio preseleccionado. Usamos un setTimeout para asegurar
        // que el DOM tenga tiempo de actualizarse después del `dispatchEvent`.
        setTimeout(() => {
            if (preselectedMunicipalityId) {
                municipalitySelect.value = preselectedMunicipalityId;

                // También actualiza los campos ocultos del municipio aquí para asegurarnos.
                const selectedCity = cities.find((c) => String(c.id) === preselectedMunicipalityId);
                municipalityIdInput.value = selectedCity?.id || "";
                municipalityNameInput.value = selectedCity?.nm || "";
            }
        }, 0); // Un timeout de 0ms permite que la ejecución se posponga al siguiente ciclo del event loop.
    }

    // --- Manejo de Evento al Cambiar la Selección de Provincia (original) ---
    provinceSelect.addEventListener("change", () => {
        const selectedProvinceId = provinceSelect.value;
        const selectedProvince = provinces.find((p) => String(p.id) === selectedProvinceId);

        provinceIdInput.value = selectedProvince?.id || "";
        provinceNameInput.value = selectedProvince?.nm || "";

        municipalitySelect.innerHTML = '<option value="">-- Selecciona un municipio --</option>';
        municipalityIdInput.value = "";
        municipalityNameInput.value = "";

        if (selectedProvinceId) {
            const filteredCities = cities.filter((city) =>
                String(city.id).startsWith(selectedProvinceId)
            );
            filteredCities.sort((a, b) => a.nm.localeCompare(b.nm));

            filteredCities.forEach((city) => {
                const option = document.createElement("option");
                option.value = city.id;
                option.textContent = city.nm;
                municipalitySelect.appendChild(option);
            });
        }
    });

    // --- Manejo de Evento al Cambiar la Selección de Municipio (original) ---
    municipalitySelect.addEventListener("change", () => {
        const selectedCityId = municipalitySelect.value;
        const selectedCity = cities.find((c) => String(c.id) === selectedCityId);

        municipalityIdInput.value = selectedCity?.id || "";
        municipalityNameInput.value = selectedCity?.nm || "";
    });

    // La lógica de `generateBedInputs` si es global y debe ejecutarse.
    // if (typeof generateBedInputs === 'function') {
    //   generateBedInputs();
    // }
});