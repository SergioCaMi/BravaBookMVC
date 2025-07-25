// ========== FUNCIONALIDADES EXTRAÍDAS DE HOME.EJS ==========

// Función para buscar apartamentos
function buscarApartamentos(e) {
  e.preventDefault();

  // Añadir efecto de loading al botón
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Buscando...';
  submitBtn.disabled = true;

  const form = document.getElementById("busquedaForm");
  const params = new URLSearchParams(new FormData(form)).toString();

  // Guardar parámetros de búsqueda para uso posterior
  window.lastSearchParams = params;

  fetch("/apartments/search?" + params, {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  })
    .then((res) => res.text())
    .then((html) => {
      const partial = document.getElementById("apartmentsPartial");
      partial.innerHTML = html;

      // Añadir animación a los resultados
      partial.style.animation = "fadeInUp 0.6s ease-out";

      // Reinicializar tooltips de Bootstrap
      var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });

      // Reinicializar la paginación del carrusel después de cargar nuevos resultados
      setTimeout(() => {
        initializeCarouselPagination();
        // Reinicializar componentes del partial
        if (typeof reinitializeComponents === "function") {
          reinitializeComponents();
        }
      }, 100);

      // Scroll suave al partial actualizado
      partial.scrollIntoView({ behavior: "smooth", block: "start" });
    })
    .catch(() => {
      alert("Error al buscar apartamentos.");
    })
    .finally(() => {
      // Restaurar botón
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    });
}

// Inicialización del DOM
document.addEventListener("DOMContentLoaded", function () {
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Manejar la carga del video de fondo
  const heroVideo = document.querySelector(".hero-video");
  const videoHero = document.querySelector(".video-hero");

  if (heroVideo && videoHero) {
    // Asegurar que el video se reproduzca
    heroVideo.addEventListener("loadeddata", function () {
      console.log("Video de fondo cargado correctamente");
      heroVideo.play().catch(function (error) {
        console.log("Error al reproducir video:", error);
        // Si el video no puede reproducirse, usar imagen de fallback
        showImageFallback();
      });
    });

    // Fallback si el video no se puede cargar
    heroVideo.addEventListener("error", function () {
      console.log("Error al cargar el video, usando imagen de fallback");
      showImageFallback();
    });

    function showImageFallback() {
      videoHero.style.background = `
        linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), 
        url('/img/hero_bg_1.jpg')
      `;
      videoHero.style.backgroundSize = "cover";
      videoHero.style.backgroundPosition = "center";
      videoHero.style.backgroundAttachment = "fixed";
      if (heroVideo) {
        heroVideo.style.display = "none";
      }
    }
  }
});

// Variable global para evitar múltiples inicializaciones
let apartmentsCarouselInstance = null;
let paginationEventHandlers = {
  carouselHandler: null,
  buttonHandlers: [],
};

