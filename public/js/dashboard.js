document.addEventListener('DOMContentLoaded', function() {
  // Navegación del sidebar
  const navLinks = document.querySelectorAll('.modern-nav-link[data-section]');
  const sections = document.querySelectorAll('.dashboard-section');
  
  // Función para mostrar sección
  function showSection(sectionId) {
    sections.forEach(section => {
      if (section.id === sectionId) {
        section.style.display = 'block';
        section.style.animation = 'fadeInUp 0.6s ease-out';
      } else {
        section.style.display = 'none';
      }
    });
    
    // Actualizar enlaces activos
    navLinks.forEach(link => {
      if (link.dataset.section === sectionId.replace('-section', '')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  // Event listeners para navegación
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const sectionId = this.dataset.section + '-section';
      showSection(sectionId);
      
      // Smooth scroll
      document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  });
  
  // Mostrar sección inicial
  showSection('profile-section');
  
  // Inicializar filtro de reservas por defecto a "Recibidas"
  if (typeof filterReservations === 'function') {
    filterReservations('received');
  }
  
  // Filtros de reservas
  window.filterReservations = function(filter) {
    const rows = document.querySelectorAll('.reservation-row');
    const filterButtons = document.querySelectorAll('.filter-buttons .btn');
    
    // Actualizar botones activos
    filterButtons.forEach(btn => {
      btn.classList.remove('active');
      if ((filter === 'received' && btn.textContent.toLowerCase().includes('recibidas')) || 
          (filter === 'made' && btn.textContent.toLowerCase().includes('realizadas'))) {
        btn.classList.add('active');
      }
    });
    
    // Filtrar filas según el tipo de reserva
    rows.forEach(row => {
      const reservationType = row.dataset.type; // 'made' o 'received'
      
      if (filter === reservationType) {
        row.style.display = '';
        row.style.animation = 'fadeInUp 0.4s ease-out';
      } else {
        row.style.display = 'none';
      }
    });
  };
  
  // Inicializar tooltips
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Efectos de loading en formularios
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function() {
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Procesando...';
        submitBtn.disabled = true;
        
        // Restaurar después de 5 segundos si no hay redirección
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }, 5000);
      }
    });
  });
  
  // Animación de estadísticas
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statNumbers = entry.target.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
          const finalNumber = parseInt(stat.textContent);
          if (!isNaN(finalNumber)) {
            animateNumber(stat, 0, finalNumber, 1500);
          }
        });
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observar secciones de estadísticas
  const statSections = document.querySelectorAll('.apartments-stats, .reservations-stats');
  statSections.forEach(section => {
    observer.observe(section);
  });
  
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
  
  // Smooth scroll para enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Auto-refresh de estadísticas (simulado)
  function refreshStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
      const currentValue = parseInt(stat.textContent);
      if (!isNaN(currentValue) && Math.random() > 0.8) {
        const change = Math.floor(Math.random() * 3) - 1; // -1 a +1
        const newValue = Math.max(0, currentValue + change);
        stat.textContent = newValue;
        
        // Efecto visual
        stat.style.color = change > 0 ? '#198754' : change < 0 ? '#dc3545' : '';
        setTimeout(() => {
          stat.style.color = '';
        }, 1000);
      }
    });
  }
  
  // Refresh cada 60 segundos
  setInterval(refreshStats, 60000);
});

// Función para mostrar modal de confirmación para restablecer
function resetSettingsForm() {
  const resetModal = new bootstrap.Modal(document.getElementById('resetSettingsModal'));
  resetModal.show();
}

// Función para confirmar el restablecimiento
function confirmResetSettings() {
  document.getElementById('settingsForm').reset();
  const resetModal = bootstrap.Modal.getInstance(document.getElementById('resetSettingsModal'));
  resetModal.hide();
  
  // Mostrar notificación de éxito
  showNotification('Formulario restablecido correctamente', 'success');
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  notification.innerHTML = `
    <i class="bi bi-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove después de 3 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
}
