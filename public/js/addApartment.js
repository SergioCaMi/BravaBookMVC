// Espera a que el DOM esté completamente cargado antes de ejecutar el script.
document.addEventListener("DOMContentLoaded", () => {
  // --- Inicialización de ToolTips de Bootstrap ---

  // Selecciona todos los elementos con el atributo `data-bs-toggle="tooltip"`
  // y los convierte en un array para poder iterar sobre ellos.
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  // Itera sobre la lista de elementos y para cada uno, inicializa un tooltip de Bootstrap.
  tooltipTriggerList.map((el) => new bootstrap.Tooltip(el));

  // --- Funcionalidad de Camas por Habitación ---

  // Obtiene las referencias a los elementos del DOM.
  const roomsInput = document.getElementById("rooms"); // Input para el número total de habitaciones.
  const bedsContainer = document.getElementById("bedsContainer"); // Contenedor donde se añadirán los inputs de camas.

  /**
   * Genera dinámicamente campos de entrada para especificar el número de camas por cada habitación.
   * La cantidad de campos generados depende del valor introducido en `roomsInput`.
   */
  function generateBedInputs() {
    // Obtiene el número de habitaciones del input, asegurándose de que sea un número entero.
    const roomCount = parseInt(roomsInput.value) || 0;
    // Limpia el contenido actual del contenedor de camas.
    bedsContainer.innerHTML = "";

    // Si el número de habitaciones es cero o negativo, no se generan inputs.
    if (roomCount <= 0) return;

    // Crea y añade un título al contenedor de camas.
    const title = document.createElement("h6");
    title.textContent = "Camas por habitación:";
    title.className = "mb-3";
    bedsContainer.appendChild(title);

    // Crea un contenedor de fila para los inputs, utilizando clases de Bootstrap para el diseño.
    const row = document.createElement("div");
    row.className = "row g-3";

    // Itera para crear un input por cada habitación.
    for (let i = 0; i < roomCount; i++) {
      // Crea una columna para cada input.
      const col = document.createElement("div");
      col.className = "col-md-6"; // Media columna en pantallas medianas y grandes.

      // Crea la etiqueta (label) para el input.
      const label = document.createElement("label");
      label.setAttribute("for", `bedsPerRoom[${i}]`); // Asocia el label con el input.
      label.textContent = `Camas en habitación ${i + 1}`; // Texto del label.
      label.className = "form-label";

      // Crea el input para el número de camas.
      const input = document.createElement("input");
      input.type = "number"; // Tipo numérico.
      input.name = `bedsPerRoom[${i}]`; // Nombre que permitirá a Express/Mongoose parsear como un array.
      input.min = "0"; // Valor mínimo permitido.
      input.value = "1"; // Valor por defecto.
      input.required = true; // El campo es obligatorio.
      input.className = "form-control"; // Clase de estilo de Bootstrap.

      // Añade el label y el input a la columna.
      col.appendChild(label);
      col.appendChild(input);
      // Añade la columna a la fila.
      row.appendChild(col);
    }

    // Añade la fila completa al contenedor principal de camas.
    bedsContainer.appendChild(row);
  }

  // Verifica si los elementos existen antes de añadir el event listener.
  if (roomsInput && bedsContainer) {
    // Añade un event listener al input de habitaciones para que llame a `generateBedInputs`
    // cada vez que su valor cambie (ej. al escribir o usar las flechas).
    roomsInput.addEventListener("input", generateBedInputs);
    // Llama a la función una vez al cargar la página para inicializar los campos
    // si ya hay un valor por defecto o si se recargó la página con datos previos.
    generateBedInputs(); 
  }

  // --- Validación del Formulario ---

  // Obtiene la referencia al formulario principal.
  const form = document.getElementById("apartmentForm");

  // Añade un event listener para el evento 'submit' del formulario.
  form.addEventListener("submit", function (e) {
    let isValid = true; // Bandera para controlar la validez general del formulario.

    // Usa la validación nativa de HTML5 para los campos del formulario.
    if (!form.checkValidity()) {
      isValid = false; // Si hay campos no válidos según HTML5, el formulario no es válido.
    }

    // --- Validación específica para la subida de fotos ---
    const errorFotoElement = document.querySelector(".errorFoto"); // Elemento para mostrar el error de foto.
    const photoClickedInput = document.getElementById("photoButtonClicked"); // Input oculto que indica si se ha añadido alguna foto.
    // Comprueba si el input oculto existe y si su valor es "true", indicando que al menos una foto fue añadida.
    const fotoAgregada = photoClickedInput && photoClickedInput.value === "true";

    // Si no se ha añadido ninguna foto (`fotoAgregada` es false).
    if (!fotoAgregada) {
      // Muestra el mensaje de error de la foto.
      if (errorFotoElement) errorFotoElement.style.display = "inline";
      isValid = false; // El formulario no es válido.
    } else {
      // Si se añadió al menos una foto, oculta el mensaje de error.
      if (errorFotoElement) errorFotoElement.style.display = "none";
    }

    // Si el formulario no es válido (ya sea por validación HTML5 o por la validación de fotos).
    if (!isValid) {
      e.preventDefault(); // Evita el envío del formulario.
      e.stopPropagation(); // Detiene la propagación del evento para evitar comportamientos no deseados.
    }

    // Añade la clase 'was-validated' al formulario. Esto activa las clases de estilo de Bootstrap
    // para mostrar retroalimentación visual de validación (ej. bordes rojos/verdes).
    form.classList.add("was-validated");
  });
});