// Función para inicializar la paginación del carrusel
function initializeCarouselPagination() {
  const apartmentsCarouselElement = document.getElementById("apartmentsCarousel");

  if (typeof bootstrap === "undefined" || !apartmentsCarouselElement) {
    return;
  }

  // Limpiar event handlers previos
  cleanupPaginationEvents();

  // Destruir instancia previa si existe
  if (apartmentsCarouselInstance) {
    apartmentsCarouselInstance.dispose();
  }

  // Crear nueva instancia del carrusel
  apartmentsCarouselInstance = new bootstrap.Carousel(apartmentsCarouselElement, {
    interval: false,
  });

  const totalPagesCountElement = document.getElementById("totalPagesCount");
  if (!totalPagesCountElement) {
    return;
  }

  const totalCarouselPages = parseInt(totalPagesCountElement.textContent);

  const pageIndicatorMinus5 = document.getElementById("pageIndicatorMinus5");
  const pageIndicatorMinus1 = document.getElementById("pageIndicatorMinus1");
  const pageIndicatorCurrent = document.getElementById("pageIndicatorCurrent");
  const pageIndicatorPlus1 = document.getElementById("pageIndicatorPlus1");
  const pageIndicatorPlus5 = document.getElementById("pageIndicatorPlus5");

  if (!pageIndicatorCurrent) {
    return;
  }

  let currentPageIndex = 0;

  // Función para actualizar los botones de paginación
  function updatePaginationButtons(newPageIndex) {
    currentPageIndex = newPageIndex;
    const currentPageNum = currentPageIndex + 1;

    // Actualizar texto del botón actual
    pageIndicatorCurrent.textContent = currentPageNum;

    // Calcular targets y estados de los botones
    const targetMinus5 = Math.max(0, currentPageIndex - 5);
    const targetMinus1 = Math.max(0, currentPageIndex - 1);
    const targetPlus1 = Math.min(totalCarouselPages - 1, currentPageIndex + 1);
    const targetPlus5 = Math.min(totalCarouselPages - 1, currentPageIndex + 5);

    // Configurar botón -5
    if (pageIndicatorMinus5) {
      pageIndicatorMinus5.setAttribute("data-target-slide", targetMinus5);
      pageIndicatorMinus5.disabled = currentPageIndex < 5;
    }

    // Configurar botón -1
    if (pageIndicatorMinus1) {
      pageIndicatorMinus1.setAttribute("data-target-slide", targetMinus1);
      pageIndicatorMinus1.disabled = currentPageIndex === 0;
    }

    // Configurar botón +1
    if (pageIndicatorPlus1) {
      pageIndicatorPlus1.setAttribute("data-target-slide", targetPlus1);
      pageIndicatorPlus1.disabled = currentPageIndex === totalCarouselPages - 1;
    }

    // Configurar botón +5
    if (pageIndicatorPlus5) {
      pageIndicatorPlus5.setAttribute("data-target-slide", targetPlus5);
      pageIndicatorPlus5.disabled = currentPageIndex + 5 >= totalCarouselPages;
    }

    // Deshabilitar todos si solo hay una página
    if (totalCarouselPages <= 1) {
      [pageIndicatorMinus5, pageIndicatorMinus1, pageIndicatorPlus1, pageIndicatorPlus5].forEach((btn) => {
        if (btn) btn.disabled = true;
      });
    }
  }

  // Event handler para el carrusel
  paginationEventHandlers.carouselHandler = function (event) {
    updatePaginationButtons(event.to);
  };

  // Agregar event listener al carrusel
  apartmentsCarouselElement.addEventListener("slid.bs.carousel", paginationEventHandlers.carouselHandler);

  // Función para crear handler de botón
  function createButtonHandler(button, label) {
    const handler = function (event) {
      event.preventDefault();
      if (!this.disabled) {
        const targetSlide = parseInt(this.getAttribute("data-target-slide"));
        apartmentsCarouselInstance.to(targetSlide);
      }
    };

    if (button) {
      button.addEventListener("click", handler);
      paginationEventHandlers.buttonHandlers.push({ button, handler });
    }

    return handler;
  }

  // Agregar event listeners a los botones
  createButtonHandler(pageIndicatorMinus5, "-5");
  createButtonHandler(pageIndicatorMinus1, "-1");
  createButtonHandler(pageIndicatorPlus1, "+1");
  createButtonHandler(pageIndicatorPlus5, "+5");

  // Inicializar estado de los botones
  updatePaginationButtons(0);
}

// Función para limpiar event handlers
function cleanupPaginationEvents() {
  const apartmentsCarouselElement = document.getElementById("apartmentsCarousel");

  // Limpiar handler del carrusel
  if (paginationEventHandlers.carouselHandler && apartmentsCarouselElement) {
    apartmentsCarouselElement.removeEventListener("slid.bs.carousel", paginationEventHandlers.carouselHandler);
  }

  // Limpiar handlers de botones
  paginationEventHandlers.buttonHandlers.forEach(({ button, handler }) => {
    if (button && handler) {
      button.removeEventListener("click", handler);
    }
  });

  // Resetear handlers
  paginationEventHandlers.carouselHandler = null;
  paginationEventHandlers.buttonHandlers = [];
}

// Inicializar cuando se carga la página
document.addEventListener("DOMContentLoaded", function () {
  // Esperar un poco para asegurar que Bootstrap y todos los elementos estén listos
  setTimeout(() => {
    initializeCarouselPagination();
  }, 500);
});

// Inicialización de DateRangePicker
$(document).ready(function () {
  $("#dateRange").daterangepicker(
    {
      locale: {
        format: "YYYY-MM-DD",
      },
      startDate: moment(),
      endDate: moment().add(1, "days"),
      autoUpdateInput: false,
      ranges: {
        Hoy: [moment(), moment()],
        Mañana: [moment().add(1, "days"), moment().add(1, "days")],
        "Próximos 7 días": [moment(), moment().add(6, "days")],
      },
    },
    function (start, end, label) {
      $("#startDate").val(start.format("YYYY-MM-DD"));
      $("#endDate").val(end.format("YYYY-MM-DD"));
    }
  );

  $("#dateRange").on("apply.daterangepicker", function (ev, picker) {
    $("#startDate").val(picker.startDate.format("YYYY-MM-DD"));
    $("#endDate").val(picker.endDate.format("YYYY-MM-DD"));
  });
});

// ========== FIN FUNCIONALIDADES EXTRAÍDAS ==========