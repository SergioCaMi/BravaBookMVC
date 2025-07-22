document.addEventListener('DOMContentLoaded', () => {
  const { carouselId, totalPages, currentPage } = window.paginationConfig;
  let currentIndex = currentPage;

  const carousel = document.getElementById(carouselId);
  if (!carousel) return console.error(`No se encontró el carrusel con id ${carouselId}`);

  const carouselInstance = bootstrap.Carousel.getOrCreateInstance(carousel);

  const pageButtons = document.querySelectorAll('.page-btn');
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const jumpBackBtn = document.getElementById('jumpBackBtn');
  const jumpForwardBtn = document.getElementById('jumpForwardBtn');

  function updateButtons() {
    pageButtons.forEach((btn) => {
      const page = parseInt(btn.dataset.index);
      const visible = Math.abs(page - currentIndex) <= 2;
      btn.classList.toggle('d-none', !visible);

      btn.classList.remove('btn-primary', 'text-white');
      btn.classList.add('btn-outline-primary');

      if (page === currentIndex) {
        btn.classList.replace('btn-outline-primary', 'btn-primary');
        btn.classList.add('text-white');
      }
    });
  }

  pageButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.dataset.index);
      currentIndex = page;
      carouselInstance.to(currentIndex);
      updateButtons();
    });
  });

  prevBtn?.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      carouselInstance.to(currentIndex);
      updateButtons();
    }
  });

  nextBtn?.addEventListener('click', () => {
    if (currentIndex < totalPages - 1) {
      currentIndex++;
      carouselInstance.to(currentIndex);
      updateButtons();
    }
  });

  jumpBackBtn?.addEventListener('click', () => {
    currentIndex = Math.max(0, currentIndex - 5);
    carouselInstance.to(currentIndex);
    updateButtons();
  });

  jumpForwardBtn?.addEventListener('click', () => {
    currentIndex = Math.min(totalPages - 1, currentIndex + 5);
    carouselInstance.to(currentIndex);
    updateButtons();
  });

  updateButtons();
});
