let provinces = []; // Array global para almacenar los datos de las provincias.
let cities = [];    // Array global para almacenar los datos de las ciudades/municipios.

// Se ejecuta cuando el contenido del DOM ha sido completamente cargado.
window.addEventListener("DOMContentLoaded", async () => {
    console.log("=== municipiAndProvince.js iniciado ===");
    
    // Realiza peticiones asíncronas para obtener los datos de 'province.json' y 'city.json'
    const [provinceRes, cityRes] = await Promise.all([
        fetch("/data/province.json"),
        fetch("/data/city.json"),
    ]);

    provinces = await provinceRes.json();
    cities = await cityRes.json();
    
    console.log("Provincias cargadas:", provinces.length);
    console.log("Ciudades cargadas:", cities.length);

    // Ordena el array de provincias alfabéticamente por su nombre (`nm`).
    provinces.sort((a, b) => a.nm.localeCompare(b.nm));

    const provinceSelect = document.getElementById("provinceSelect");
    const municipalitySelect = document.getElementById("municipalitySelect");

    if (!provinceSelect || !municipalitySelect) {
        console.error("No se encontraron los elementos select");
        return;
    }

    const provinceIdInput = document.getElementById("provinceIdInput");
    const provinceNameInput = document.getElementById("provinceNameInput");
    const municipalityIdInput = document.getElementById("municipalityIdInput");
    const municipalityNameInput = document.getElementById("municipalityNameInput");

    // Rellenar provincias
    provinceSelect.innerHTML = '<option value="">-- Selecciona una provincia --</option>';
    provinces.forEach((prov) => {
        const option = document.createElement("option");
        option.value = prov.id;
        option.textContent = prov.nm;
        provinceSelect.appendChild(option);
    });

    // Obtener valores preseleccionados
    const preselectedProvinceId = provinceSelect.dataset.selected;
    const preselectedMunicipalityId = municipalitySelect.dataset.selected;

    console.log("Provincia preseleccionada:", preselectedProvinceId, typeof preselectedProvinceId);
    console.log("Municipio preseleccionado:", preselectedMunicipalityId, typeof preselectedMunicipalityId);

    // Si hay provincia preseleccionada, establecerla
    if (preselectedProvinceId && preselectedProvinceId !== '') {
        // Convertir a string y agregar cero si es necesario para que coincida con el formato del JSON
        let provinceIdToFind = String(preselectedProvinceId);
        if (provinceIdToFind.length === 1) {
            provinceIdToFind = '0' + provinceIdToFind;
        }
        
        console.log("Buscando provincia con ID:", provinceIdToFind);
        
        // Buscar la provincia que coincida
        const matchingProvince = provinces.find(p => String(p.id) === provinceIdToFind);
        console.log("Provincia encontrada:", matchingProvince);
        
        if (matchingProvince) {
            provinceSelect.value = matchingProvince.id;
            provinceIdInput.value = preselectedProvinceId; // Guardar el ID original
            provinceNameInput.value = matchingProvince.nm;
            console.log("Provincia establecida:", matchingProvince.id, matchingProvince.nm);
            
            // Cargar municipios de esa provincia
            loadMunicipalities(matchingProvince.id, preselectedMunicipalityId);
        } else {
            console.error("No se encontró provincia con ID:", provinceIdToFind);
        }
    }

    // Evento para cambio de provincia
    provinceSelect.addEventListener("change", () => {
        const selectedProvinceId = provinceSelect.value;
        const selectedProvince = provinces.find(p => String(p.id) === selectedProvinceId);

        if (selectedProvince) {
            // Convertir el ID de vuelta al formato de la base de datos (sin ceros a la izquierda)
            const dbProvinceId = String(parseInt(selectedProvince.id, 10));
            provinceIdInput.value = dbProvinceId;
            provinceNameInput.value = selectedProvince.nm;
        } else {
            provinceIdInput.value = "";
            provinceNameInput.value = "";
        }

        // Limpiar municipios
        municipalitySelect.innerHTML = '<option value="">-- Selecciona un municipio --</option>';
        municipalityIdInput.value = "";
        municipalityNameInput.value = "";

        if (selectedProvinceId) {
            loadMunicipalities(selectedProvinceId);
        }
    });

    // Evento para cambio de municipio
    municipalitySelect.addEventListener("change", () => {
        const selectedCityId = municipalitySelect.value;
        const selectedCity = cities.find(c => String(c.id) === selectedCityId);

        if (selectedCity) {
            // Convertir el ID de vuelta al formato de la base de datos (sin ceros a la izquierda)
            const dbCityId = String(parseInt(selectedCity.id, 10));
            municipalityIdInput.value = dbCityId;
            municipalityNameInput.value = selectedCity.nm;
        } else {
            municipalityIdInput.value = "";
            municipalityNameInput.value = "";
        }
    });

    // Función para cargar municipios
    function loadMunicipalities(provinceId, preselectedMunicipalityId = null) {
        console.log("=== CARGANDO MUNICIPIOS ===");
        console.log("Provincia ID:", provinceId, typeof provinceId);
        console.log("Municipio preseleccionado:", preselectedMunicipalityId, typeof preselectedMunicipalityId);
        
        municipalitySelect.innerHTML = '<option value="">-- Selecciona un municipio --</option>';
        
        const provinceIdStr = String(provinceId);
        const filteredCities = cities.filter(city => String(city.id).startsWith(provinceIdStr));
        console.log("Municipios encontrados para provincia", provinceIdStr + ":", filteredCities.length);
        
        if (filteredCities.length > 0) {
            console.log("Primeros 3 municipios:", filteredCities.slice(0, 3).map(c => ({ id: c.id, nm: c.nm })));
        }
        
        filteredCities.sort((a, b) => a.nm.localeCompare(b.nm));

        filteredCities.forEach(city => {
            const option = document.createElement("option");
            option.value = city.id;
            option.textContent = city.nm;
            municipalitySelect.appendChild(option);
        });

        // Si hay municipio preseleccionado, establecerlo
        if (preselectedMunicipalityId && preselectedMunicipalityId !== '') {
            // Convertir a string y agregar ceros si es necesario para que coincida con el formato del JSON
            let municipalityIdToFind = String(preselectedMunicipalityId);
            if (municipalityIdToFind.length === 4) {
                municipalityIdToFind = '0' + municipalityIdToFind;
            }
            
            console.log("Buscando municipio con ID:", municipalityIdToFind);
            
            const matchingCity = cities.find(c => String(c.id) === municipalityIdToFind);
            console.log("Municipio encontrado:", matchingCity);
            
            if (matchingCity) {
                municipalitySelect.value = matchingCity.id;
                municipalityIdInput.value = preselectedMunicipalityId; // Guardar el ID original
                municipalityNameInput.value = matchingCity.nm;
                console.log("Municipio establecido:", matchingCity.id, matchingCity.nm);
            } else {
                console.error("No se encontró municipio con ID:", municipalityIdToFind);
            }
        }
    }
});