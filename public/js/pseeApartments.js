  // Animación de entrada para las tarjetas
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = "running";
      }
    });
  }, observerOptions);

  document.querySelectorAll(".apartment-card").forEach((card) => {
    observer.observe(card);
  });

  // Inicialización simple de componentes
  document.addEventListener("DOMContentLoaded", function () {
    // Inicializar tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Configurar delegación de eventos para formularios de eliminación
    document.addEventListener("submit", function (event) {
      if (event.target.classList.contains("delete-form")) {
        event.preventDefault();
        handleApartmentDelete(event);
      }
    });

    // Agregar listener para limpiar backdrops cuando se cierran modales
    document.addEventListener("hidden.bs.modal", function (event) {
      // Pequeño delay para asegurar que Bootstrap termine su cleanup
      setTimeout(() => {
        cleanupModalBackdrops();
      }, 50);
    });

    // Limpiar backdrops al cargar la página
    cleanupModalBackdrops();
  });

  // Función simplificada para manejar eliminación de apartamentos
  function handleApartmentDelete(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Mostrar loading
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Eliminando...';
    submitBtn.disabled = true;

    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: { "X-Requested-With": "XMLHttpRequest" },
    })
      .then((response) => {
        if (response.ok) {
          // Cerrar modal y limpiar backdrop ANTES de recargar contenido
          const modal = form.closest(".modal");
          if (modal) {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
              modalInstance.hide();
            }

            // Forzar limpieza inmediata del modal y backdrop
            modal.classList.remove("show");
            modal.style.display = "none";
            modal.setAttribute("aria-hidden", "true");
            modal.removeAttribute("aria-modal");
          }

          // Limpiar todos los backdrops inmediatamente
          cleanupModalBackdrops();

          // Recargar página manteniendo filtros si existen
          if (typeof buscarApartamentos === "function" && window.lastSearchParams) {
            fetch("/apartments/search?" + window.lastSearchParams, {
              headers: { "X-Requested-With": "XMLHttpRequest" },
            })
              .then((res) => res.text())
              .then((html) => {
                const partial = document.getElementById("apartmentsPartial") || document.getElementById("apartmentsContainer");
                if (partial) {
                  partial.innerHTML = html;

                  // Limpiar backdrops nuevamente después de recargar contenido
                  setTimeout(() => {
                    cleanupModalBackdrops();

                    if (typeof initializeCarouselPagination === "function") {
                      initializeCarouselPagination();
                    }
                    if (typeof reinitializeComponents === "function") {
                      reinitializeComponents();
                    }
                  }, 100);
                }
              })
              .catch(() => {
                cleanupModalBackdrops();
                setTimeout(() => window.location.reload(), 500);
              });
          } else {
            cleanupModalBackdrops();
            setTimeout(() => window.location.reload(), 500);
          }
        } else {
          alert("Error al eliminar el apartamento.");
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      })
      .catch((error) => {
        alert("Error al eliminar el apartamento.");
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      });
  }

  // Función específica para limpiar backdrops de modales
  function cleanupModalBackdrops() {
    // Eliminar todos los backdrops existentes
    const backdrops = document.querySelectorAll(".modal-backdrop");
    backdrops.forEach((backdrop) => {
      backdrop.remove();
    });

    // Limpiar clases del body
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";

    // Cerrar todos los modales que puedan estar abiertos
    document.querySelectorAll(".modal.show").forEach((modal) => {
      modal.classList.remove("show");
      modal.style.display = "";
      modal.setAttribute("aria-hidden", "true");
      modal.removeAttribute("aria-modal");
    });

    // Limpiar cualquier overlay residual
    const overlays = document.querySelectorAll(".modal-backdrop, .fade");
    overlays.forEach((overlay) => {
      if (overlay.classList.contains("modal-backdrop")) {
        overlay.remove();
      }
    });
  }

  // Función simple para reinicializar componentes después de cargas AJAX
  function reinitializeComponents() {
    // Limpiar backdrops al reinicializar
    cleanupModalBackdrops();

    // Reinicializar tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      var existingTooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
      if (existingTooltip) {
        existingTooltip.dispose();
      }
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Reinicializar observer para animaciones
    document.querySelectorAll(".apartment-card").forEach((card) => {
      observer.observe(card);
    });
  }

  // Exponer funciones globalmente para compatibilidad AJAX
  window.reinitializeComponents = reinitializeComponents;
  window.handleApartmentDelete = handleApartmentDelete;
  window.cleanupModalBackdrops = cleanupModalBackdrops;
