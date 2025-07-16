// --- Validación de Formularios de Bootstrap ---

// Función autoejecutable para aplicar la validación de Bootstrap a todos los formularios.
(function () {
  // Selecciona todos los formularios que tienen la clase 'needs-validation'.
  var forms = document.querySelectorAll(".needs-validation");

  // Convierte la NodeList de formularios en un Array y itera sobre cada formulario.
  Array.prototype.slice.call(forms).forEach(function (form) {
    // Añade un event listener para el evento 'submit' a cada formulario.
    form.addEventListener(
      "submit",
      function (event) {
        // Si el formulario no es válido según las restricciones HTML5 (required, type, min, max, etc.).
        if (!form.checkValidity()) {
          event.preventDefault(); // Evita el envío del formulario.
          event.stopPropagation(); // Detiene la propagación del evento para evitar comportamientos predeterminados.
        }

        // Añade la clase 'was-validated' al formulario. Esto activa los estilos de Bootstrap
        // para mostrar retroalimentación visual (bordes verdes/rojos, mensajes de error).
        form.classList.add("was-validated");
      },
      false // Usa la fase de burbujeo para el evento.
    );
  });
})();

// --- Gestión de Fotos Existentes y Nuevas ---

// Variable global para llevar la cuenta de cuántos campos de foto se han añadido.
// CRUCIAL: Inicializa `photoCount` con el número de fotos existentes para evitar colisiones de índices
// al añadir nuevas fotos después de cargar la página para edición.
let photoCount = 0;

// Espera a que el DOM esté completamente cargado para inicializar.
document.addEventListener("DOMContentLoaded", function() {
  // Obtiene todas las fotos existentes que están renderizadas en el contenedor `#existingPhotosContainer`.
  const existingPhotos = document.querySelectorAll('#existingPhotosContainer .photo-fieldset-existing');
  // Establece `photoCount` al número de fotos existentes para asegurar que los nuevos campos de foto
  // tengan índices que no colisionen con los ya presentes.
  photoCount = existingPhotos.length;

  // Obtiene la referencia al formulario de apartamento.
  const form = document.getElementById('apartmentForm');
  // Si el formulario existe y no tiene el atributo `enctype` establecido, lo configura.
  // Esto es vital para que Multer pueda procesar la subida de archivos correctamente.
  if (form && !form.enctype) {
    form.enctype = 'multipart/form-data';
  }
});

// --- Generador Dinámico de Campos de Camas por Habitación ---

/**
 * Genera dinámicamente campos de entrada para el número de camas en cada habitación.
 * La cantidad de campos se basa en el valor del input 'rooms'.
 */
function generateBedInputs() {
  // Obtiene el número de habitaciones del input 'rooms', por defecto 0 si no es un número válido.
  const roomCount = parseInt(document.getElementById("rooms").value) || 0;
  // Obtiene el contenedor donde se añadirán los inputs de camas.
  const bedsContainer = document.getElementById("bedsPerRoomContainer");
  // Limpia cualquier contenido previo en el contenedor.
  bedsContainer.innerHTML = "";

  // Si el número de habitaciones es 0 o negativo, no se generan campos y la función termina.
  if (roomCount <= 0) return;

  // Itera desde 0 hasta `roomCount - 1` para crear un campo de input para cada habitación.
  for (let i = 0; i < roomCount; i++) {
    // Crea un nuevo div para agrupar el input y sus elementos asociados.
    const div = document.createElement("div");
    div.className = "input-group mb-2"; // Clases de Bootstrap para estilo.
    // Define el contenido HTML del div, incluyendo un label, el input numérico y un mensaje de feedback.
    div.innerHTML = `
      <span class="input-group-text">Habitación ${i + 1}</span>
      <input type="number" name="bedsPerRoom[]" class="form-control" value="1" min="1" required>
      <div class="invalid-feedback">
        Por favor, ingresa un número válido de camas.
      </div>
    `;
    // Añade el div creado al contenedor de camas.
    bedsContainer.appendChild(div);
  }
}

// --- Control de Eventos para la Generación de Camas ---

// Añade un event listener al input 'rooms'. Cada vez que su valor cambia (input),
// se llama a la función `generateBedInputs` para actualizar los campos de camas.
document.getElementById("rooms").addEventListener("input", generateBedInputs);

