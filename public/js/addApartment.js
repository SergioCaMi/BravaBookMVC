document.addEventListener("DOMContentLoaded", () => {
  // Inicialización de ToolTips de Bootstrap
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

    if (roomCount <= 0) return; // No generar campos si no hay habitaciones

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

  if (roomsInput && bedsContainer) {
    roomsInput.addEventListener("input", generateBedInputs);
  }

  // ********** Validación del formulario **********
  const form = document.getElementById("apartmentForm");

  form.addEventListener("submit", function (e) {
    let isValid = true;

    // Validación estándar de Bootstrap
    if (!form.checkValidity()) {
      isValid = false;
    }

    // Validación personalizada para fotos
    const errorFotoElement = document.querySelector(".errorFoto");
    const photoClickedInput = document.getElementById("photoButtonClicked");
    // Verificar si se ha añadido al menos un campo de foto (sea archivo o URL)
    const totalPhotoFields = document.querySelectorAll('.photo-fieldset').length;

    if (totalPhotoFields === 0) { 
      if (errorFotoElement) errorFotoElement.style.display = "inline";
      isValid = false;
    } else {
      // Si hay campos de foto, ocultar el mensaje de error si estaba visible
      if (errorFotoElement) errorFotoElement.style.display = "none";
      // Asegurarse de que el input oculto de validación esté en 'true'
      if (photoClickedInput) photoClickedInput.value = "true";
    }

    // Si la validación falla, prevenir el envío del formulario
    if (!isValid) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Añade clases de Bootstrap para mostrar la retroalimentación de validación
    form.classList.add("was-validated");
  });


  // Asegurarse de que el formulario tenga enctype="multipart/form-data" si no lo tiene (redundante si ya está en HTML)
  // const form = document.getElementById('apartmentForm'); // Ya está definido arriba
  if (form && !form.enctype) {
    form.enctype = 'multipart/form-data';
  }


  // ********** Gestión de eliminar campos de fotos nuevas **********
  // Este evento se delega al documento para capturar clics en botones
  // que se añaden dinámicamente.
  document.addEventListener("click", function(event) {
    if (event.target.classList.contains("remove-new-photo-field")) {
      event.target.closest(".photo-fieldset").remove();
      // Opcional: Reajustar photoCount si se reordenan o se usan índices específicos,
      // pero para "nuevas fotos" con nombres de array, no es estrictamente necesario.
      // Aquí, solo eliminamos el elemento del DOM.
    }
  });


  // Asegurarse de que el contador photoCount se inicialice correctamente.
  // En la creación, siempre empezamos en 0 si no hay fotos precargadas.
  //let photoCount = 0; // Esta línea debería estar fuera del DOMContentLoaded o ser global.
  // Mover `photoCount` fuera de `DOMContentLoaded` o declararla sin `let` aquí
  // si ya está declarada globalmente arriba, para que `addNewPhotoField` pueda acceder.
});


// ********** Funciones Globales para añadir elementos dinámicamente **********
// Declarar photoCount globalmente para que todas las funciones puedan acceder a ella.
let photoCount = 0;

/**
 * Añade un nuevo campo para subir una foto (archivo o URL) al formulario.
 */
