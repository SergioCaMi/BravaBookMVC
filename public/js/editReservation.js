document.addEventListener("DOMContentLoaded", function () {
  // ********** DateRangePicker **********
  flatpickr("#dateRange", {
    mode: "range",
    dateFormat: "d-m-Y",
    defaultDate: [
      "<%= reservation.startDate.toISOString().split('T')[0] %>",
      "<%= reservation.endDate.toISOString().split('T')[0] %>"
    ],
    onChange: function (selectedDates) {
      if (selectedDates.length === 2) {
        const startDateInput = document.getElementById("startDate");
        const endDateInput = document.getElementById("endDate");

        if (startDateInput && endDateInput) {
          startDateInput.value = selectedDates[0].toISOString().split("T")[0];
          endDateInput.value = selectedDates[1].toISOString().split("T")[0];
        }
      }
    }
  });

  // ********** Validación del formulario **********
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