// --- Funcionalidad para Añadir Campos de Reglas ---

/**
 * Añade dinámicamente un nuevo campo de entrada para una regla del apartamento.
 */
function addRuleInput() {
  // Obtiene el contenedor donde se añadirán los campos de reglas.
  const container = document.getElementById("rulesContainer");
  // Crea un nuevo div para agrupar el input de la regla y el botón de eliminar.
  const div = document.createElement("div");
  div.className = "input-group mb-2"; // Clases de Bootstrap para estilo.
  // Define el contenido HTML del div, incluyendo el input de texto, mensaje de feedback
  // y un botón para eliminar esta regla.
  div.innerHTML = `
    <input type="text" name="rules[]" class="form-control" placeholder="Ej. No fumar">
    <div class="invalid-feedback">
      Por favor, ingresa una norma.
    </div>
    <button type="button" class="btn btn-outline-danger" onclick="this.parentNode.remove()">Eliminar</button>
  `;
  // Añade el div creado al contenedor de reglas.
  container.appendChild(div);
}

// --- Funciones para Gestionar Fotos (Añadir/Alternar/Eliminar) ---

/**
 * Añade un nuevo conjunto de campos para subir una foto, permitiendo elegir entre
 * subir un archivo o proporcionar una URL.
 */
function addNewPhotoField() {
  // Obtiene el contenedor donde se añadirán los nuevos campos de foto.
  const newPhotosContainer = document.getElementById('newPhotosContainer');
  // Crea un nuevo 'fieldset' para agrupar los campos de una sola foto.
  const fieldset = document.createElement('fieldset');
  fieldset.classList.add('photo-fieldset-new', 'mt-4'); // Clases para estilo y agrupación.
  // Obtiene el índice actual para la nueva foto.
  const currentPhotoIndex = photoCount;
  fieldset.id = `newPhotoFieldset_${currentPhotoIndex}`; // Asigna un ID único al fieldset.

  // Define el contenido HTML del fieldset, incluyendo opciones de subida, inputs y radio button para foto principal.
  fieldset.innerHTML = `
    <legend>Nueva Foto ${currentPhotoIndex + 1}</legend>
    <div class="mb-3">
        <label class="form-label">Método de carga:</label>
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" 
                   name="newPhotos[${currentPhotoIndex}][uploadType]" 
                   id="newUploadType_file_${currentPhotoIndex}" 
                   value="file" checked 
                   onchange="toggleNewPhotoInput(${currentPhotoIndex}, 'file')">
            <label class="form-check-label" for="newUploadType_file_${currentPhotoIndex}">Subir archivo</label>
        </div>
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" 
                   name="newPhotos[${currentPhotoIndex}][uploadType]" 
                   id="newUploadType_url_${currentPhotoIndex}" 
                   value="url" 
                   onchange="toggleNewPhotoInput(${currentPhotoIndex}, 'url')">
            <label class="form-check-label" for="newUploadType_url_${currentPhotoIndex}">Usar URL</label>
        </div>
    </div>

    <div id="newFileInputContainer_${currentPhotoIndex}" class="mb-3">
        <label for="newApartmentPhotos_${currentPhotoIndex}" class="form-label">Seleccionar archivo de foto:</label>
        <input type="file" 
               name="apartmentPhotos" 
               id="newApartmentPhotos_${currentPhotoIndex}" 
               class="form-control" 
               accept="image/*">
    </div>

    <div id="newUrlInputContainer_${currentPhotoIndex}" class="mb-3" style="display:none;">
        <label for="newApartmentPhotoUrl_${currentPhotoIndex}" class="form-label">URL de la foto:</label>
        <input type="url" 
               name="newPhotos[${currentPhotoIndex}][url]" 
               id="newApartmentPhotoUrl_${currentPhotoIndex}" 
               class="form-control" 
               placeholder="https://ejemplo.com/imagen.jpg">
    </div>

    <div class="mb-3">
        <label for="newPhotos_${currentPhotoIndex}_description" class="form-label">Descripción de la foto:</label>
        <input type="text" 
               name="newPhotos[${currentPhotoIndex}][description]" 
               id="newPhotos_${currentPhotoIndex}_description"
               class="form-control" 
               placeholder="Ej: Salón principal"/>
    </div>

    <div class="form-check">
        <input type="radio" 
               name="mainPhotoIndex" 
               id="newMainPhoto_${currentPhotoIndex}"
               value="new_${currentPhotoIndex}"
               class="form-check-input">
        <label class="form-check-label" for="newMainPhoto_${currentPhotoIndex}">Foto Principal</label>
    </div>
    <button type="button" class="btn btn-danger btn-sm mt-2 remove-new-photo-field">Eliminar esta nueva foto</button>
    <hr />
  `;
  // Añade el nuevo fieldset al DOM.
  newPhotosContainer.appendChild(fieldset);

  // Llama a la función para configurar la visibilidad inicial de los inputs (por defecto 'file').
  toggleNewPhotoInput(currentPhotoIndex, 'file');
  photoCount++; // Incrementa el contador global de fotos.
}

