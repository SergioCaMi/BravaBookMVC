// Espera a que el DOM (Document Object Model) esté completamente cargado antes de ejecutar el script.
$(document).ready(function () {
  // --- Inicialización y Configuración de DateRangePicker ---

  // Define las fechas de inicio y fin iniciales.
  // `moment()` es una función de la librería Moment.js que devuelve el objeto de fecha y hora actual.
  let initialStartDate = moment(); // Establece la fecha de inicio inicial como hoy.
  let initialEndDate = moment().add(1, 'days'); // Establece la fecha de fin inicial como mañana.

  // Comprueba si la variable `reservationData` está definida.
  // `reservationData` se esperaría que contenga datos de una reserva existente,
  // como fechas de inicio y fin, si se está editando una reserva.
  if (typeof reservationData !== 'undefined') {
    // Si `reservationData.startDate` existe, usa esa fecha como fecha de inicio.
    if (reservationData.startDate) {
      initialStartDate = moment(reservationData.startDate);
    }
    // Si `reservationData.endDate` existe, usa esa fecha como fecha de fin.
    if (reservationData.endDate) {
      initialEndDate = moment(reservationData.endDate);
    }
  }

  // Inicializa el plugin `daterangepicker` en el elemento con el ID 'dateRange'.
  $('#dateRange').daterangepicker({
    // Configuración de localización para mostrar el calendario en español.
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
  // Función de callback que se ejecuta cuando se selecciona un rango de fechas y se hace clic en "Aplicar".
  /**
   * @param {object} start - Objeto Moment.js que representa la fecha de inicio seleccionada.
   * @param {object} end - Objeto Moment.js que representa la fecha de fin seleccionada.
   * @param {string} label - La etiqueta del rango seleccionado (ej. "Custom Range", "Today", etc.).
   */
  function(start, end, label) {
    // Imprime el rango de fechas seleccionado en la consola para depuración.
    console.log("Rango seleccionado: " + start.format('YYYY-MM-DD') + " a " + end.format('YYYY-MM-DD'));

    // Obtiene las referencias a los campos de input ocultos para las fechas de inicio y fin.
    const startDateInput = $('#startDateHidden');
    const endDateInput = $('#endDateHidden');

    // Si el input oculto de fecha de inicio existe, actualiza su valor con la fecha de inicio seleccionada.
    if (startDateInput.length) {
      startDateInput.val(start.format('YYYY-MM-DD'));
    }

    // Si el input oculto de fecha de fin existe, actualiza su valor con la fecha de fin seleccionada.
    if (endDateInput.length) {
      endDateInput.val(end.format('YYYY-MM-DD'));
    }
  });

  // Establece el valor inicial del input del daterangepicker con las fechas iniciales.
  // Esto asegura que el campo muestre el rango preseleccionado al cargar la página.
  $('#dateRange').val(initialStartDate.format('YYYY-MM-DD') + ' - ' + initialEndDate.format('YYYY-MM-DD'));


  // --- Validación del Formulario ---

  // Obtiene la referencia al formulario de reserva.
  const form = document.getElementById('reservationForm');

  // Verifica si el formulario existe antes de añadir el event listener.
  if (form) {
    // Añade un event listener para el evento 'submit' del formulario.
    form.addEventListener('submit', function (event) {
      // Comprueba la validez del formulario utilizando la API de validación de HTML5.
      if (!form.checkValidity()) {
        event.preventDefault(); // Si el formulario no es válido, previene el envío.
        event.stopPropagation(); // Detiene la propagación del evento.
      }

      // Añade la clase 'was-validated' al formulario. Esta clase es utilizada por Bootstrap
      // para mostrar la retroalimentación visual de la validación (ej. mensajes de error, bordes de color).
      form.classList.add('was-validated');
    });
  }
});