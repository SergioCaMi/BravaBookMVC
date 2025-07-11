document.addEventListener("DOMContentLoaded", () => {
  // ToolTips
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map((el) => new bootstrap.Tooltip(el));

  // ********** Camas por habitación **********
  const roomsInput = document.getElementById("rooms");
  const bedsContainer = document.getElementById("bedsContainer");

  function generateBedInputs() {
    const roomCount = parseInt(roomsInput.value) || 0;
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
      input.required = true; // <- Añadido

      input.className = "form-control";

      col.appendChild(label);
      col.appendChild(input);
      row.appendChild(col);
    }

    bedsContainer.appendChild(row);
  }

  if (roomsInput && bedsContainer) {
    roomsInput.addEventListener("input", generateBedInputs);
  }

  // ********** Validación del formulario **********
  const form = document.getElementById("apartmentForm");

  form.addEventListener("submit", function (e) {
    let isValid = true;

    if (!form.checkValidity()) {
      isValid = false;
    }

    const errorFotoElement = document.querySelector(".errorFoto");
    const photoClickedInput = document.getElementById("photoButtonClicked");
    const fotoAgregada = photoClickedInput && photoClickedInput.value === "true";

    if (!fotoAgregada) {
      if (errorFotoElement) errorFotoElement.style.display = "inline";
      isValid = false;
    } else {
      if (errorFotoElement) errorFotoElement.style.display = "none";
    }

    if (!isValid) {
      e.preventDefault();
      e.stopPropagation();
    }

    form.classList.add("was-validated");
  });
});

// ********** Función para añadir imágenes **********
let photoCount = 0;

function addPhotoField() {
  const photoClickedInput = document.getElementById("photoButtonClicked");
  if (photoClickedInput) {
    photoClickedInput.value = "true";
  }

  const container = document.getElementById("photosContainer");
  const fieldset = document.createElement("fieldset");
  fieldset.className = "photo-fieldset";
  fieldset.innerHTML = `
    <legend>Foto ${photoCount + 1}</legend>

    <label for="photos[${photoCount}][url]">URL de la foto:</label>
    <input type="text" name="photos[${photoCount}][url]" class="form-control" required /><br>

    <label for="photos[${photoCount}][description]">Descripción:</label>
    <input type="text" name="photos[${photoCount}][description]" class="form-control" />

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

// ********** Función para añadir reglas **********
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
  input.required = true; // <- Añadido

  group.appendChild(label);
  group.appendChild(input);
  container.appendChild(group);

  ruleCount++;
}
