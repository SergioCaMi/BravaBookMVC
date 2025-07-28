
let currentPageIndex = 0;
let totalPages = 0;
let carouselId = '';

/**
 * Inicializa el sistema de paginación personalizada
 * @param {string} id - ID del carrusel
 * @param {number} total - Número total de páginas
 */
function initializeCarouselPagination(id = 'usersCarousel', total = 1) {
  carouselId = id;
  totalPages = total;
  currentPageIndex = 0;
  // Configurar los event listeners para los botones de paginación
  setupPaginationListeners();
  // Configurar listeners para eventos de Bootstrap Carousel
  setupCarouselListeners();
  // Actualizar estado inicial
  updatePaginationState();
  // Inicializar componentes Bootstrap
  reinitializeBootstrapComponents();
}

/**
 * Función global para reinicializar todos los componentes
 * Se puede llamar desde cualquier script que modifique el DOM
 */
function reinitializeAllComponents() {
  const carousels = ['usersCarousel', 'reservationsCarousel', 'apartmentsCarousel'];
  for (let carouselIdToCheck of carousels) {
    const carousel = document.getElementById(carouselIdToCheck);
    if (carousel) {
      // Obtener el número total de páginas
      const totalPagesElement = document.getElementById('totalPagesCount');
      const total = totalPagesElement ? parseInt(totalPagesElement.textContent) : 1;
      // Inicializar la paginación para este carrusel
      initializeCarouselPagination(carouselIdToCheck, total);
      break;
    }
  }
  reinitializeBootstrapComponents();
}

/**
 * Configura los event listeners para los botones de paginación personalizada
 */
function setupPaginationListeners() {
  // Botón retroceder 5 páginas
  const minus5Btn = document.getElementById('pageIndicatorMinus5');
  if (minus5Btn) {
    minus5Btn.addEventListener('click', () => navigateToPage(Math.max(0, currentPageIndex - 5)));
  }
  
  // Botón retroceder 1 página
  const minus1Btn = document.getElementById('pageIndicatorMinus1');
  if (minus1Btn) {
    minus1Btn.addEventListener('click', () => navigateToPage(Math.max(0, currentPageIndex - 1)));
  }
  
  // Botón página actual (no hace nada, pero podría mostrar un dropdown con todas las páginas)
  const currentBtn = document.getElementById('pageIndicatorCurrent');
  if (currentBtn) {
    currentBtn.addEventListener('click', () => {
      // Opcional: mostrar dropdown con todas las páginas
      console.log(`Página actual: ${currentPageIndex + 1} de ${totalPages}`);
    });
  }
  
  // Botón avanzar 1 página
  const plus1Btn = document.getElementById('pageIndicatorPlus1');
  if (plus1Btn) {
    plus1Btn.addEventListener('click', () => navigateToPage(Math.min(totalPages - 1, currentPageIndex + 1)));
  }
  
  // Botón avanzar 5 páginas
  const plus5Btn = document.getElementById('pageIndicatorPlus5');
  if (plus5Btn) {
    plus5Btn.addEventListener('click', () => navigateToPage(Math.min(totalPages - 1, currentPageIndex + 5)));
  }
}

/**
 * Configura los listeners para eventos del carrusel de Bootstrap
 */
function setupCarouselListeners() {
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;
  
  // Listener para cuando el carrusel se desliza
  carousel.addEventListener('slid.bs.carousel', function(event) {
    currentPageIndex = event.to;
    updatePaginationState();
    
    // Reinicializar componentes Bootstrap después del cambio de página
    reinitializeBootstrapComponents();
  });
}

/**
 * Reinicializa componentes de Bootstrap después de cambio de página del carrusel
 * Esto es necesario porque cuando el carrusel cambia de página, 
 * los elementos del DOM se recrean y Bootstrap pierde las referencias
 */
function reinitializeBootstrapComponents() {
  // Pequeño delay para asegurar que el DOM se ha actualizado
  setTimeout(() => {
    try {
      // Reinicializar tooltips
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        if (!bootstrap.Tooltip.getInstance(tooltipTriggerEl)) {
          new bootstrap.Tooltip(tooltipTriggerEl);
        }
      });

      // Reinicializar modales 
      const modalTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="modal"]'));
      modalTriggerList.forEach(function (modalTriggerEl) {
        // Verificar que el modal target existe en el DOM
        const targetSelector = modalTriggerEl.getAttribute('data-bs-target');
        if (targetSelector && document.querySelector(targetSelector)) {
          // Limpiar event listeners previos para evitar duplicados
          modalTriggerEl.removeEventListener('click', handleModalClick);
          // Agregar event listener actualizado
          modalTriggerEl.addEventListener('click', handleModalClick);
          // También forzar la inicialización de Bootstrap
          const targetModal = document.querySelector(targetSelector);
          if (targetModal && !bootstrap.Modal.getInstance(targetModal)) {
            new bootstrap.Modal(targetModal);
          }
        }
      });

      console.log('Bootstrap components reinitialized after carousel slide');
    } catch (error) {
      console.error('Error reinitializing Bootstrap components:', error);
    }
  }, 100);
}

/**
 * Manejador de clicks para botones de modal
 * Asegura que los modales se abran correctamente
 */
function handleModalClick(event) {
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
        modal = new bootstrap.Modal(targetModal);
      }
      
      modal.show();
    } else {
      console.error('Modal not found:', targetSelector);
      const allModals = document.querySelectorAll('.modal');
      console.log('Available modals:', Array.from(allModals).map(m => m.id));
    }
  }
}

/**
 * Configurar un observer para detectar cambios en el DOM
 * Útil para cuando se agregan elementos dinámicamente
 */
