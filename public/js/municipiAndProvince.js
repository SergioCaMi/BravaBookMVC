let provinces = [];
let cities = [];

window.addEventListener("DOMContentLoaded", async () => {
  const [provinceRes, cityRes] = await Promise.all([
    fetch("/data/province.json"),
    fetch("/data/city.json"),
  ]);

  provinces = await provinceRes.json();
  cities = await cityRes.json();

  provinces.sort((a, b) => a.nm.localeCompare(b.nm));

  const provinceSelect = document.getElementById("provinceSelect");
  const municipalitySelect = document.getElementById("municipalitySelect");

  const provinceIdInput = document.getElementById("provinceIdInput");
  const provinceNameInput = document.getElementById("provinceNameInput");
  const municipalityIdInput = document.getElementById("municipalityIdInput");
  const municipalityNameInput = document.getElementById("municipalityNameInput");

  // Rellenar el select de provincias
  provinces.forEach((prov) => {
    const option = document.createElement("option");
    option.value = prov.id;
    option.textContent = prov.nm;
    provinceSelect.appendChild(option);
  });

  // Evento: al cambiar de provincia
  provinceSelect.addEventListener("change", () => {
    const selectedProvinceId = provinceSelect.value;
    const selectedProvince = provinces.find((p) => p.id === selectedProvinceId);

    // Actualizar campos ocultos de provincia
    provinceIdInput.value = selectedProvince?.id || "";
    provinceNameInput.value = selectedProvince?.nm || "";

    // Limpiar y recargar municipios
    municipalitySelect.innerHTML = '<option value="">-- Selecciona un municipio --</option>';
    municipalityIdInput.value = "";
    municipalityNameInput.value = "";

    if (selectedProvinceId) {
      const filteredCities = cities.filter((city) =>
        city.id.startsWith(selectedProvinceId)
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

  // Evento: al cambiar de municipio
  municipalitySelect.addEventListener("change", () => {
    const selectedCityId = municipalitySelect.value;
    const selectedCity = cities.find((c) => c.id === selectedCityId);

    municipalityIdInput.value = selectedCity?.id || "";
    municipalityNameInput.value = selectedCity?.nm || "";
  });

});
