
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar tooltips de Bootstrap
  initializeTooltips();
  // Animación de números en estadísticas
  animateStatNumbers();
  // Efectos de hover mejorados para filas de tabla
  enhanceTableRowEffects();
  // Inicializar efectos de partículas
  initializeParticleEffects();
  // Configurar eventos de modales
  setupModalEvents();
  // Configurar carrusel de reservations si existe
  setupReservationsCarousel();
});

/**
 * Inicializa los tooltips de Bootstrap
 */
function initializeTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  console.log('Tooltips inicializados:', tooltipList.length);
}

/**
 * Anima los números en las estadísticas del hero
 */
function animateStatNumbers() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  statNumbers.forEach(stat => {
    const finalNumber = parseInt(stat.textContent);
    if (!isNaN(finalNumber)) {
      animateNumber(stat, 0, finalNumber, 1500);
    }
  });
}

/**
 * Anima un número desde start hasta end en la duración especificada
 * @param {HTMLElement} element - Elemento a animar
 * @param {number} start - Número inicial
 * @param {number} end - Número final
 * @param {number} duration - Duración en milisegundos
 */
function animateNumber(element, start, end, duration) {
  const startTime = performance.now();
  
  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(start + (end - start) * progress);
    
    element.textContent = current;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };
  
  requestAnimationFrame(update);
}

/**
 * Mejora los efectos de hover para las filas de la tabla
 */
function enhanceTableRowEffects() {
  const tableRows = document.querySelectorAll('.table-row');
  
  tableRows.forEach(row => {
    row.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px) scale(1.01)';
      this.style.transition = 'all 0.3s ease';
    });
    
    row.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
    
    row.addEventListener('mousedown', function() {
      this.style.transform = 'translateY(-1px) scale(0.99)';
    });
    
    row.addEventListener('mouseup', function() {
      this.style.transform = 'translateY(-2px) scale(1.01)';
    });
  });
  
  console.log('Efectos de tabla mejorados aplicados a', tableRows.length, 'filas');
}

/**
 * Inicializa efectos de partículas con movimiento del mouse
 */
function initializeParticleEffects() {
  const particles = document.querySelectorAll('.particle');
  
  if (particles.length === 0) return;
  
  document.addEventListener('mousemove', function(e) {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    particles.forEach((particle, index) => {
      const speed = (index + 1) * 0.3;
      const xPos = (x - 0.5) * speed * 15;
      const yPos = (y - 0.5) * speed * 15;
      
      particle.style.transform = `translate(${xPos}px, ${yPos}px)`;
      particle.style.transition = 'transform 0.1s ease-out';
    });
  });
  
  document.addEventListener('mouseleave', function() {
    particles.forEach(particle => {
      particle.style.transform = 'translate(0px, 0px)';
      particle.style.transition = 'transform 0.5s ease-out';
    });
  });
  
  console.log('Efectos de partículas inicializados para', particles.length, 'partículas');
}

/**
 * Configura eventos específicos para modales
 */
function setupModalEvents() {
  const deleteModals = document.querySelectorAll('[id^="deleteReservationModal-"]');
  deleteModals.forEach(modal => {
    modal.addEventListener('show.bs.modal', function() {
      console.log('Abriendo modal de eliminación');
      this.style.zIndex = '1055';
    });
    
    modal.addEventListener('hide.bs.modal', function() {
      console.log('Cerrando modal de eliminación');
    });
  });
  
  // Eventos para modales de pago
  const paymentModals = document.querySelectorAll('[id^="markPaidModal-"]');
  paymentModals.forEach(modal => {
    modal.addEventListener('show.bs.modal', function() {
      console.log('Abriendo modal de pago');
      this.style.zIndex = '1055';
    });
  });
  
  // Prevenir propagación de clicks en botones de acción
  const actionButtons = document.querySelectorAll('.action-buttons');
  actionButtons.forEach(buttonGroup => {
    buttonGroup.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  });
  
  console.log('Eventos de modales configurados');
}

/**
 * Configura el carrusel de reservations si existe
 */
