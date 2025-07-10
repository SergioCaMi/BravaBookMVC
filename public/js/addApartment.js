document.addEventListener("DOMContentLoaded", () => {

  // ********** ToolTips **********
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // ********** Función para añadir camas **********

  const roomsInput = document.getElementById("rooms");
  const bedsContainer = document.getElementById("bedsContainer");

  if (!roomsInput || !bedsContainer) {
    console.error("No se encontraron los elementos del DresolveOM");
    return;
  }

  function generateBedInputs() {
    const roomCount = parseInt(document.getElementById("rooms").value) || 0;
    const bedsContainer = document.getElementById("bedsContainer");
    bedsContainer.innerHTML = "";

    if (roomCount <= 0) return;

    const title = document.createElement("h6");
    title.textContent = "Camas por habitación:";
    title.className = "mb-3";
    bedsContainer.appendChild(title);

    const row = document.createElement("div");
    row.className = "row g-3";

    for (let i = 0; i < roomCount; i++) {
      const col = document.createElement("div");
      col.className = "col-md-6";

      const label = document.createElement("label");
      label.setAttribute("for", `bedsPerRoom[${i}]`);
      label.textContent = `Camas en habitación ${i + 1}`;
      label.className = "form-label";

      const input = document.createElement("input");
      input.type = "number";
      input.name = `bedsPerRoom[${i}]`;
      input.min = "0";
      input.value = "1";
      input.required = true;
      input.className = "form-control";

      col.appendChild(label);
      col.appendChild(input);

      row.appendChild(col);
    }

    bedsContainer.appendChild(row);
  }
  roomsInput.addEventListener("input", generateBedInputs);

// Validación botónfotos
 const form = document.getElementById("apartmentForm");

  form.addEventListener("submit", function (e) {
    let isValid = true;

    if (!form.checkValidity()) {
      isValid = false;
    }

    const errorFotoElement = document.querySelector(".errorFoto");
    const fotoAgregada = document.getElementById("photoButtonClicked").value === "true";

    if (!fotoAgregada) {
      errorFotoElement.style.display = "inline";
      isValid = false;
    } else {
      errorFotoElement.style.display = "none";
    }

    // Cancelar envío si no es válido
    if (!isValid) {
      e.preventDefault();
      e.stopPropagation();
    }

    form.classList.add("was-validated");
  });


});

// ********** Función para añadir imagenes **********
let photoCount = 0;

function addPhotoField() {
  document.getElementById("photoButtonClicked").value = "true";
  const container = document.getElementById("photosContainer");
  const fieldset = document.createElement("fieldset");
  fieldset.className = "photo-fieldset";
  fieldset.innerHTML = `
      <legend>Foto ${photoCount + 1}</legend>

      <label for="photos[${photoCount}][url]">URL de la foto:</label>
      <input type="text" name="photos[${photoCount}][url]" required /><br>

      <label for="photos[${photoCount}][description]">Descripción:</label>
      <input type="text" name="photos[${photoCount}][description]" />

      <label>
        <input type="radio" name="mainPhotoIndex" value="${photoCount}" ${
    photoCount === 0 ? "checked" : ""
  } />
        Foto Principal
      </label>

      <hr />
    `;
  container.appendChild(fieldset);
  photoCount++;
}

// ********** Función para añadir normas **********
let ruleCount = 0;

function addRuleField() {
  const container = document.getElementById("rulesContainer");

  const group = document.createElement("div");
  group.className = "mb-2";

  const label = document.createElement("label");
  label.setAttribute("for", `rules[${ruleCount}]`);
  label.textContent = `Regla #${ruleCount + 1}:`;
  label.className = "form-label";

  const input = document.createElement("input");
  input.type = "text";
  input.name = `rules[]`;
  input.placeholder = "Ej: CheckOut antes de las 12am.";
  input.className = "form-control";

  group.appendChild(label);
  group.appendChild(input);

  container.appendChild(group);

  ruleCount++;
}

