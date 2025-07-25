// Efecto de hover mejorado para las cards de opciones
document.querySelectorAll('.option-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-5px) scale(1.05)';
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0) scale(1)';
  });
});

// Animación de entrada escalonada para las opciones
document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.option-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 1200 + (index * 100));
  });
});

// Efecto de parallax suave en el fondo
document.addEventListener('mousemove', function(e) {
  const container = document.querySelector('.container');
  const x = (e.clientX / window.innerWidth - 0.5) * 5;
  const y = (e.clientY / window.innerHeight - 0.5) * 5;
  
  container.style.transform = `translate(${x}px, ${y}px)`;
});
