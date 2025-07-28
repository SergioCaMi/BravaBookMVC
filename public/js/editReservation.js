$(document).ready(function () {

  let initialStartDate = moment(); 
  let initialEndDate = moment().add(1, 'days'); 

  if (typeof reservationData !== 'undefined') {
    if (reservationData.startDate) {
      initialStartDate = moment(reservationData.startDate);
    }
    if (reservationData.endDate) {
      initialEndDate = moment(reservationData.endDate);
    }
  }

  // Inicializa daterangepicker
  $('#dateRange').daterangepicker({
    locale: {
      format: 'YYYY-MM-DD', // Formato de fecha para mostrar y usar (Año-Mes-Día).
      applyLabel: "Aplicar", // Texto para el botón de aplicar la selección.
      cancelLabel: "Cancelar", // Texto para el botón de cancelar.
      daysOfWeek: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"], // Nombres abreviados de los días de la semana.
      monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"], // Nombres completos de los meses.
      firstDay: 1 // Establece el lunes como el primer día de la semana (1 = Lunes, 0 = Domingo).
    },
    // Establece las fechas de inicio y fin del selector de rango de fechas.
    startDate: initialStartDate,
    endDate: initialEndDate,
    // Define el rango de fechas seleccionables.
    minDate: moment(), // La fecha mínima seleccionable es el día actual. No se permiten fechas pasadas.
    maxDate: moment().add(1, 'year'), // La fecha máxima seleccionable es hasta un año a partir del día actual.
    maxSpan: { days: 30 }, // Limita la duración máxima de la reserva a 30 días.
    // Comportamiento del calendario.
    autoApply: false, // No aplica automáticamente la selección al elegir las fechas; se requiere clic en 'Aplicar'.
    linkedCalendCalendars: true, // Los dos calendarios (inicio y fin) se mueven juntos al navegar.
    showCustomRangeLabel: true, // Muestra la opción de "Rango personalizado".
    alwaysShowCalendars: true, // Siempre muestra ambos calendarios, incluso al inicio.
  },

 /**
   * @param {object} start - Objeto Moment.js que representa la fecha de inicio seleccionada.
   * @param {object} end - Objeto Moment.js que representa la fecha de fin seleccionada.
   * @param {string} label - La etiqueta del rango seleccionado (ej. "Custom Range", "Today", etc.).
   */
  function(start, end, label) {
    console.log("Rango seleccionado: " + start.format('YYYY-MM-DD') + " a " + end.format('YYYY-MM-DD'));
    const startDateInput = $('#startDateHidden');
    const endDateInput = $('#endDateHidden');

    if (startDateInput.length) {
      startDateInput.val(start.format('YYYY-MM-DD'));
    }

    if (endDateInput.length) {
      endDateInput.val(end.format('YYYY-MM-DD'));
    }
  });

  // Establece el valor inicial del input del daterangepicker con las fechas iniciales.
  $('#dateRange').val(initialStartDate.format('YYYY-MM-DD') + ' - ' + initialEndDate.format('YYYY-MM-DD'));


  // ********** Validación del Formulario **********

  const form = document.getElementById('reservationForm');

  if (form) {
    form.addEventListener('submit', function (event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation(); 
      }

      // Añadimos la clase 'was-validated' al formulario.
      form.classList.add('was-validated');
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const notesField = document.getElementById('notes');
  const notesCharCount = document.getElementById('notesCharCount');
  
  if (notesField && notesCharCount) {
    // Inicializar contador
    notesCharCount.textContent = notesField.value.length;
    
    notesField.addEventListener('input', function() {
      notesCharCount.textContent = this.value.length;
      if (this.value.length > 900) {
        notesCharCount.style.color = '#dc3545';
      } else if (this.value.length > 750) {
        notesCharCount.style.color = '#ffc107';
      } else {
        notesCharCount.style.color = '#6c757d';
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
  
  // Inicializar progreso
  updateProgressBar();
  
  // Efecto hover en las secciones
  const sections = document.querySelectorAll('.form-section');
  sections.forEach(section => {
    section.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
    });
    
    section.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
});