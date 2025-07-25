function updateHiddenFields() {
    const provinceSelect = document.getElementById("provinceSelect");
    const municipalitySelect = document.getElementById("municipalitySelect");
    const provinceIdInput = document.getElementById("provinceIdInput");
    const provinceNameInput = document.getElementById("provinceNameInput");
    const municipalityIdInput = document.getElementById("municipalityIdInput");
    const municipalityNameInput = document.getElementById("municipalityNameInput");

    const selectedProvince = provinceSelect.options[provinceSelect.selectedIndex];
    const selectedMunicipality = municipalitySelect.options[municipalitySelect.selectedIndex];

    if (selectedProvince && selectedProvince.value) {
        provinceIdInput.value = selectedProvince.value;
        provinceNameInput.value = selectedProvince.text;
    } else {
        provinceIdInput.value = '';
        provinceNameInput.value = '';
    }

    if (selectedMunicipality && selectedMunicipality.value) {
        municipalityIdInput.value = selectedMunicipality.value;
        municipalityNameInput.value = selectedMunicipality.text;
    } else {
        municipalityIdInput.value = '';
        municipalityNameInput.value = '';
    }
}

// Inicializar tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});

// Configuración del daterangepicker
$(document).ready(function () {
    $("#dateRange").daterangepicker(
        {
            locale: {
                format: "YYYY-MM-DD",
                applyLabel: "Aplicar",
                cancelLabel: "Cancelar",
                fromLabel: "Desde",
                toLabel: "Hasta",
                customRangeLabel: "Rango Personalizado",
                weekLabel: "S",
                daysOfWeek: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
                monthNames: [
                    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                ],
                firstDay: 1 // Lunes
            },
            startDate: moment(),
            endDate: moment().add(1, "days"),
            autoUpdateInput: false, // Importante para que no muestre "Invalid date" inicialmente
            ranges: {
                'Hoy': [moment(), moment()],
                'Mañana': [moment().add(1, "days"), moment().add(1, "days")],
                'Próximos 7 días': [moment(), moment().add(6, "days")],
                'Este mes': [moment().startOf('month'), moment().endOf('month')],
                'Próximo mes': [moment().add(1, 'month').startOf('month'), moment().add(1, 'month').endOf('month')]
            },
            alwaysShowCalendars: true, // Siempre muestra los calendarios
        },
        function (start, end, label) {
            $("#startDate").val(start.format("YYYY-MM-DD"));
            $("#endDate").val(end.format("YYYY-MM-DD"));
            // Actualiza el campo visible con las fechas seleccionadas
            $("#dateRange").val(start.format("YYYY-MM-DD") + ' - ' + end.format("YYYY-MM-DD"));
        }
    );

    // Si el campo de fecha está vacío al cargar, no mostrar "Invalid date"
    if (!$("#startDate").val() || !$("#endDate").val()) {
         $("#dateRange").val('');
    }

    $("#dateRange").on("apply.daterangepicker", function (ev, picker) {
        $("#startDate").val(picker.startDate.format("YYYY-MM-DD"));
        $("#endDate").val(picker.endDate.format("YYYY-MM-DD"));
        $(this).val(picker.startDate.format("YYYY-MM-DD") + ' - ' + picker.endDate.format("YYYY-MM-DD"));
    });

    // Limpiar el campo de fecha al cancelar o al cargar si no hay fechas previas
    $("#dateRange").on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
        $("#startDate").val('');
        $("#endDate").val('');
    });

    // Este código es para asegurar que si ya hay fechas en los hidden inputs (por un envío previo del formulario),
    // el daterangepicker las muestre.
    const initialStartDate = $("#startDate").val();
    const initialEndDate = $("#endDate").val();
    if (initialStartDate && initialEndDate) {
        $("#dateRange").data('daterangepicker').setStartDate(initialStartDate);
        $("#dateRange").data('daterangepicker').setEndDate(initialEndDate);
        $("#dateRange").val(initialStartDate + ' - ' + initialEndDate);
    }
});
