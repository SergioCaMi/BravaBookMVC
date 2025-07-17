// --- editApartment.js ---
console.log("¡editApartment.js cargado y ejecutándose!");

// Función autoejecutable para aplicar la validación de Bootstrap a todos los formularios.
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

// Variable global para llevar la cuenta de cuántos campos de foto se han añadido.
let photoCount = 0;

// Espera a que el DOM esté completamente cargado para inicializar.
document.addEventListener("DOMContentLoaded", function() {
    const existingPhotos = document.querySelectorAll('#existingPhotosContainer .photo-fieldset-existing');
    photoCount = existingPhotos.length;

    const form = document.getElementById('apartmentForm');
    if (form && !form.enctype) {
        form.enctype = 'multipart/form-data';
    }
    generateBedInputs();

    // --- ¡IMPORTANTE! INVOCAR LA FUNCIÓN DE INICIALIZACIÓN DE UBICACIÓN AQUÍ ---
    // Esta línea asegura que initializeLocationSelectors se ejecute al cargar la página
    initializeLocationSelectors();
});

// --- Tus funciones originales (generateBedInputs, addRuleInput, addNewPhotoField, etc.) ---

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

function confirmRemoveExistingPhoto(index) {
    const photoElement = document.getElementById(`existingPhotoFieldset_${index}`);
    if (photoElement) {
        photoElement.remove();

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

    const modalElement = document.getElementById(`deletePhotoModal-${index}`);
    if (modalElement) {
        document.body.focus();
        console.log('Foco movido al body.');

        const modalInstance = bootstrap.Modal.getInstance(modalElement);

        if (modalInstance) {
            modalElement.addEventListener('hidden.bs.modal', function handler() {
                console.log('Evento hidden.bs.modal disparado. Iniciando limpieza del fondo.');
                const allBackdrops = document.querySelectorAll('.modal-backdrop');
                allBackdrops.forEach(backdrop => {
                    if (backdrop) {
                        backdrop.remove();
                        console.log('Un backdrop fue eliminado.');
                    }
                });
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
                console.log('Limpieza del fondo y body completada.');
                modalElement.removeEventListener('hidden.bs.modal', handler);
            });
            modalInstance.hide();
            console.log('Modal.hide() llamado. Esperando evento hidden.bs.modal.');
        } else {
            console.warn('No se pudo obtener la instancia del modal. Intentando cierre manual (fallback).');
            modalElement.classList.remove('show');
            modalElement.setAttribute('aria-hidden', 'true');
            modalElement.style.display = 'none';
            const allBackdrops = document.querySelectorAll('.modal-backdrop');
            allBackdrops.forEach(backdrop => {
                if (backdrop) {
                    backdrop.remove();
                    console.log('Un backdrop fue eliminado (fallback).');
                }
            });
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
    } else {
        console.error('No se encontró el elemento modal con ID:', `deletePhotoModal-${index}`);
    }
}

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('remove-new-photo-field')) {
        event.target.closest('.photo-fieldset-new').remove();
    }
});

// --- FUNCIÓN ADICIONAL: Cargar y pre-seleccionar municipios ---
function loadMunicipalitiesAndPreselect() {
    const provinceSelect = document.getElementById("provinceSelect");
    const municipalitySelect = document.getElementById("municipalitySelect");

    // Estas variables globales `provinces` y `cities` provienen de `municipiAndProvince.js`.
    // La función `initializeLocationSelectors` ya se encarga de esperar que estén cargadas.
    const preselectedProvinceId = provinceSelect.dataset.selected;
    const preselectedMunicipalityId = municipalitySelect.dataset.selected;

    // Si hay una provincia pre-seleccionada desde el EJS
    if (preselectedProvinceId) {
        // Establecer el valor de la provincia en el select
        provinceSelect.value = preselectedProvinceId;

        // Limpiar y rellenar el select de municipios con las opciones correctas
        municipalitySelect.innerHTML = '<option value="">-- Selecciona un municipio --</option>'; // Opción por defecto

        const filteredCities = cities.filter(city =>
            String(city.id).startsWith(String(preselectedProvinceId))
        );
        filteredCities.sort((a, b) => a.nm.localeCompare(b.nm));

        filteredCities.forEach(city => {
            const option = document.createElement("option");
            option.value = city.id;
            option.textContent = city.nm;
            municipalitySelect.appendChild(option);
        });

        // Si hay un municipio pre-seleccionado, establecer su valor en el select
        if (preselectedMunicipalityId) {
            // Usamos un pequeño setTimeout para asegurar que las opciones del municipio se hayan renderizado
            setTimeout(() => {
                municipalitySelect.value = preselectedMunicipalityId;
            }, 0);
        }

        // Actualizar los inputs ocultos de ID y nombre de provincia y municipio.
        // Esto es vital para que se envíen los valores correctos si el usuario no interactúa con los selects.
        const selectedProvince = provinces.find(p => String(p.id) === String(preselectedProvinceId));
        const selectedCity = cities.find(c => String(c.id) === String(preselectedMunicipalityId));

        const provinceIdInput = document.getElementById("provinceIdInput");
        const provinceNameInput = document.getElementById("provinceNameInput");
        const municipalityIdInput = document.getElementById("municipalityIdInput");
        const municipalityNameInput = document.getElementById("municipalityNameInput");

        if (provinceIdInput) {
            provinceIdInput.value = selectedProvince?.id || "";
        }
        if (provinceNameInput) {
            provinceNameInput.value = selectedProvince?.nm || "";
        }
        if (municipalityIdInput) {
            municipalityIdInput.value = selectedCity?.id || "";
        }
        if (municipalityNameInput) {
            municipalityNameInput.value = selectedCity?.nm || "";
        }
    }
}

