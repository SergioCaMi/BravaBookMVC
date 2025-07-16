(function () {
    var forms = document.querySelectorAll(".needs-validation");

    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener(
            "submit",
            function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                form.classList.add("was-validated");
            },
            false
        );
    });
})();

// CRUCIAL: Inicializa photoCount con el número de fotos existentes para evitar colisiones de índices.
let photoCount = 0;
document.addEventListener("DOMContentLoaded", function() {
    const existingPhotos = document.querySelectorAll('#existingPhotosContainer .photo-fieldset-existing');
    photoCount = existingPhotos.length;

    const form = document.getElementById('apartmentForm');
    if (form && !form.enctype) {
        form.enctype = 'multipart/form-data';
    }
});


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
        <input type="text" name="rules[]" class="form-control" placeholder="Ej. No fumar">
        <div class="invalid-feedback">
            Por favor, ingresa una norma.
        </div>
        <button type="button" class="btn btn-outline-danger" onclick="this.parentNode.remove()">Eliminar</button>
    `;
    container.appendChild(div);
}

// --- Funciones para gestionar fotos ---

// Función para añadir un nuevo campo de foto (Híbrido: Archivo/URL)
function addNewPhotoField() {
    const newPhotosContainer = document.getElementById('newPhotosContainer');
    const fieldset = document.createElement('fieldset');
    fieldset.classList.add('photo-fieldset-new', 'mt-4');
    const currentPhotoIndex = photoCount;
    fieldset.id = `newPhotoFieldset_${currentPhotoIndex}`; 

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
    newPhotosContainer.appendChild(fieldset);

    toggleNewPhotoInput(currentPhotoIndex, 'file');
    photoCount++;
}

// Función para alternar visibilidad de inputs en los NUEVOS campos de foto
function toggleNewPhotoInput(index, type) {
    const fileInputContainer = document.getElementById(`newFileInputContainer_${index}`);
    const urlInputContainer = document.getElementById(`newUrlInputContainer_${index}`);
    
    const fileInput = document.getElementById(`newApartmentPhotos_${index}`);
    const urlInput = document.getElementById(`newApartmentPhotoUrl_${index}`);

    if (fileInput && urlInput) {
        if (type === 'file') {
            fileInputContainer.style.display = 'block';
            urlInputContainer.style.display = 'none';
            urlInput.value = '';
        } else {
            fileInputContainer.style.display = 'none';
            urlInputContainer.style.display = 'block';
        }
    }
}

/**
 * Función que se ejecuta al confirmar la eliminación de una foto existente desde el modal.
 * @param {number} index El índice de la foto original a eliminar.
 */
function confirmRemoveExistingPhoto(index) {
    const photoElement = document.getElementById(`existingPhotoFieldset_${index}`);
    if (photoElement) {
        photoElement.remove();

        // Añadir el input oculto para indicar al backend que esta foto debe ser eliminada
        const deletedPhotoInput = document.createElement('input');
        deletedPhotoInput.type = 'hidden';
        deletedPhotoInput.name = 'deletedPhotoIndexes[]';
        deletedPhotoInput.value = index;
        document.getElementById('apartmentForm').appendChild(deletedPhotoInput);

        const existingPhotosCount = document.querySelectorAll('#existingPhotosContainer .photo-fieldset-existing').length;
        if (existingPhotosCount === 0) {
            let noPhotosMessage = document.getElementById('noExistingPhotosMessage');
            if (!noPhotosMessage) {
                noPhotosMessage = document.createElement('p');
                noPhotosMessage.id = 'noExistingPhotosMessage';
                document.getElementById('existingPhotosContainer').appendChild(noPhotosMessage);
            }
            noPhotosMessage.textContent = 'No hay fotos actuales.';
            noPhotosMessage.style.display = 'block';
        }
    }

    // Ocultar el modal después de la eliminación
    const modalElement = document.getElementById(`deletePhotoModal-${index}`);
    if (modalElement) {
        // Obtener la instancia del modal de Bootstrap y ocultarlo
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
}

// Event listener para eliminar nuevas fotos
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('remove-new-photo-field')) {
        event.target.closest('.photo-fieldset-new').remove();
    }
});


document
    .getElementById("apartmentForm")
    .addEventListener("submit", function (event) {
        const provinceSelect = document.getElementById("provinceSelect");
        const municipalitySelect = document.getElementById("municipalitySelect");

        const selectedProvince = provinces.find(
            (p) => p.id === provinceSelect.value
        );
        const selectedCity = cities.find((c) => c.id === municipalitySelect.value);

        document.getElementById("provinceIdInput").value =
            selectedProvince?.id || "";
        document.getElementById("provinceNameInput").value =
            selectedProvince?.nm || "";

        document.getElementById("municipalityIdInput").value =
            selectedCity?.id || "";
        document.getElementById("municipalityNameInput").value =
            selectedCity?.nm || "";

        // Validación de fotos:
        const existingPhotosCount = document.querySelectorAll('#existingPhotosContainer .photo-fieldset-existing').length;
        const newPhotosCount = document.querySelectorAll('#newPhotosContainer .photo-fieldset-new').length;
        const errorFotoElement = document.querySelector('.errorFoto');

        if (existingPhotosCount === 0 && newPhotosCount === 0) {
            errorFotoElement.style.display = 'block';
            event.preventDefault();
            event.stopPropagation();
        } else {
            errorFotoElement.style.display = 'none';
        }

        document.querySelectorAll('.photo-fieldset-new').forEach(fieldset => {
            const index = fieldset.id.split('_')[1];
            const uploadTypeFile = document.getElementById(`newUploadType_file_${index}`);
            const uploadTypeUrl = document.getElementById(`newUploadType_url_${index}`);
            const fileInput = document.getElementById(`newApartmentPhotos_${index}`);
            const urlInput = document.getElementById(`newApartmentPhotoUrl_${index}`);

            if (uploadTypeFile && uploadTypeFile.checked) {
                // Validación para archivos: Multer y el backend se encargarán de esto
            } else if (uploadTypeUrl && uploadTypeUrl.checked) {
                if (urlInput) {
                    // Validación para URLs: se recomienda en el backend
                }
            }
        });

    }, false);


document.addEventListener("DOMContentLoaded", generateBedInputs);