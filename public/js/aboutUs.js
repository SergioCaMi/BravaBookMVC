document.addEventListener('DOMContentLoaded', function() {
  // Animación de entrada escalonada para las cards
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll('.tech-card, .feature-card, .arch-card, .modern-card');
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.style.animation = 'fadeInUp 0.6s ease-out forwards';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          }, index * 100);
        });
      }
    });
  }, observerOptions);

  // Observar todas las secciones
  document.querySelectorAll('.tech-section').forEach(section => {
    observer.observe(section);
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