// Función que coordina la carga inicial de selectores de ubicación.
// Espera a que las variables globales `provinces` y `cities` estén disponibles.
function initializeLocationSelectors() {
    const checkAndLoad = () => {
        // Verificamos si las variables globales 'provinces' y 'cities' (de municipiAndProvince.js)
        // están cargadas y contienen datos.
        if (typeof provinces !== 'undefined' && provinces.length > 0 && typeof cities !== 'undefined' && cities.length > 0) {
            console.log('✅ Datos de provincias y municipios cargados. Iniciando preselección.');
            loadMunicipalitiesAndPreselect();
        } else {
            console.log('⏳ Esperando datos de provincias y municipios de municipiAndProvince.js...');
            // Reintentamos después de un corto tiempo si los datos aún no están listos
            setTimeout(checkAndLoad, 50);
        }
    };
    checkAndLoad(); // Iniciamos la verificación
}


// --- Manejo del Submit del Formulario (Datos de Ubicación y Validación Final) ---
document
    .getElementById("apartmentForm")
    .addEventListener("submit", function (event) {
        console.log('--- Preparando envío de formulario ---');
        const provinceSelect = document.getElementById("provinceSelect");
        const municipalitySelect = document.getElementById("municipalitySelect");

        console.log('Valor actual de provinceSelect:', provinceSelect ? provinceSelect.value : 'No encontrado');
        console.log('Valor actual de municipalitySelect:', municipalitySelect ? municipalitySelect.value : 'No encontrado');

        // Nos aseguramos de que `provinces` y `cities` estén disponibles antes de usarlas
        if (typeof provinces === 'undefined' || typeof cities === 'undefined' || provinces.length === 0 || cities.length === 0) {
            console.error('❌ ERROR: Datos de provincias o municipios no cargados. Asegúrate que `municipiAndProvince.js` se cargue correctamente antes de `editApartment.js`.');
            event.preventDefault(); // Prevenimos el envío si los datos no están
            event.stopPropagation();
            return;
        }

        console.log('Estado de la variable global provinces:', provinces);
        console.log('Estado de la variable global cities:', cities);

        const selectedProvince = provinces.find(
            (p) => String(p.id) === String(provinceSelect.value) // Aseguramos comparación de strings
        );
        const selectedCity = cities.find(
                (c) => String(c.id) === String(municipalitySelect.value) && String(c.id).startsWith(String(provinceSelect.value))
        );

        console.log('selectedProvince (después de find):', selectedProvince);
        console.log('selectedCity (después de find):', selectedCity);

        const provinceIdInput = document.getElementById("provinceIdInput");
        const provinceNameInput = document.getElementById("provinceNameInput");
        const municipalityIdInput = document.getElementById("municipalityIdInput");
        const municipalityNameInput = document.getElementById("municipalityNameInput");

        // Asignar los valores a los campos ocultos para el envío al servidor
        if (provinceIdInput) {
            provinceIdInput.value = selectedProvince?.id || "";
            console.log('provinceIdInput.value asignado a:', provinceIdInput.value);
        }
        if (provinceNameInput) {
            provinceNameInput.value = selectedProvince?.nm || "";
            console.log('provinceNameInput.value asignado a:', provinceNameInput.value);
        }
        if (municipalityIdInput) {
            municipalityIdInput.value = selectedCity?.id || "";
            console.log('municipalityIdInput.value asignado a:', municipalityIdInput.value);
        }
        if (municipalityNameInput) {
            municipalityNameInput.value = selectedCity?.nm || "";
            console.log('municipalityNameInput.value asignado a:', municipalityNameInput.value);
        }

        // --- Validación de Fotos Final (Tu código original) ---
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
                // Validación para archivos: Multer y el backend se encargarán de esto.
            } else if (uploadTypeUrl && uploadTypeUrl.checked) {
                if (urlInput) {
                    // Validación para URLs: se recomienda realizar una validación más robusta en el backend.
                }
            }
        });
    }, false);