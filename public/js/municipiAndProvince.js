let provinces = []; 
let cities = [];    

window.addEventListener("DOMContentLoaded", async () => {
    console.log("=== municipiAndProvince.js iniciado ===");
    
    const [provinceRes, cityRes] = await Promise.all([
        fetch("/data/province.json"),
        fetch("/data/city.json"),
    ]);

    provinces = await provinceRes.json();
    cities = await cityRes.json();
    
    console.log("Provincias cargadas:", provinces.length);
    console.log("Ciudades cargadas:", cities.length);

    provinces.sort((a, b) => a.nm.localeCompare(b.nm));

    const provinceSelect = document.getElementById("provinceSelect");
    const municipalitySelect = document.getElementById("municipalitySelect");
    const provinceSelectMobile = document.getElementById("provinceSelectMobile");
    const municipalitySelectMobile = document.getElementById("municipalitySelectMobile");

    if (!provinceSelect && !provinceSelectMobile) {
        console.error("No se encontraron los elementos select de provincia");
        return;
    }

    const provinceIdInput = document.getElementById("provinceIdInput");
    const provinceNameInput = document.getElementById("provinceNameInput");
    const municipalityIdInput = document.getElementById("municipalityIdInput");
    const municipalityNameInput = document.getElementById("municipalityNameInput");

    const provinceIdInputMobile = document.getElementById("provinceIdInputMobile");
    const provinceNameInputMobile = document.getElementById("provinceNameInputMobile");
    const municipalityIdInputMobile = document.getElementById("municipalityIdInputMobile");
    const municipalityNameInputMobile = document.getElementById("municipalityNameInputMobile");

    // Función para rellenar provincias
    function fillProvinces(selectElement) {
        if (!selectElement) return;
        
        selectElement.innerHTML = '<option value="">-- Selecciona una provincia --</option>';
        provinces.forEach((prov) => {
            const option = document.createElement("option");
            option.value = prov.id;
            option.textContent = prov.nm;
            selectElement.appendChild(option);
        });
    }

    fillProvinces(provinceSelect);
    fillProvinces(provinceSelectMobile);

    const preselectedProvinceId = provinceSelect ? provinceSelect.dataset.selected : null;
    const preselectedMunicipalityId = municipalitySelect ? municipalitySelect.dataset.selected : null;

    console.log("Provincia preseleccionada:", preselectedProvinceId, typeof preselectedProvinceId);
    console.log("Municipio preseleccionado:", preselectedMunicipalityId, typeof preselectedMunicipalityId);

    // Si hay provincia preseleccionada, establecerla 
    if (preselectedProvinceId && preselectedProvinceId !== '' && provinceSelect) {
        // Convertir a string y agregar cero si es necesario para que coincida con el formato del JSON 01 en lugar de 1. Daba errores al cargar en editApartment.ejs
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
            if (provinceIdInput) provinceIdInput.value = preselectedProvinceId; // Guardar el ID original
            if (provinceNameInput) provinceNameInput.value = matchingProvince.nm;
            console.log("Provincia establecida:", matchingProvince.id, matchingProvince.nm);
            
            // Cargar municipios de esa provincia
            if (municipalitySelect) {
                loadMunicipalities(matchingProvince.id, municipalitySelect, municipalityIdInput, municipalityNameInput, preselectedMunicipalityId);
            }
        } else {
            console.error("No se encontró provincia con ID:", provinceIdToFind);
        }
    }

    // Función para agregar event listeners a un select de provincia
    function addProvinceListener(selectElement, municipalitySelectElement, provinceIdInputElement, provinceNameInputElement, municipalityIdInputElement, municipalityNameInputElement) {
        if (!selectElement) return;
        
        selectElement.addEventListener("change", () => {
            const selectedProvinceId = selectElement.value;
            const selectedProvince = provinces.find(p => String(p.id) === selectedProvinceId);

            if (selectedProvince) {
                // Convertir el ID de vuelta al formato de la base de datos (sin ceros a la izquierda)
                const dbProvinceId = String(parseInt(selectedProvince.id, 10));
                if (provinceIdInputElement) provinceIdInputElement.value = dbProvinceId;
                if (provinceNameInputElement) provinceNameInputElement.value = selectedProvince.nm;
            } else {
                if (provinceIdInputElement) provinceIdInputElement.value = "";
                if (provinceNameInputElement) provinceNameInputElement.value = "";
            }

            // Limpiar municipios
            if (municipalitySelectElement) {
                municipalitySelectElement.innerHTML = '<option value="">-- Selecciona un municipio --</option>';
            }
            if (municipalityIdInputElement) municipalityIdInputElement.value = "";
            if (municipalityNameInputElement) municipalityNameInputElement.value = "";

            if (selectedProvinceId && municipalitySelectElement) {
                loadMunicipalities(selectedProvinceId, municipalitySelectElement, municipalityIdInputElement, municipalityNameInputElement);
            }
        });
    }

    // Función para agregar event listeners a un select de municipio
    function addMunicipalityListener(selectElement, municipalityIdInputElement, municipalityNameInputElement) {
        if (!selectElement) return;
        
        selectElement.addEventListener("change", () => {
            const selectedCityId = selectElement.value;
            const selectedCity = cities.find(c => String(c.id) === selectedCityId);

            if (selectedCity) {
                // Convertir el ID de vuelta al formato de la base de datos (sin ceros a la izquierda)
                const dbCityId = String(parseInt(selectedCity.id, 10));
                if (municipalityIdInputElement) municipalityIdInputElement.value = dbCityId;
                if (municipalityNameInputElement) municipalityNameInputElement.value = selectedCity.nm;
            } else {
                if (municipalityIdInputElement) municipalityIdInputElement.value = "";
                if (municipalityNameInputElement) municipalityNameInputElement.value = "";
            }
        });
    }

    addProvinceListener(provinceSelect, municipalitySelect, provinceIdInput, provinceNameInput, municipalityIdInput, municipalityNameInput);
    addMunicipalityListener(municipalitySelect, municipalityIdInput, municipalityNameInput);

    addProvinceListener(provinceSelectMobile, municipalitySelectMobile, provinceIdInputMobile, provinceNameInputMobile, municipalityIdInputMobile, municipalityNameInputMobile);
    addMunicipalityListener(municipalitySelectMobile, municipalityIdInputMobile, municipalityNameInputMobile);

    function loadMunicipalities(provinceId, municipalitySelectElement, municipalityIdInputElement, municipalityNameInputElement, preselectedMunicipalityId = null) {
        console.log("=== CARGANDO MUNICIPIOS ===");
        console.log("Provincia ID:", provinceId, typeof provinceId);
        console.log("Municipio preseleccionado:", preselectedMunicipalityId, typeof preselectedMunicipalityId);
        
        if (!municipalitySelectElement) return;
        
        municipalitySelectElement.innerHTML = '<option value="">-- Selecciona un municipio --</option>';
        
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
            municipalitySelectElement.appendChild(option);
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
                municipalitySelectElement.value = matchingCity.id;
                if (municipalityIdInputElement) municipalityIdInputElement.value = preselectedMunicipalityId; 
                if (municipalityNameInputElement) municipalityNameInputElement.value = matchingCity.nm;
                console.log("Municipio establecido:", matchingCity.id, matchingCity.nm);
            } else {
                console.error("No se encontró municipio con ID:", municipalityIdToFind);
            }
        }
    }
});