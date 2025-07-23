// Actualizar barra de progreso
function updateProgressBar() {
  const nameField = document.getElementById('name');
  const emailField = document.getElementById('email');
  const passwordField = document.getElementById('password');
  let completedFields = 0;
  const totalFields = 3;
  
  if (nameField && nameField.value.trim()) {
    completedFields++;
  }
  
  if (emailField && emailField.value.trim() && emailField.checkValidity()) {
    completedFields++;
  }
  
  if (passwordField && passwordField.value.trim() && passwordField.checkValidity()) {
    completedFields++;
  }
  
  const progress = (completedFields / totalFields) * 100;
  const progressBar = document.querySelector('.progress-fill');
  if (progressBar) {
    progressBar.style.width = progress + '%';
  }
}

// Actualizar indicador de fortaleza de contraseña
function updatePasswordStrength(password) {
  const strengthFill = document.querySelector('.strength-fill');
  const strengthText = document.querySelector('.strength-text');
  
  if (!strengthFill || !strengthText) return;
  
  let strength = 0;
  let message = 'Introduce una contraseña segura';
  let color = '#dc3545';
  
  if (password.length >= 8) strength += 25;
  if (password.match(/[A-Za-z]/)) strength += 25;
  if (password.match(/\d/)) strength += 25;
  if (password.match(/[@$!%*#?&]/)) strength += 25;
  
  if (strength >= 100) {
    message = 'Contraseña muy segura';
    color = '#28a745';
  } else if (strength >= 75) {
    message = 'Contraseña segura';
    color = '#ffc107';
  } else if (strength >= 50) {
    message = 'Contraseña moderada';
    color = '#fd7e14';
  } else if (strength >= 25) {
    message = 'Contraseña débil';
    color = '#dc3545';
  }
  
  strengthFill.style.width = strength + '%';
  strengthFill.style.background = color;
  strengthText.textContent = message;
  strengthText.style.color = color;
}

// Validación del formulario
const form = document.getElementById('registerForm');
if (form) {
  form.addEventListener('submit', function (event) {
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    }
    form.classList.add('was-validated');
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
  
  // Actualizar fortaleza de contraseña en tiempo real
  passwordInput.addEventListener('input', function() {
    updatePasswordStrength(this.value);
  });
}

// Inicializar progreso y fortaleza
document.addEventListener('DOMContentLoaded', function() {
  updateProgressBar();
  if (passwordInput) {
    updatePasswordStrength(passwordInput.value);
  }
});