function setupReservationsCarousel() {
  const carousel = document.querySelector('#reservationsCarousel');
  if (!carousel) return;
  
  const indicators = document.querySelectorAll('.carousel-indicator-modern');
  
  indicators.forEach(indicator => {
    indicator.addEventListener('click', function() {
      indicators.forEach(ind => ind.classList.remove('active'));
      this.classList.add('active');
    });
    
    indicator.addEventListener('mouseenter', function() {
      if (!this.classList.contains('active')) {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.3)';
      }
    });
    
    indicator.addEventListener('mouseleave', function() {
      if (!this.classList.contains('active')) {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '';
      }
    });
  });
  
  // Eventos del carrusel
  carousel.addEventListener('slide.bs.carousel', function(e) {
    // Actualizar indicadores cuando cambie el slide
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === e.to);
    });
  });
  
  console.log('Carrusel de reservations configurado con', indicators.length, 'indicadores');
}

/**
 * Funciones de utilidad para reservations
 */
const ReservationsUtils = {
  /**
   * Formatea una fecha para mostrar
   * @param {string} dateString - Fecha en formato ISO
   * @returns {string} Fecha formateada
   */
  formatDate: function(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },
  
  /**
   * Calcula los días entre dos fechas
   * @param {string} startDate - Fecha de inicio
   * @param {string} endDate - Fecha de fin
   * @returns {number} Número de días
   */
  calculateDays: function(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },
  
  /**
   * Verifica si una reserva está activa (fechas actuales)
   * @param {string} startDate - Fecha de inicio
   * @param {string} endDate - Fecha de fin
   * @returns {boolean} True si está activa
   */
  isActiveReservation: function(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  },
  
  /**
   * Actualiza el estado visual de una fila de reserva
   * @param {HTMLElement} row - Fila de la tabla
   * @param {string} startDate - Fecha de inicio
   * @param {string} endDate - Fecha de fin
   */
  updateRowStatus: function(row, startDate, endDate) {
    if (this.isActiveReservation(startDate, endDate)) {
      row.classList.add('active-reservation');
      row.classList.remove('expired-reservation');
    } else {
      row.classList.add('expired-reservation');
      row.classList.remove('active-reservation');
    }
  }
};

/**
 * Funciones para estadísticas en tiempo real
 */
const ReservationsStats = {
  /**
   * Actualiza las estadísticas del dashboard
   */
  updateStats: function() {
    const rows = document.querySelectorAll('.table-row');
    let confirmedCount = 0;
    let totalRevenue = 0;
    let activeReservations = 0;
    
    rows.forEach(row => {
      const statusBadge = row.querySelector('.status-badge');
      const priceBadge = row.querySelector('.price-badge');
      
      if (statusBadge && statusBadge.classList.contains('status-confirmed')) {
        confirmedCount++;
        
        if (priceBadge) {
          const price = parseFloat(priceBadge.textContent.replace('€', '').replace(',', '.'));
          if (!isNaN(price)) {
            totalRevenue += price;
          }
        }
      }
    });
    
    // Actualizar elementos en el DOM si existen
    const confirmedElement = document.querySelector('.confirmed-count');
    const revenueElement = document.querySelector('.total-revenue');
    
    if (confirmedElement) {
      animateNumber(confirmedElement, parseInt(confirmedElement.textContent) || 0, confirmedCount, 1000);
    }
    
    if (revenueElement) {
      // Animar el revenue
      const currentRevenue = parseFloat(revenueElement.textContent.replace('€', '').replace(',', '.')) || 0;
      this.animateRevenue(revenueElement, currentRevenue, totalRevenue, 1000);
    }
  },
  
  /**
   * Anima el valor de revenue
   * @param {HTMLElement} element - Elemento a animar
   * @param {number} start - Valor inicial
   * @param {number} end - Valor final
   * @param {number} duration - Duración
   */
  animateRevenue: function(element, start, end, duration) {
    const startTime = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = start + (end - start) * progress;
      
      element.textContent = '€' + current.toFixed(2).replace('.', ',');
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    
    requestAnimationFrame(update);
  }
};

// Hacer las utilidades disponibles globalmente
window.ReservationsUtils = ReservationsUtils;
window.ReservationsStats = ReservationsStats;

// Eventos de ventana
window.addEventListener('resize', function() {
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    const actionButtons = document.querySelectorAll('.action-buttons');
    actionButtons.forEach(group => {
      group.style.flexDirection = 'column';
      group.style.gap = '0.25rem';
    });
  } else {
    const actionButtons = document.querySelectorAll('.action-buttons');
    actionButtons.forEach(group => {
      group.style.flexDirection = 'row';
      group.style.gap = '0.5rem';
    });
  }
});

console.log('reservations.js cargado completamente');
