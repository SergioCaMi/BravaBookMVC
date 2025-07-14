const { startDate, endDate, guestName, guestEmail, status } = req.body;

const updatedData = {
  startDate,
  endDate,
  guestName,
  guestEmail,
  status: status === 'on' ? 'confirmed' : 'cancelled',
};

await Reservation.findByIdAndUpdate(req.params.id, updatedData);

  document.addEventListener("DOMContentLoaded", function () {
    flatpickr("#dateRange", {
      mode: "range",
      dateFormat: "Y-m-d",
      defaultDate: [
        "<%= reservation.startDate.toISOString().split('T')[0] %>",
        "<%= reservation.endDate.toISOString().split('T')[0] %>"
      ],
      onChange: function (selectedDates) {
        if (selectedDates.length === 2) {
          document.getElementById("startDate").value = selectedDates[0].toISOString().split("T")[0];
          document.getElementById("endDate").value = selectedDates[1].toISOString().split("T")[0];
        }
      }
    });

    const form = document.getElementById('reservationForm');
    form.addEventListener('submit', function (event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    });
  });