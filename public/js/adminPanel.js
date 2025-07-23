document.addEventListener('DOMContentLoaded', function() {
  // Animación de números en estadísticas
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statNumbers = entry.target.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
          const finalNumber = parseInt(stat.textContent.replace(/,/g, ''));
          if (!isNaN(finalNumber)) {
            animateNumber(stat, 0, finalNumber, 2000);
          }
        });
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observar secciones de estadísticas
  const statSections = document.querySelectorAll('.admin-stats, .quick-stats, .apartment-stats, .reservation-stats');
  statSections.forEach(section => {
    observer.observe(section);
  });
  
  function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const originalText = element.textContent;
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      
      // Mantener formato con comas
      element.textContent = current.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  }
  
  // Efectos de hover mejorados para tarjetas
  const adminCards = document.querySelectorAll('.admin-card');
  adminCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
  
  // Efectos de click en botones
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      // Crear efecto ripple
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
  
  // Actualizar estadísticas en tiempo real (simulado)
  function updateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
      const currentValue = parseInt(stat.textContent.replace(/,/g, ''));
      if (!isNaN(currentValue) && Math.random() > 0.7) {
        const change = Math.floor(Math.random() * 5) - 2; // -2 a +2
        const newValue = Math.max(0, currentValue + change);
        stat.textContent = newValue.toLocaleString();
        
        // Efecto visual de cambio
        stat.style.color = change > 0 ? '#198754' : change < 0 ? '#dc3545' : '';
        setTimeout(() => {
          stat.style.color = '';
        }, 1000);
      }
    });
  }
  
  // Actualizar estadísticas cada 30 segundos
  setInterval(updateStats, 30000);
});