function setupDOMObserver() {
  const observer = new MutationObserver(function(mutations) {
    let shouldReinitialize = false;
    
    mutations.forEach(function(mutation) {
      // Verificar si se agregaron nodos con data-bs-toggle
      if (mutation.type === 'childList') {
        const addedNodes = Array.from(mutation.addedNodes);
        addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const hasModalTriggers = node.querySelectorAll && node.querySelectorAll('[data-bs-toggle="modal"]').length > 0;
            const isModalTrigger = node.getAttribute && node.getAttribute('data-bs-toggle') === 'modal';
            
            if (hasModalTriggers || isModalTrigger) {
              shouldReinitialize = true;
            }
          }
        });
      }
    });
    
    if (shouldReinitialize) {
      console.log('DOM changes detected, reinitializing Bootstrap components');
      reinitializeBootstrapComponents();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
}

/**
 * Navega a una página específica del carrusel
 * @param {number} pageIndex - Índice de la página (0-based)
 */
function navigateToPage(pageIndex) {
  if (pageIndex < 0 || pageIndex >= totalPages) return;
  
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;
  
  const bsCarousel = bootstrap.Carousel.getInstance(carousel) || new bootstrap.Carousel(carousel);
  bsCarousel.to(pageIndex);
}

/**
 * Actualiza el estado visual de los botones de paginación
 */
function updatePaginationState() {
  // Actualizar número de página actual
  const currentBtn = document.getElementById('pageIndicatorCurrent');
  if (currentBtn) {
    currentBtn.textContent = currentPageIndex + 1;
  }
  
  // Actualizar estado de botones de retroceso
  const minus5Btn = document.getElementById('pageIndicatorMinus5');
  const minus1Btn = document.getElementById('pageIndicatorMinus1');
  
  if (minus5Btn) {
    minus5Btn.disabled = currentPageIndex < 5;
    minus5Btn.classList.toggle('disabled', currentPageIndex < 5);
  }
  
  if (minus1Btn) {
    minus1Btn.disabled = currentPageIndex === 0;
    minus1Btn.classList.toggle('disabled', currentPageIndex === 0);
  }
  
  // Actualizar estado de botones de avance
  const plus1Btn = document.getElementById('pageIndicatorPlus1');
  const plus5Btn = document.getElementById('pageIndicatorPlus5');
  
  if (plus1Btn) {
    plus1Btn.disabled = currentPageIndex === totalPages - 1;
    plus1Btn.classList.toggle('disabled', currentPageIndex === totalPages - 1);
  }
  
  if (plus5Btn) {
    plus5Btn.disabled = currentPageIndex >= totalPages - 5;
    plus5Btn.classList.toggle('disabled', currentPageIndex >= totalPages - 5);
  }
  
  // Actualizar información de paginación si existe
  updatePaginationInfo();
}

/**
 * Actualiza la información de paginación (ej: "Página 1 de 5")
 */
function updatePaginationInfo() {
  const paginationInfo = document.querySelector('.pagination-info');
  if (paginationInfo) {
    const itemsPerPage = getItemsPerPage();
    const startItem = (currentPageIndex * itemsPerPage) + 1;
    const endItem = Math.min((currentPageIndex + 1) * itemsPerPage, getTotalItems());
    const totalItems = getTotalItems();
    
    paginationInfo.innerHTML = `
      <small class="text-muted">
        <i class="bi bi-info-circle me-1"></i>
        Mostrando <strong>${startItem}-${endItem}</strong> de <strong>${totalItems}</strong> elementos
      </small>
    `;
  }
}

/**
 * Obtiene el número de elementos por página según el contexto
 * @returns {number} Número de elementos por página
 */
function getItemsPerPage() {
  switch (carouselId) {
    case 'usersCarousel':
    case 'reservationsCarousel':
      return 20;
    case 'apartmentsCarousel':
      return 12;
    default:
      return 20;
  }
}

/**
 * Obtiene el número total de elementos
 * @returns {number} Número total de elementos
 */
function getTotalItems() {
  const totalElement = document.querySelector('[data-total-items]');
  if (totalElement) {
    return parseInt(totalElement.dataset.totalItems);
  }
  
  return totalPages * getItemsPerPage();
}

/**
 * Reinicializa la paginación después de cambios AJAX
 * @param {string} newCarouselId - Nuevo ID del carrusel
 * @param {number} newTotalPages - Nuevo número total de páginas
 */
function reinitializePagination(newCarouselId, newTotalPages) {
  if (newCarouselId && newTotalPages) {
    initializeCarouselPagination(newCarouselId, newTotalPages);
  }
}

/**
 * Función para keyboard navigation (opcional)
 */
function setupKeyboardNavigation() {
  document.addEventListener('keydown', function(event) {
    if (document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA') {
      return;
    }
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        navigateToPage(Math.max(0, currentPageIndex - 1));
        break;
      case 'ArrowRight':
        event.preventDefault();
        navigateToPage(Math.min(totalPages - 1, currentPageIndex + 1));
        break;
      case 'Home':
        event.preventDefault();
        navigateToPage(0);
        break;
      case 'End':
        event.preventDefault();
        navigateToPage(totalPages - 1);
        break;
    }
  });
}

// Exportar funciones 
window.initializeCarouselPagination = initializeCarouselPagination;
window.reinitializePagination = reinitializePagination;
window.navigateToPage = navigateToPage;
window.updatePaginationState = updatePaginationState;
window.reinitializeAllComponents = reinitializeAllComponents;
window.reinitializeBootstrapComponents = reinitializeBootstrapComponents;

// Auto-inicializar en páginas compatibles
document.addEventListener('DOMContentLoaded', function() {
  // Pequeño delay para asegurar que Bootstrap esté cargado
  setTimeout(() => {
    reinitializeAllComponents();
  }, 500);
});