// --- Funcionalidad para Añadir Campos de Imagen ---

// Variable global para llevar la cuenta de cuántos campos de foto se han añadido.
let photoCount = 0;

/**
 * Añade un nuevo conjunto de campos (input de archivo, descripción, y radio para foto principal)
 * para subir una imagen de apartamento.
 */
function addPhotoField() {
  // Marca el input oculto `photoButtonClicked` como 'true' para indicar que se añadió una foto.
  const photoClickedInput = document.getElementById("photoButtonClicked");
  if (photoClickedInput) {
    photoClickedInput.value = "true";
  }

  // Obtiene el contenedor donde se añadirán los nuevos campos de foto.
  const container = document.getElementById("photosContainer");
  // Crea un nuevo `fieldset` para agrupar los campos de una foto individual.
  const fieldset = document.createElement("fieldset");
  fieldset.className = "photo-fieldset"; // Clase para estilos CSS.

  // Define el contenido HTML del nuevo `fieldset` utilizando un template string.
  fieldset.innerHTML = `
    <legend>Foto ${photoCount + 1}</legend>

    <div class="mb-3">
        <label for="apartmentPhotos_${photoCount}" class="form-label">Seleccionar archivo de foto:</label>
        <input type="file" 
               name="apartmentPhotos"   // Nombre para Multer (recibe un array de archivos).
               id="apartmentPhotos_${photoCount}" 
               class="form-control" 
               accept="image/*"         // Solo permite seleccionar archivos de imagen.
               required>                // Campo obligatorio.
    </div>

    <div class="mb-3">
        <label for="photos[${photoCount}][description]" class="form-label">Descripción de la foto:</label>
        <input type="text" 
               name="photos[${photoCount}][description]" // Nombre para parsear la descripción como parte de un array de objetos.
               id="photos[${photoCount}][description]"
               class="form-control" />
    </div>

    <div class="form-check">
        <input type="radio" 
               name="mainPhotoIndex"   // Todos los radios comparten el mismo nombre para que solo uno pueda ser seleccionado.
               id="mainPhoto_${photoCount}"
               value="${photoCount}"    // El valor es el índice de la foto.
               class="form-check-input"
               ${photoCount === 0 ? "checked" : ""}> // La primera foto añadida se marca como principal por defecto.
        <label class="form-check-label" for="mainPhoto_${photoCount}">Foto Principal</label>
    </div>

    <hr /> // Separador visual entre los fieldsets de fotos.
  `;
  // Añade el nuevo `fieldset` al contenedor de fotos.
  container.appendChild(fieldset);
  photoCount++; // Incrementa el contador de fotos.
}

// --- Funcionalidad para Añadir Campos de Reglas ---

// Variable global para llevar la cuenta de cuántos campos de regla se han añadido.
let ruleCount = 0;

/**
 * Añade un nuevo campo de entrada de texto para una regla del apartamento.
 */
function addRuleField() {
  // Obtiene el contenedor donde se añadirán los nuevos campos de reglas.
  const container = document.getElementById("rulesContainer");

  // Crea un nuevo div para agrupar el label y el input de la regla.
  const group = document.createElement("div");
  group.className = "mb-2"; // Margen inferior.

  // Crea la etiqueta (label) para el input de la regla.
  const label = document.createElement("label");
  label.setAttribute("for", `rules[${ruleCount}]`); // Asocia el label con el input.
  label.textContent = `Regla #${ruleCount + 1}:`; // Texto del label.
  label.className = "form-label";

  // Crea el input de texto para la regla.
  const input = document.createElement("input");
  input.type = "text"; // Tipo de texto.
  input.name = `rules[]`; // Nombre para que Express/Mongoose lo parseen como un array de cadenas.
  input.placeholder = "Ej: CheckOut antes de las 12am."; // Texto de ejemplo.
  input.className = "form-control"; // Clase de estilo de Bootstrap.
  input.required = true; // El campo es obligatorio.

  // Añade el label y el input al grupo.
  group.appendChild(label);
  group.appendChild(input);
  // Añade el grupo al contenedor principal de reglas.
  container.appendChild(group);

  ruleCount++; // Incrementa el contador de reglas.
}