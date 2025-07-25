document.addEventListener("DOMContentLoaded", () => {
  // Inicializar tooltips
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (el) {
    return new bootstrap.Tooltip(el);
  });
  
  // Navegación directa a pestañas
  if (window.location.hash === "#reservation") {
    const tabElement = document.querySelector('button[data-bs-target="#reservation"]');
    if (tabElement) {
      const tab = new bootstrap.Tab(tabElement);
      tab.show();
    }
  }
  
  // Configuración del calendario
  const reservations = window.reservationsData || [];
  const events = reservations.map(res => {
    const startDate = new Date(res.startDate).toISOString().split('T')[0];
    const endDate = new Date(new Date(res.endDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return {
      start: startDate,
      end: endDate,
      display: 'background',
      backgroundColor: 'rgba(220, 53, 69, 0.3)',
      borderColor: 'rgba(220, 53, 69, 0.5)'
    };
  });
  
  // Inicializar FullCalendar
  const calendarEl = document.getElementById('calendar');
  if (calendarEl) {
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth'
      },
      events: events,
      height: 'auto',
      locale: 'es',
      firstDay: 1,
      buttonText: {
        today: 'Hoy',
        month: 'Mes'
      },
      dayHeaderFormat: { weekday: 'short' }
    });
    
    calendar.render();
    
    // Redimensionar calendario al mostrar la pestaña
    const reservationTab = document.querySelector('#reservation-tab');
    if (reservationTab) {
      reservationTab.addEventListener('shown.bs.tab', () => {
        setTimeout(() => {
          calendar.updateSize();
        }, 100);
      });
    }
  }
  
  // Efectos de loading en formularios
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function() {
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Procesando...';
        submitBtn.disabled = true;
        
        // Restaurar después de 5 segundos si no hay redirección
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }, 5000);
      }
    });
  });
  
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
});
