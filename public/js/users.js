
function reinitializeUsersComponents() {
  if (typeof reinitializeBootstrapComponents === 'function') {
    reinitializeBootstrapComponents();
  }
  
  // Modals
  setTimeout(() => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (!bootstrap.Modal.getInstance(modal)) {
        new bootstrap.Modal(modal);
      }
    });
    
    const modalButtons = document.querySelectorAll('[data-bs-toggle="modal"]');
    console.log('Found modal buttons:', modalButtons.length);
    
    modalButtons.forEach(button => {
      const targetSelector = button.getAttribute('data-bs-target');
      console.log('Modal button target:', targetSelector);
      
      if (targetSelector) {
        button.removeEventListener('click', handleUserModalClick);
        button.addEventListener('click', handleUserModalClick);
        
        const targetModal = document.querySelector(targetSelector);
        if (!targetModal) {
          console.error('Modal target not found:', targetSelector);
        } else {
          console.log('Modal target found:', targetModal);
        }
      }
    });
  }, 200);
}

function handleUserModalClick(event) {
  event.preventDefault();
  event.stopPropagation();
  
  const button = event.currentTarget;
  const targetSelector = button.getAttribute('data-bs-target');
  
  console.log('Modal button clicked:', targetSelector);
  
  if (targetSelector) {
    const targetModal = document.querySelector(targetSelector);
    if (targetModal) {
      console.log('Modal found, showing:', targetModal);
      
      let modal = bootstrap.Modal.getInstance(targetModal);
      if (!modal) {
        modal = new bootstrap.Modal(targetModal, {
          backdrop: true,
          keyboard: true,
          focus: true
        });
      }
      
      modal.show();
      
      setTimeout(() => {
        if (!targetModal.classList.contains('show')) {
          console.error('Modal failed to show, forcing display');
          targetModal.style.display = 'block';
          targetModal.classList.add('show');
          document.body.classList.add('modal-open');
          
          if (!document.querySelector('.modal-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            backdrop.style.zIndex = '2050';
            document.body.appendChild(backdrop);
          }
        }
      }, 100);
      
    } else {
      console.error('Modal not found:', targetSelector);
    }
  }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing users components');
  setTimeout(() => {
    reinitializeUsersComponents();
  }, 1000);
});

// También reinicializar después de búsquedas con IA
window.reinitializeUsersComponents = reinitializeUsersComponents;

// Función para manejar modales de eliminación de usuarios
function initializeUserModals() {
  const deleteButtons = document.querySelectorAll('[data-bs-target*="deleteUserModal"]');
  
  deleteButtons.forEach((button) => {
    const targetModalId = button.getAttribute('data-bs-target');
    const targetModal = document.querySelector(targetModalId);
    
    if (!targetModal) {
      return;
    }
    
    button.removeEventListener('click', handleDeleteButtonClick);
    
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
    let modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) {
      modal = new bootstrap.Modal(modalElement, {
        backdrop: true,
        keyboard: true,
        focus: true
      });
    }
    
    modal.show();
    
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
  modalElement.style.display = 'block';
  modalElement.style.zIndex = '9999';
  modalElement.classList.add('show');
  modalElement.classList.remove('fade');
  modalElement.setAttribute('aria-hidden', 'false');
  modalElement.setAttribute('aria-modal', 'true');
  
  document.body.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  
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
  
  setupModalCloseEvents(modalElement, backdrop);
}

function setupModalCloseEvents(modalElement, backdrop) {
  const closeButtons = modalElement.querySelectorAll('[data-bs-dismiss="modal"], .btn-close, .btn-outline-secondary');
  closeButtons.forEach(button => {
    button.removeEventListener('click', closeModalHandler);
    
    button.addEventListener('click', closeModalHandler);
  });
  
  function closeModalHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.target.form) {
      e.target.form.onsubmit = null;
    }
    
    closeModalManually(modalElement, backdrop);
  }
  
  if (backdrop) {
    backdrop.removeEventListener('click', backdropClickHandler);
    backdrop.addEventListener('click', backdropClickHandler);
  }
  
  function backdropClickHandler(e) {
    if (e.target === backdrop) {
      closeModalManually(modalElement, backdrop);
    }
  }
  
  const escapeHandler = function(e) {
    if (e.key === 'Escape' && modalElement.classList.contains('show')) {
      closeModalManually(modalElement, backdrop);
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  
  document.addEventListener('keydown', escapeHandler);
  
  const deleteForm = modalElement.querySelector('form[action*="/admin/user/delete/"]');
  if (deleteForm) {
    deleteForm.removeEventListener('submit', handleDeleteSubmit);
    deleteForm.addEventListener('submit', handleDeleteSubmit);
  }
}

function handleDeleteSubmit(e) {
  const form = e.target;
  const submitButton = form.querySelector('button[type="submit"]');
  
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Eliminando...';
  }
}

function closeModalManually(modalElement, backdrop) {
  try {
    const bsModal = bootstrap.Modal.getInstance(modalElement);
    if (bsModal) {
      bsModal.hide();
      return;
    }
  } catch (error) {
  }
  
  modalElement.style.display = 'none';
  modalElement.classList.remove('show');
  modalElement.classList.add('fade');
  modalElement.setAttribute('aria-hidden', 'true');
  modalElement.removeAttribute('aria-modal');
  
  if (backdrop && backdrop.parentNode) {
    backdrop.parentNode.removeChild(backdrop);
  }
  
  const existingBackdrops = document.querySelectorAll('.modal-backdrop');
  existingBackdrops.forEach(bd => {
    if (bd.parentNode) {
      bd.parentNode.removeChild(bd);
    }
  });
  
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    initializeUserModals();
    
    const cancelButtons = document.querySelectorAll('.btn-outline-secondary[data-bs-dismiss="modal"]');
    cancelButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const modal = button.closest('.modal');
        if (modal) {
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

function reinitializeUserModals() {
  setTimeout(() => {
    initializeUserModals();
  }, 200);
}

window.reinitializeUserModals = reinitializeUserModals;