/**
 * Alterna la visibilidad de los inputs de 'archivo' y 'URL' para un campo de nueva foto específico.
 * @param {number} index - El índice del campo de foto a modificar.
 * @param {'file'|'url'} type - El tipo de input a mostrar ('file' o 'url').
 */
function toggleNewPhotoInput(index, type) {
  // Obtiene los contenedores de los inputs de archivo y URL para el índice dado.
  const fileInputContainer = document.getElementById(`newFileInputContainer_${index}`);
  const urlInputContainer = document.getElementById(`newUrlInputContainer_${index}`);

  // Obtiene los propios inputs de archivo y URL.
  const fileInput = document.getElementById(`newApartmentPhotos_${index}`);
  const urlInput = document.getElementById(`newApartmentPhotoUrl_${index}`);

  // Verifica que ambos inputs existan.
  if (fileInput && urlInput) {
    if (type === 'file') {
      // Si se selecciona 'file', muestra el input de archivo y oculta el de URL.
      fileInputContainer.style.display = 'block';
      urlInputContainer.style.display = 'none';
      urlInput.value = ''; // Limpia el valor del campo URL oculto.
    } else {
      // Si se selecciona 'url', oculta el input de archivo y muestra el de URL.
      fileInputContainer.style.display = 'none';
      urlInputContainer.style.display = 'block';
      // Nota: El input de archivo no se limpia automáticamente aquí, pero Multer lo ignorará si no se selecciona.
    }
  }
}

/**
 * Función que se ejecuta al confirmar la eliminación de una foto **existente** desde el modal de confirmación.
 * Esta función elimina el elemento del DOM y añade un input oculto para informar al backend.
 * @param {number} index - El índice de la foto original a eliminar.
 */
function confirmRemoveExistingPhoto(index) {
  // Obtiene el elemento fieldset de la foto existente por su ID.
  const photoElement = document.getElementById(`existingPhotoFieldset_${index}`);
  if (photoElement) {
    photoElement.remove(); // Elimina el elemento de la foto del DOM.

    // Crea un input oculto para enviar el índice de la foto eliminada al servidor.
    const deletedPhotoInput = document.createElement('input');
    deletedPhotoInput.type = 'hidden';
    deletedPhotoInput.name = 'deletedPhotoIndexes[]'; // Nombre que Multer/Express pueden interpretar como array.
    deletedPhotoInput.value = index; // El valor es el índice de la foto eliminada.
    document.getElementById('apartmentForm').appendChild(deletedPhotoInput); // Añade al formulario.

    // Comprueba si quedan fotos existentes.
    const existingPhotosCount = document.querySelectorAll('#existingPhotosContainer .photo-fieldset-existing').length;
    if (existingPhotosCount === 0) {
      // Si no quedan fotos existentes, muestra un mensaje indicándolo.
      let noPhotosMessage = document.getElementById('noExistingPhotosMessage');
      if (!noPhotosMessage) {
        // Si el mensaje no existe, lo crea.
        noPhotosMessage = document.createElement('p');
        noPhotosMessage.id = 'noExistingPhotosMessage';
        document.getElementById('existingPhotosContainer').appendChild(noPhotosMessage);
      }
      noPhotosMessage.textContent = 'No hay fotos actuales.';
      noPhotosMessage.style.display = 'block';
    }
  }

  // Oculta el modal de confirmación después de la eliminación.
  const modalElement = document.getElementById(`deletePhotoModal-${index}`);
  if (modalElement) {
    // Obtiene la instancia del modal de Bootstrap y lo oculta.
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
  }
}

