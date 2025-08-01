const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = "running";
    }
  });
}, observerOptions);

document.querySelectorAll(".apartment-card").forEach((card) => {
  observer.observe(card);
});

// Inicialización simple de componentes
document.addEventListener('DOMContentLoaded', function() {
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  document.addEventListener('submit', function(event) {
    if (event.target.classList.contains('delete-form')) {
      event.preventDefault();
      handleApartmentDelete(event);
    }
  });

  document.addEventListener('hidden.bs.modal', function(event) {
    setTimeout(() => {
      cleanupModalBackdrops();
    }, 50);
  });

  cleanupModalBackdrops();

  // Verificar si es resultado de búsqueda IA
  if (typeof isSearchResult !== 'undefined' && isSearchResult === 'true') {
    console.log('🔍 Resultados de búsqueda con IA detectados');
    
    // Reinicializar la paginación para los resultados de búsqueda
    const carousel = document.getElementById('apartmentsCarousel');
    if (carousel) {
      const carouselItems = carousel.querySelectorAll('.carousel-item');
      if (carouselItems.length > 0 && typeof initializeCarouselPagination === 'function') {
        initializeCarouselPagination('apartmentsCarousel', carouselItems.length);
      }
    }
    
    const catalogHeader = document.querySelector('.catalog-header');
    if (catalogHeader && !document.querySelector('.search-results-info')) {
      const searchInfo = document.createElement('div');
      searchInfo.className = 'search-results-info alert alert-info d-flex align-items-center justify-content-between mt-3';
      searchInfo.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="bi bi-robot me-2"></i>
          <span>Resultados de búsqueda inteligente</span>
        </div>
        <div>
          <a href="/" class="btn btn-outline-primary btn-sm me-2">
            <i class="bi bi-arrow-left me-1"></i>Nueva búsqueda
          </a>
          <a href="/apartments" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-grid me-1"></i>Ver todos
          </a>
        </div>
      `;
      catalogHeader.appendChild(searchInfo);
    }
  }
});

// Función simplificada para manejar eliminación de apartamentos
function handleApartmentDelete(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  
  submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Eliminando...';
  submitBtn.disabled = true;
  
  fetch(form.action, {
    method: 'POST',
    body: formData,
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
  })
  .then(response => {
    if (response.ok) {
      const modal = form.closest('.modal');
      if (modal) {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
          modalInstance.hide();
        }
        
        modal.classList.remove('show');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
      }
      
      cleanupModalBackdrops();
      
      if (typeof buscarApartamentos === 'function' && window.lastSearchParams) {
        fetch('/apartments/search?' + window.lastSearchParams, {
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(res => res.text())
        .then(html => {
          const partial = document.getElementById('apartmentsPartial') || document.getElementById('apartmentsContainer');
          if (partial) {
            partial.innerHTML = html;
            
            setTimeout(() => {
              cleanupModalBackdrops();
              
              if (typeof initializeCarouselPagination === 'function') {
                initializeCarouselPagination();
              }
              if (typeof reinitializeComponents === 'function') {
                reinitializeComponents();
              }
            }, 100);
          }
        })
        .catch(() => {
          cleanupModalBackdrops();
          setTimeout(() => window.location.reload(), 500);
        });
      } else {
        cleanupModalBackdrops();
        setTimeout(() => window.location.reload(), 500);
      }
    } else {
      alert('Error al eliminar el apartamento.');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  })
  .catch(error => {
    alert('Error al eliminar el apartamento.');
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  });
}

// Función específica para limpiar backdrops de modales
function cleanupModalBackdrops() {
  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach(backdrop => {
    backdrop.remove();
  });
  
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  
  document.querySelectorAll('.modal.show').forEach(modal => {
    modal.classList.remove('show');
    modal.style.display = '';
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
  });
  
  const overlays = document.querySelectorAll('.modal-backdrop, .fade');
  overlays.forEach(overlay => {
    if (overlay.classList.contains('modal-backdrop')) {
      overlay.remove();
    }
  });
}

// Función simple para reinicializar componentes después de cargas AJAX
function reinitializeComponents() {
  cleanupModalBackdrops();
  
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    var existingTooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
    if (existingTooltip) {
      existingTooltip.dispose();
    }
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  document.querySelectorAll(".apartment-card").forEach((card) => {
    observer.observe(card);
  });
}

window.reinitializeComponents = reinitializeComponents;
window.handleApartmentDelete = handleApartmentDelete;
window.cleanupModalBackdrops = cleanupModalBackdrops;
