  (function () {

   var forms = document.querySelectorAll('.needs-validation')

    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }

          form.classList.add('was-validated')
        }, false)
      })
  })()

  // Generador de camas
  function generateBedInputs() {
    const roomCount = parseInt(document.getElementById("rooms").value) || 0;
    const bedsContainer = document.getElementById("bedsPerRoomContainer");
    bedsContainer.innerHTML = ""; 

    if (roomCount <= 0) return;

    for (let i = 0; i < roomCount; i++) {
      const div = document.createElement("div");
      div.className = "input-group mb-2";
      div.innerHTML = `
        <span class="input-group-text">Habitación ${i + 1}</span>
        <input type="number" name="bedsPerRoom[]" class="form-control" value="1" min="1" required>
        <div class="invalid-feedback">
          Por favor, ingresa un número válido de camas.
        </div>
      `;
      bedsContainer.appendChild(div);
    }
  }

  // Controlar camas por habitaciones
  document.getElementById("rooms").addEventListener("input", generateBedInputs);

  function addRuleInput() {
    const container = document.getElementById("rulesContainer");
    const div = document.createElement("div");
    div.className = "input-group mb-2";
    div.innerHTML = `
      <input type="text" name="rules[]" class="form-control" placeholder="Ej. No fumar" required>
      <div class="invalid-feedback">
        Por favor, ingresa una norma.
      </div>
      <button type="button" class="btn btn-outline-danger" onclick="this.parentNode.remove()">Eliminar</button>
    `;
    container.appendChild(div);
  }


  function addPhotoField() {
  const container = document.getElementById("photosContainer");
  const div = document.createElement("div");
  div.className = "input-group mb-2";

  div.innerHTML = `
    <input type="url" name="photos[]" class="form-control" placeholder="URL de la foto" required>
    <div class="invalid-feedback">
      Por favor, proporciona una URL válida.
    </div>
    <button type="button" class="btn btn-outline-danger" onclick="this.parentNode.remove()">
      Eliminar
    </button>
  `;

  container.appendChild(div);
}


document.getElementById("apartmentForm").addEventListener("submit", function () {
  const provinceSelect = document.getElementById("provinceSelect");
  const municipalitySelect = document.getElementById("municipalitySelect");

  const selectedProvince = provinces.find(p => p.id === provinceSelect.value);
  const selectedCity = cities.find(c => c.id === municipalitySelect.value);

  document.getElementById("provinceIdInput").value = selectedProvince?.id || "";
  document.getElementById("provinceNameInput").value = selectedProvince?.nm || "";

  document.getElementById("municipalityIdInput").value = selectedCity?.id || "";
  document.getElementById("municipalityNameInput").value = selectedCity?.nm || "";

  console.log("provinceId:", document.getElementById("provinceIdInput").value);
console.log("municipalityId:", document.getElementById("municipalityIdInput").value);

});


  document.addEventListener('DOMContentLoaded', generateBedInputs);


  document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById("apartmentForm");

  if (form) {
    form.addEventListener("submit", function (event) {
      const provinceSelect = document.getElementById("provinceSelect");
      const municipalitySelect = document.getElementById("municipalitySelect");

      const selectedProvince = provinces.find(p => p.id === provinceSelect.value);
      const selectedCity = cities.find(c => c.id === municipalitySelect.value);

      document.getElementById("provinceIdInput").value = selectedProvince?.id || "";
      document.getElementById("provinceNameInput").value = selectedProvince?.nm || "";
      document.getElementById("municipalityIdInput").value = selectedCity?.id || "";
      document.getElementById("municipalityNameInput").value = selectedCity?.nm || "";
    });
  }
});

