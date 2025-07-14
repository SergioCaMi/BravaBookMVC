$(document).ready(function () {
  // ********** DateRangePicker **********
  let initialStartDate = moment(); // Hoy
  let initialEndDate = moment().add(1, 'days'); // Mañana

  // Si reservationData está definida, usamos esas fechas
  if (typeof reservationData !== 'undefined') {
    if (reservationData.startDate) {
      initialStartDate = moment(reservationData.startDate);
    }
    if (reservationData.endDate) {
      initialEndDate = moment(reservationData.endDate);
    }
  }

  $('#dateRange').daterangepicker({
    locale: {
      format: 'YYYY-MM-DD',
      applyLabel: "Aplicar",
      cancelLabel: "Cancelar",
      daysOfWeek: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
      monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
      firstDay: 1
    },
    startDate: initialStartDate,
    endDate: initialEndDate,
    minDate: moment(),
    maxDate: moment().add(1, 'year'),
    maxSpan: { days: 30 },
    autoApply: false,
    linkedCalendars: true,
    showCustomRangeLabel: true,
    alwaysShowCalendars: true,
  }, function(start, end, label) {
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

  $('#dateRange').val(initialStartDate.format('YYYY-MM-DD') + ' - ' + initialEndDate.format('YYYY-MM-DD'));


  // ********** Validación del Formulario **********
  const form = document.getElementById('reservationForm');

  if (form) {
    form.addEventListener('submit', function (event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated');
    });
  }
});