// --- Event Listener para Eliminar Nuevas Fotos Añadidas ---

// Añade un event listener al documento para detectar clics.
document.addEventListener('click', function(event) {
  // Si el elemento clicado tiene la clase 'remove-new-photo-field'.
  if (event.target.classList.contains('remove-new-photo-field')) {
    // Encuentra el 'fieldset' más cercano (que contiene la foto) y lo elimina del DOM.
    event.target.closest('.photo-fieldset-new').remove();
  }
});

// --- Manejo del Submit del Formulario (Datos de Ubicación y Validación Final) ---

// Añade un event listener al formulario de apartamento para el evento 'submit'.
document
  .getElementById("apartmentForm")
  .addEventListener("submit", function (event) {
    // Obtiene las referencias a los select de provincia y municipio.
    const provinceSelect = document.getElementById("provinceSelect");
    const municipalitySelect = document.getElementById("municipalitySelect");

    // Busca los objetos de provincia y municipio seleccionados en las variables globales 'provinces' y 'cities'.
    // (Asume que 'provinces' y 'cities' son arrays de objetos disponibles globalmente en este script).
    const selectedProvince = provinces.find(
      (p) => String(p.id) === provinceSelect.value
    );
    const selectedCity = cities.find((c) => String(c.id) === municipalitySelect.value);

    // Rellena los inputs ocultos con los IDs y nombres de la provincia y municipio seleccionados.
    // Esto asegura que estos datos se envíen al servidor como parte del formulario.
    document.getElementById("provinceIdInput").value =
      selectedProvince?.id || "";
    document.getElementById("provinceNameInput").value =
      selectedProvince?.nm || "";

    document.getElementById("municipalityIdInput").value =
      selectedCity?.id || "";
    document.getElementById("municipalityNameInput").value =
      selectedCity?.nm || "";

    // --- Validación de Fotos Final ---
    // Obtiene el número de fotos existentes y nuevas.
    const existingPhotosCount = document.querySelectorAll('#existingPhotosContainer .photo-fieldset-existing').length;
    const newPhotosCount = document.querySelectorAll('#newPhotosContainer .photo-fieldset-new').length;
    // Obtiene el elemento para mostrar el error de foto.
    const errorFotoElement = document.querySelector('.errorFoto');

    // Si no hay fotos existentes NI nuevas.
    if (existingPhotosCount === 0 && newPhotosCount === 0) {
      errorFotoElement.style.display = 'block'; // Muestra el mensaje de error.
      event.preventDefault(); // Evita el envío del formulario.
      event.stopPropagation(); // Detiene la propagación del evento.
    } else {
      errorFotoElement.style.display = 'none'; // Oculta el mensaje de error.
    }

    // Itera sobre los nuevos campos de foto para realizar validaciones adicionales si es necesario (aunque
    // la validación principal de archivos y URLs es mejor hacerla en el backend con Multer y un validador).
    document.querySelectorAll('.photo-fieldset-new').forEach(fieldset => {
      // Extrae el índice del fieldset desde su ID.
      const index = fieldset.id.split('_')[1];
      // Obtiene los radio buttons de tipo de carga.
      const uploadTypeFile = document.getElementById(`newUploadType_file_${index}`);
      const uploadTypeUrl = document.getElementById(`newUploadType_url_${index}`);
      // Obtiene los inputs de archivo y URL.
      const fileInput = document.getElementById(`newApartmentPhotos_${index}`);
      const urlInput = document.getElementById(`newApartmentPhotoUrl_${index}`);

      if (uploadTypeFile && uploadTypeFile.checked) {
        // Validación para archivos: Multer y el backend se encargarán de esto.
        // Aquí podríamos añadir `fileInput.required = true;` si queremos forzar que se seleccione un archivo.
      } else if (uploadTypeUrl && uploadTypeUrl.checked) {
        if (urlInput) {
          // Validación para URLs: se recomienda realizar una validación más robusta en el backend.
          // Aquí podríamos añadir `urlInput.required = true;` si queremos forzar que se introduzca una URL.
        }
      }
    });
  }, false);

// --- Inicialización al Cargar el DOM ---

// Al cargar el contenido del DOM, se genera inicialmente los campos de camas
// en caso de que ya haya un valor en el input de habitaciones (ej. al editar).
document.addEventListener("DOMContentLoaded", generateBedInputs);