// ========== ABOUT PAGE JAVASCRIPT ==========

document.addEventListener("DOMContentLoaded", () => {
  // Inicializar todas las funcionalidades
  initScrollAnimations()
  initParticleEffects()
  initCardInteractions()
  initProgressiveLoading()
  initAccessibilityFeatures()

  console.log("About page loaded successfully")
})

/**
 * Animaciones de scroll para las secciones
 */
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const section = entry.target
        const cards = section.querySelectorAll(
          ".tech-card, .feature-card, .arch-card, .security-card, .overview-card, .api-card, .user-card, .db-card",
        )

        // Animación escalonada para las cards
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.style.animation = "fadeInUp 0.6s ease-out forwards"
            card.style.opacity = "0"
            card.style.transform = "translateY(20px)"

            setTimeout(() => {
              card.style.opacity = "1"
              card.style.transform = "translateY(0)"
            }, 50)
          }, index * 100)
        })

        // Desconectar el observer para esta sección
        observer.unobserve(section)
      }
    })
  }, observerOptions)

  // Observar todas las secciones
  document.querySelectorAll(".tech-section").forEach((section) => {
    observer.observe(section)
  })
}

/**
 * Efectos de partículas interactivas
 */
function initParticleEffects() {
  const particles = document.querySelectorAll(".particle")

  // Efecto parallax suave para las partículas
  document.addEventListener("mousemove", (e) => {
    const x = e.clientX / window.innerWidth
    const y = e.clientY / window.innerHeight

    particles.forEach((particle, index) => {
      const speed = (index + 1) * 0.3
      const xPos = (x - 0.5) * speed * 15
      const yPos = (y - 0.5) * speed * 15

      particle.style.transform = `translate(${xPos}px, ${yPos}px)`
    })
  })

  // Efecto de click en partículas
  particles.forEach((particle) => {
    particle.addEventListener("click", function () {
      this.style.animation = "none"
      this.style.transform = "scale(1.5)"
      this.style.opacity = "0"

      setTimeout(() => {
        this.style.animation = "float 6s ease-in-out infinite"
        this.style.transform = "scale(1)"
        this.style.opacity = "0.7"
      }, 300)
    })
  })
}

/**
 * Interacciones mejoradas para las cards
 */
function initCardInteractions() {
  const cards = document.querySelectorAll(
    ".tech-card, .api-card, .user-card, .db-card, .feature-card, .security-card, .overview-card, .arch-card",
  )

  cards.forEach((card) => {
    // Efecto de inclinación en hover
    card.addEventListener("mouseenter", function (e) {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const rect = this.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const centerX = rect.width / 2
        const centerY = rect.height / 2

        const rotateX = (y - centerY) / 10
        const rotateY = (centerX - x) / 10

        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`
      }
    })

    card.addEventListener("mouseleave", function () {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        this.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)"
      }
    })

    // Efecto de click
    card.addEventListener("click", function () {
      this.style.transform = "scale(0.95)"
      setTimeout(() => {
        this.style.transform = ""
      }, 150)
    })
  })
}

/**
 * Carga progresiva de contenido
 */
function initProgressiveLoading() {
  // Lazy loading para imágenes si las hubiera
  const images = document.querySelectorAll("img[data-src]")

  if (images.length > 0) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.classList.remove("lazy")
          imageObserver.unobserve(img)
        }
      })
    })

    images.forEach((img) => imageObserver.observe(img))
  }

  // Precarga de secciones
  const sections = document.querySelectorAll(".tech-section")
  let loadedSections = 0

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadedSections++
        updateLoadingProgress(loadedSections, sections.length)
      }
    })
  })

  sections.forEach((section) => sectionObserver.observe(section))
}

/**
 * Actualizar progreso de carga
 */
function updateLoadingProgress(loaded, total) {
  const progress = (loaded / total) * 100

  // Crear barra de progreso si no existe
  let progressBar = document.getElementById("loading-progress")
  if (!progressBar && progress < 100) {
    progressBar = document.createElement("div")
    progressBar.id = "loading-progress"
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: ${progress}%;
      height: 3px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      z-index: 9999;
      transition: width 0.3s ease;
    `
    document.body.appendChild(progressBar)
  }

  if (progressBar) {
    progressBar.style.width = `${progress}%`

    if (progress >= 100) {
      setTimeout(() => {
        progressBar.remove()
      }, 500)
    }
  }
}

/**
 * Características de accesibilidad
 */
function initAccessibilityFeatures() {
  // Navegación por teclado mejorada
  const focusableElements = document.querySelectorAll(
    ".tech-card, .api-card, .user-card, .db-card, .feature-card, .security-card, .overview-card, .arch-card",
  )

  focusableElements.forEach((element, index) => {
    element.setAttribute("tabindex", "0")
    element.setAttribute("role", "article")

    element.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        this.click()
      }

      // Navegación con flechas
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault()
        const nextElement = focusableElements[index + 1]
        if (nextElement) nextElement.focus()
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault()
        const prevElement = focusableElements[index - 1]
        if (prevElement) prevElement.focus()
      }
    })
  })

  // Anuncios para lectores de pantalla
  const announceSection = (sectionName) => {
    const announcement = document.createElement("div")
    announcement.setAttribute("aria-live", "polite")
    announcement.setAttribute("aria-atomic", "true")
    announcement.className = "sr-only"
    announcement.textContent = `Sección ${sectionName} cargada`
    document.body.appendChild(announcement)

    setTimeout(() => {
      announcement.remove()
    }, 1000)
  }

  // Detectar cuando las secciones se vuelven visibles
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const sectionTitle = entry.target.querySelector("h2")
        if (sectionTitle) {
          announceSection(sectionTitle.textContent)
        }
      }
    })
  })

  document.querySelectorAll(".tech-section").forEach((section) => {
    sectionObserver.observe(section)
  })
}

/**
 * Utilidades adicionales
 */

// Función para detectar si el usuario prefiere movimiento reducido
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

// Función para manejar errores de JavaScript
window.addEventListener("error", (e) => {
  console.error("Error en about.js:", e.error)

  // Fallback para funcionalidad básica
  if (e.error.message.includes("animation")) {
    document.querySelectorAll(".tech-card, .api-card, .user-card, .db-card").forEach((card) => {
      card.style.opacity = "1"
      card.style.transform = "none"
    })
  }
})

// Función para optimizar rendimiento
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Optimizar eventos de scroll y resize
const debouncedResize = debounce(() => {
  // Reajustar elementos si es necesario
  console.log("Window resized, adjusting layout...")
}, 250)

window.addEventListener("resize", debouncedResize)

// Función para limpiar recursos al salir de la página
window.addEventListener("beforeunload", () => {
  // Limpiar observers y event listeners si es necesario
  console.log("Cleaning up about page resources...")
})

// Exportar funciones para testing (si es necesario)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initScrollAnimations,
    initParticleEffects,
    initCardInteractions,
    prefersReducedMotion,
  }
}
