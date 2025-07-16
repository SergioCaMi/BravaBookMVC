// Espera a que el DOM esté completamente cargado antes de ejecutar el script.
$(document).ready(function() {
  // Inicializa el plugin `daterangepicker` en el elemento con el ID 'dateRange'.
  $('#dateRange').daterangepicker({
    // --- Configuración de Localización (Idioma) ---
    locale: {
      format: 'YYYY-MM-DD', // Formato de fecha a mostrar y usar (Año-Mes-Día).
      applyLabel: "Aplicar", // Texto del botón para aplicar la selección.
      cancelLabel: "Cancelar", // Texto del botón para cancelar la selección.
      daysOfWeek: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"], // Nombres abreviados de los días de la semana.
      monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"], // Nombres completos de los meses.
      firstDay: 1 // Establece el lunes como el primer día de la semana (1 = Lunes, 0 = Domingo).
    },
    // --- Configuración de Fechas por Defecto y Límites ---
    startDate: moment(), // La fecha de inicio por defecto será el día actual.
    endDate: moment().add(1, 'days'), // La fecha de fin por defecto será el día siguiente al actual.
    minDate: moment(), // La fecha mínima seleccionable es el día actual. No se pueden seleccionar fechas pasadas.
    maxDate: moment().add(1, 'year'), // La fecha máxima seleccionable es hasta un año a partir del día actual.
    maxSpan: { days: 30 }, // Establece una duración máxima de la selección de 30 días.
    // --- Comportamiento del Calendario ---
    autoApply: false, // No aplica automáticamente la selección al elegir las fechas; requiere clic en 'Aplicar'.
    linkedCalendars: true, // Los dos calendarios (inicio y fin) se mueven juntos al navegar.
    showCustomRangeLabel: true, // Muestra la opción de rango personalizado (si aplica).
    alwaysShowCalendars: true, // Siempre muestra ambos calendarios, incluso al inicio.
  },
  // --- Función Callback al Seleccionar un Rango de Fechas ---
  /**
   * Esta función se ejecuta cuando el usuario selecciona un rango de fechas y hace clic en "Aplicar".
   * @param {object} start - Objeto Moment.js que representa la fecha de inicio seleccionada.
   * @param {object} end - Objeto Moment.js que representa la fecha de fin seleccionada.
   * @param {string} label - La etiqueta del rango seleccionado (ej. "Custom Range", "Today", etc.).
   */
  function(start, end, label) {
    // Imprime en la consola el rango de fechas seleccionado para depuración.
    console.log("Rango seleccionado: " + start.format('YYYY-MM-DD') + " a " + end.format('YYYY-MM-DD'));

    // Actualiza el valor de los campos ocultos con los IDs 'startDateHidden' y 'endDateHidden'.
    // Esto es útil para enviar las fechas seleccionadas al servidor con el formulario.
    $('#startDateHidden').val(start.format('YYYY-MM-DD'));
    $('#endDateHidden').val(end.format('YYYY-MM-DD'));
  });
});