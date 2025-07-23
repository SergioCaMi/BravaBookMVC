// Actualizar barra de progreso
function updateProgressBar() {
  const emailField = document.getElementById('email');
  const passwordField = document.getElementById('password');
  let completedFields = 0;
  const totalFields = 2;
  
  if (emailField && emailField.value.trim() && emailField.checkValidity()) {
    completedFields++;
  }
  
  if (passwordField && passwordField.value.trim()) {
    completedFields++;
  }
  
  const progress = (completedFields / totalFields) * 100;
  const progressBar = document.querySelector('.progress-fill');
  if (progressBar) {
    progressBar.style.width = progress + '%';
  }
}

// Validación del formulario
const form = document.querySelector(".needs-validation");
if (form) {
  form.addEventListener("submit", function (event) {
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    }
    form.classList.add("was-validated");
  });
  
  // Actualizar progreso en tiempo real
  form.addEventListener('input', updateProgressBar);
  form.addEventListener('change', updateProgressBar);
}

// Toggle para mostrar/ocultar la contraseña
const passwordInput = document.getElementById("password");
const toggleIcon = document.getElementById("togglePassword");

if (toggleIcon && passwordInput) {
  toggleIcon.addEventListener("click", function () {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    this.classList.toggle("bi-eye");
    this.classList.toggle("bi-eye-slash");
  });
}
