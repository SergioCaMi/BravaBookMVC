$(document).ready(function() {
  $('#dateRange').daterangepicker({
    locale: {
      format: 'YYYY-MM-DD',
      applyLabel: "Aplicar",
      cancelLabel: "Cancelar",
      daysOfWeek: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
      monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
      firstDay: 1
    },
    startDate: moment(), 
    endDate: moment().add(1, 'days'),
    minDate: moment(), 
    maxDate: moment().add(1, 'year'),
    maxSpan: { days: 30 }, 
    autoApply: false,
    linkedCalendars: true,
    showCustomRangeLabel: true,
    alwaysShowCalendars: true,
  }, function(start, end, label) {
    console.log("Rango seleccionado: " + start.format('YYYY-MM-DD') + " a " + end.format('YYYY-MM-DD'));
    
    $('#startDateHidden').val(start.format('YYYY-MM-DD'));
    $('#endDateHidden').val(end.format('YYYY-MM-DD'));
  });
});
