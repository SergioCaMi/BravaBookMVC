document.addEventListener('DOMContentLoaded', () => {
    // Establecer la provincia seleccionada
    const provinceSelect = document.getElementById('provinceSelect');
    if (location.province.id) {
      const provinceOption = Array.from(provinceSelect.options).find(option => option.value == location.province.id);
      if (provinceOption) {
        provinceOption.selected = true;
      }
      document.getElementById('provinceIdInput').value = location.province.id;
      document.getElementById('provinceNameInput').value = location.province.nm;
    }

    // Establecer el municipio seleccionado
    const municipalitySelect = document.getElementById('municipalitySelect');
    if (location.municipality.id) {
      const municipalityOption = Array.from(municipalitySelect.options).find(option => option.value == location.municipality.id);
      if (municipalityOption) {
        municipalityOption.selected = true;
      }
      document.getElementById('municipalityIdInput').value = location.municipality.id;
      document.getElementById('municipalityNameInput').value = location.municipality.nm;
    }
  });