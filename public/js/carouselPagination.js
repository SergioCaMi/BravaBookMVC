/**
 * Sistema de paginación personalizada para carruseles
 * Compatible con users.ejs, reservations.ejs y seeApartments.ejs
 */

// Variables globales para el estado de la paginación
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
  });
}

/**
 * Navega a una página específica del carrusel
 * @param {number} pageIndex - Índice de la página (0-based)
 */
function navigateToPage(pageIndex) {
  if (pageIndex < 0 || pageIndex >= totalPages) return;
  
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;
  
  // Usar Bootstrap carousel para navegar
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
  // Detectar el tipo de vista basado en el ID del carrusel
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
  // Intentar obtener el total desde elementos en la página
  const totalElement = document.querySelector('[data-total-items]');
  if (totalElement) {
    return parseInt(totalElement.dataset.totalItems);
  }
  
  // Fallback: calcular basado en las páginas y elementos por página
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
    // Solo activar si no hay inputs enfocados
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

// Exportar funciones para uso global
window.initializeCarouselPagination = initializeCarouselPagination;
window.reinitializePagination = reinitializePagination;
window.navigateToPage = navigateToPage;
window.updatePaginationState = updatePaginationState;

// Auto-inicializar en páginas compatibles
document.addEventListener('DOMContentLoaded', function() {
  // Detectar automáticamente el carrusel y inicializar
  const carousel = document.querySelector('[id$="Carousel"]');
  if (carousel) {
    const carouselItems = carousel.querySelectorAll('.carousel-item');
    if (carouselItems.length > 0) {
      initializeCarouselPagination(carousel.id, carouselItems.length);
      
      // Opcional: activar navegación por teclado
      // setupKeyboardNavigation();
    }
  }
});
