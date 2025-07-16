document.addEventListener('DOMContentLoaded', () => {
  // Destructura las propiedades `carouselId`, `totalPages`, y `currentPage` del objeto global `window.paginationConfig`.
  const { carouselId, totalPages, currentPage } = window.paginationConfig;
  // Inicializa `currentIndex` con el valor de la página actual.
  let currentIndex = currentPage;

  // Obtiene la referencia al elemento del carrusel usando su ID.
  const carousel = document.getElementById(carouselId);
  // Si el carrusel no se encuentra, imprime un error en la consola y sale de la función.
  if (!carousel) return console.error(`No se encontró el carrusel con id ${carouselId}`);

  // Obtiene o crea una instancia del carrusel de Bootstrap para poder controlarlo programáticamente.
  const carouselInstance = bootstrap.Carousel.getOrCreateInstance(carousel);

  // Obtiene referencias a todos los botones de página y a los botones de navegación (anterior, siguiente, saltar).
  const pageButtons = document.querySelectorAll('.page-btn'); // Botones individuales de cada página.
  const prevBtn = document.getElementById('prevPageBtn');     // Botón para ir a la página anterior.
  const nextBtn = document.getElementById('nextPageBtn');     // Botón para ir a la página siguiente.
  const jumpBackBtn = document.getElementById('jumpBackBtn'); // Botón para saltar varias páginas hacia atrás.
  const jumpForwardBtn = document.getElementById('jumpForwardBtn'); // Botón para saltar varias páginas hacia adelante.

  /**
   * Actualiza la visibilidad y el estilo de los botones de paginación.
   * Los botones se muestran u ocultan en función de su cercanía a la página actual,
   * y el botón de la página actual se resalta.
   */
  function updateButtons() {
    // Itera sobre cada botón de página.
    pageButtons.forEach((btn) => {
      // Obtiene el índice de la página del atributo `data-index` del botón.
      const page = parseInt(btn.dataset.index);
      // Determina si el botón debe ser visible. Un botón es visible si su página
      // está a 2 posiciones de la página actual (ej. si current es 5, visible 3,4,5,6,7).
      const visible = Math.abs(page - currentIndex) <= 2;
      // Añade o quita la clase 'd-none' (display: none de Bootstrap) para controlar la visibilidad.
      btn.classList.toggle('d-none', !visible);

      // Quita las clases de estilo 'btn-primary' y 'text-white' para restablecer el botón.
      btn.classList.remove('btn-primary', 'text-white');
      // Añade la clase 'btn-outline-primary' para el estilo por defecto.
      btn.classList.add('btn-outline-primary');

      // Si la página del botón es la página actual.
      if (page === currentIndex) {
        // Reemplaza el estilo de contorno por el estilo primario y añade texto blanco para resaltarlo.
        btn.classList.replace('btn-outline-primary', 'btn-primary');
        btn.classList.add('text-white');
      }
    });
  }

  // --- Event Listeners para los Botones de Página ---

  // Añade un event listener a cada botón de página individual.
  pageButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Cuando se hace clic en un botón de página, actualiza el índice actual.
      const page = parseInt(btn.dataset.index);
      currentIndex = page;
      // Usa el método `to()` de la instancia del carrusel para navegar a la diapositiva correspondiente.
      carouselInstance.to(currentIndex);
      // Llama a `updateButtons` para reflejar el cambio de página en la interfaz de usuario.
      updateButtons();
    });
  });

  // --- Event Listeners para los Botones de Navegación (Prev/Next/Jump) ---

  // Añade un event listener al botón 'prevBtn' si existe.
  prevBtn?.addEventListener('click', () => {
    // Si la página actual no es la primera, decrementa el índice.
    if (currentIndex > 0) {
      currentIndex--;
      carouselInstance.to(currentIndex); // Navega a la nueva diapositiva.
      updateButtons();                   // Actualiza los botones de paginación.
    }
  });

  // Añade un event listener al botón 'nextBtn' si existe.
  nextBtn?.addEventListener('click', () => {
    // Si la página actual no es la última, incrementa el índice.
    if (currentIndex < totalPages - 1) {
      currentIndex++;
      carouselInstance.to(currentIndex); // Navega a la nueva diapositiva.
      updateButtons();                   // Actualiza los botones de paginación.
    }
  });

  // Añade un event listener al botón 'jumpBackBtn' si existe.
  jumpBackBtn?.addEventListener('click', () => {
    // Salta 5 páginas hacia atrás, asegurándose de no ir por debajo de 0.
    currentIndex = Math.max(0, currentIndex - 5);
    carouselInstance.to(currentIndex); // Navega a la nueva diapositiva.
    updateButtons();                   // Actualiza los botones de paginación.
  });

  // Añade un event listener al botón 'jumpForwardBtn' si existe.
  jumpForwardBtn?.addEventListener('click', () => {
    // Salta 5 páginas hacia adelante, asegurándose de no exceder `totalPages - 1`.
    currentIndex = Math.min(totalPages - 1, currentIndex + 5);
    carouselInstance.to(currentIndex); // Navega a la nueva diapositiva.
    updateButtons();                   // Actualiza los botones de paginación.
  });

  // Llama a `updateButtons` una vez al cargar el DOM para establecer el estado inicial de los botones.
  updateButtons();
});