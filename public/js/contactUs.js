document.addEventListener('DOMContentLoaded', function() {
  // Contador de caracteres para el mensaje
  const messageField = document.getElementById('message');
  const messageCharCount = document.getElementById('messageCharCount');
  
  if (messageField && messageCharCount) {
    // Inicializar contador
    messageCharCount.textContent = messageField.value.length;
    
    messageField.addEventListener('input', function() {
      messageCharCount.textContent = this.value.length;
      if (this.value.length > 900) {
        messageCharCount.style.color = '#dc3545';
      } else if (this.value.length > 750) {
        messageCharCount.style.color = '#ffc107';
      } else {
        messageCharCount.style.color = '#6c757d';
      }
    });
  }
  
  // Actualizar barra de progreso
  function updateProgressBar() {
    const sections = document.querySelectorAll('.form-section');
    const totalSections = sections.length;
    let completedSections = 0;
    
    sections.forEach(section => {
      const requiredFields = section.querySelectorAll('[required]');
      let sectionComplete = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          sectionComplete = false;
        }
      });
      
      if (sectionComplete && requiredFields.length > 0) {
        completedSections++;
      }
    });
    
    const progress = (completedSections / totalSections) * 100;
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
      progressBar.style.width = progress + '%';
    }
  }
  
  // Actualizar progreso en tiempo real
  document.addEventListener('input', updateProgressBar);
  document.addEventListener('change', updateProgressBar);
  
  // Validación del formulario
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault(); // Prevenir envío real
      
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
      } else {
        // Simular envío exitoso
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Enviando...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
          submitBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>¡Enviado!';
          submitBtn.classList.remove('btn-primary');
          submitBtn.classList.add('btn-success');
          
          // Mostrar mensaje de éxito
          const successMessage = document.createElement('div');
          successMessage.className = 'alert alert-success mt-3';
          successMessage.innerHTML = `
            <i class="bi bi-check-circle me-2"></i>
            <strong>¡Mensaje enviado correctamente!</strong> Te responderemos en las próximas 24 horas.
          `;
          form.appendChild(successMessage);
          
          // Resetear formulario después de 3 segundos
          setTimeout(() => {
            form.reset();
            form.classList.remove('was-validated');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-success');
            submitBtn.classList.add('btn-primary');
            successMessage.remove();
            updateProgressBar();
          }, 3000);
        }, 2000);
      }
    });
  }
  
  // Inicializar progreso
  updateProgressBar();
  
  // Efecto hover en las cards
  const cards = document.querySelectorAll('.contact-card, .info-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
  
  // Efecto parallax suave para las partículas
  document.addEventListener('mousemove', function(e) {
    const particles = document.querySelectorAll('.particle');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    particles.forEach((particle, index) => {
      const speed = (index + 1) * 0.3;
      const xPos = (x - 0.5) * speed * 15;
      const yPos = (y - 0.5) * speed * 15;
      
      particle.style.transform = `translate(${xPos}px, ${yPos}px)`;
    });
  });
});
