/* ========== USERS.JS - JAVASCRIPT ESPECÍFICO PARA GESTIÓN DE USUARIOS ========== */

// Función para manejar modales de eliminación de usuarios
function initializeUserModals() {
  // Encontrar todos los botones de eliminación
  const deleteButtons = document.querySelectorAll('[data-bs-target*="deleteUserModal"]');
  
  deleteButtons.forEach((button) => {
    const targetModalId = button.getAttribute('data-bs-target');
    const targetModal = document.querySelector(targetModalId);
    
    if (!targetModal) {
      return;
    }
    
    // Remover cualquier event listener previo
    button.removeEventListener('click', handleDeleteButtonClick);
    
    // Agregar nuevo event listener
    button.addEventListener('click', function(e) {
      handleDeleteButtonClick(e, targetModal, targetModalId);
    });
  });
}

// Manejador de clicks en botones de eliminación
function handleDeleteButtonClick(event, modalElement, modalId) {
  event.preventDefault();
  event.stopPropagation();
  
  try {
    // Método 1: Usar Bootstrap Modal API
    let modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) {
      modal = new bootstrap.Modal(modalElement, {
        backdrop: true,
        keyboard: true,
        focus: true
      });
    }
    
    // Intentar mostrar el modal
    modal.show();
    
    // Verificar después de un momento si se mostró
    setTimeout(() => {
      if (!modalElement.classList.contains('show')) {
        forceShowModal(modalElement);
      }
    }, 100);
    
  } catch (error) {
    forceShowModal(modalElement);
  }
}

// Función para forzar la aparición del modal manualmente
function forceShowModal(modalElement) {
  // Asegurar que el modal esté visible
  modalElement.style.display = 'block';
  modalElement.style.zIndex = '9999';
  modalElement.classList.add('show');
  modalElement.classList.remove('fade');
  modalElement.setAttribute('aria-hidden', 'false');
  modalElement.setAttribute('aria-modal', 'true');
  
  // Agregar clase modal-open al body
  document.body.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  
  // Crear backdrop manualmente si no existe
  let backdrop = document.querySelector('.modal-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.style.zIndex = '9998';
    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = '0';
    backdrop.style.width = '100vw';
    backdrop.style.height = '100vh';
    backdrop.style.backgroundColor = '#000';
    backdrop.style.opacity = '0.5';
    document.body.appendChild(backdrop);
  }
  
  // Agregar event listeners para cerrar el modal
  setupModalCloseEvents(modalElement, backdrop);
}

// Configurar eventos para cerrar el modal
function setupModalCloseEvents(modalElement, backdrop) {
  // Botón de cerrar (X) y botones Cancelar
  const closeButtons = modalElement.querySelectorAll('[data-bs-dismiss="modal"], .btn-close, .btn-outline-secondary');
  closeButtons.forEach(button => {
    // Remover listeners previos
    button.removeEventListener('click', closeModalHandler);
    
    // Agregar nuevo listener
    button.addEventListener('click', closeModalHandler);
  });
  
  // Función manejadora de cierre
  function closeModalHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Si es un botón de formulario, prevenir el submit
    if (e.target.form) {
      e.target.form.onsubmit = null;
    }
    
    closeModalManually(modalElement, backdrop);
  }
  
  // Click en backdrop para cerrar
  if (backdrop) {
    backdrop.removeEventListener('click', backdropClickHandler);
    backdrop.addEventListener('click', backdropClickHandler);
  }
  
  function backdropClickHandler(e) {
    if (e.target === backdrop) {
      closeModalManually(modalElement, backdrop);
    }
  }
  
  // Tecla Escape
  const escapeHandler = function(e) {
    if (e.key === 'Escape' && modalElement.classList.contains('show')) {
      closeModalManually(modalElement, backdrop);
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  
  document.addEventListener('keydown', escapeHandler);
  
  // Configurar formulario de eliminación
  const deleteForm = modalElement.querySelector('form[action*="/admin/user/delete/"]');
  if (deleteForm) {
    deleteForm.removeEventListener('submit', handleDeleteSubmit);
    deleteForm.addEventListener('submit', handleDeleteSubmit);
  }
}

// Manejador para envío del formulario de eliminación
function handleDeleteSubmit(e) {
  const form = e.target;
  const submitButton = form.querySelector('button[type="submit"]');
  
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Eliminando...';
  }
}

// Función para cerrar el modal manualmente
function closeModalManually(modalElement, backdrop) {
  // Intentar usar Bootstrap Modal API primero
  try {
    const bsModal = bootstrap.Modal.getInstance(modalElement);
    if (bsModal) {
      bsModal.hide();
      return;
    }
  } catch (error) {
    // Si falla, usar método manual
  }
  
  // Método manual de cierre
  modalElement.style.display = 'none';
  modalElement.classList.remove('show');
  modalElement.classList.add('fade');
  modalElement.setAttribute('aria-hidden', 'true');
  modalElement.removeAttribute('aria-modal');
  
  // Remover backdrop
  if (backdrop && backdrop.parentNode) {
    backdrop.parentNode.removeChild(backdrop);
  }
  
  // Buscar y remover cualquier backdrop existente
  const existingBackdrops = document.querySelectorAll('.modal-backdrop');
  existingBackdrops.forEach(bd => {
    if (bd.parentNode) {
      bd.parentNode.removeChild(bd);
    }
  });
  
  // Remover clase modal-open del body
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

// Inicialización cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
  // Esperar un poco antes de inicializar para asegurar que todos los elementos estén cargados
  setTimeout(() => {
    initializeUserModals();
    
    // Configurar eventos adicionales para botones cancelar
    const cancelButtons = document.querySelectorAll('.btn-outline-secondary[data-bs-dismiss="modal"]');
    cancelButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Encontrar el modal padre
        const modal = button.closest('.modal');
        if (modal) {
          // Cerrar usando Bootstrap API
          try {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
              bsModal.hide();
            } else {
              closeModalManually(modal, null);
            }
          } catch (error) {
            closeModalManually(modal, null);
          }
        }
      });
    });
  }, 500);
});

// Reinicializar después de cambios dinámicos
function reinitializeUserModals() {
  setTimeout(() => {
    initializeUserModals();
  }, 200);
}

// Exponer función globalmente para uso desde otros scripts
window.reinitializeUserModals = reinitializeUserModals;