function addNewPhotoField() {
    const photoClickedInput = document.getElementById("photoButtonClicked");
    if (photoClickedInput) {
        photoClickedInput.value = "true"; // Indica que se ha intentado añadir una foto
    }

    const container = document.getElementById("photosContainer");
    const fieldset = document.createElement("fieldset");
    fieldset.className = "photo-fieldset border p-3 mb-3 rounded"; // Añadimos estilos para mejor visualización
    fieldset.id = `newPhotoFieldset_${photoCount}`; // Añadimos un ID para fácil referencia

    fieldset.innerHTML = `
        <legend class="h6">Foto ${photoCount + 1}</legend>

        <div class="mb-3">
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="newPhotos[${photoCount}][uploadType]" id="uploadTypeFile_${photoCount}" value="file" onchange="toggleNewPhotoInput(${photoCount}, 'file')" checked>
                <label class="form-check-label" for="uploadTypeFile_${photoCount}">Subir archivo</label>
            </div>
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="newPhotos[${photoCount}][uploadType]" id="uploadTypeUrl_${photoCount}" value="url" onchange="toggleNewPhotoInput(${photoCount}, 'url')">
                <label class="form-check-label" for="uploadTypeUrl_${photoCount}">Usar URL</label>
            </div>
        </div>

        <div id="newFileInputContainer_${photoCount}" class="mb-3">
            <label for="newFileInput_${photoCount}" class="form-label">Seleccionar archivo de foto:</label>
            <input type="file" 
                   name="newPhotos[${photoCount}][file]" 
                   id="newFileInput_${photoCount}" 
                   class="form-control" 
                   accept="image/*">
        </div>

        <div id="newUrlInputContainer_${photoCount}" class="mb-3" style="display:none;">
            <label for="newUrlInput_${photoCount}" class="form-label">URL de la foto:</label>
            <input type="url" 
                   name="newPhotos[${photoCount}][url]" 
                   id="newUrlInput_${photoCount}" 
                   class="form-control" 
                   placeholder="https://ejemplo.com/imagen.jpg">
        </div>

        <div class="mb-3">
            <label for="newPhotoDescription_${photoCount}" class="form-label">Descripción de la foto:</label>
            <input type="text" 
                   name="newPhotos[${photoCount}][description]" 
                   id="newPhotoDescription_${photoCount}"
                   class="form-control" />
        </div>

        <div class="form-check mb-3">
            <input type="radio" 
                   name="mainPhotoIndex" 
                   id="mainPhoto_${photoCount}"
                   value="new_${photoCount}" 
                   class="form-check-input"
                   ${photoCount === 0 ? "checked" : ""}>
            <label class="form-check-label" for="mainPhoto_${photoCount}">Foto Principal</label>
        </div>

        <button type="button" class="btn btn-outline-danger btn-sm remove-new-photo-field">
            Eliminar esta foto
        </button>
    `;
    container.appendChild(fieldset);
    photoCount++;
}

/**
 * Alterna la visibilidad de los campos de input de archivo y URL.
 * @param {number} index El índice del campo de foto actual.
 * @param {string} type El tipo de subida seleccionado ('file' o 'url').
 */
function toggleNewPhotoInput(index, type) {
    const fileInputContainer = document.getElementById(`newFileInputContainer_${index}`);
    const urlInputContainer = document.getElementById(`newUrlInputContainer_${index}`);
    const fileInput = document.getElementById(`newFileInput_${index}`);
    const urlInput = document.getElementById(`newUrlInput_${index}`);

    if (type === 'file') {
        fileInputContainer.style.display = 'block';
        urlInputContainer.style.display = 'none';
        urlInput.value = ''; // Limpiar el valor de la URL cuando se cambia a archivo
        fileInput.required = true; // Hacer requerido el input de archivo
        urlInput.required = false; // Quitar el requerido del input de URL
    } else { // type === 'url'
        fileInputContainer.style.display = 'none';
        urlInputContainer.style.display = 'block';
        // No limpiar el valor del archivo cuando se cambia a URL, ya que Multer lo ignorará si no se usa.
        // Pero el input de archivo no se "limpia" de la misma manera que un input de texto/url.
        fileInput.value = ''; // Esto sí limpia el archivo seleccionado
        fileInput.required = false; // Quitar el requerido del input de archivo
        urlInput.required = true; // Hacer requerido el input de URL
    }
}


// ********** Función para añadir reglas **********
let ruleCount = 0; // Se inicializa globalmente o al cargar el DOM

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
  input.name = `rules[${ruleCount}]`; // Usar índice para el nombre para que el servidor lo reciba como un array
  input.placeholder = "Ej: CheckOut antes de las 12am.";
  input.className = "form-control";
  input.required = true; // Campo requerido

  group.appendChild(label);
  group.appendChild(input);
  container.appendChild(group);

  ruleCount++;
}