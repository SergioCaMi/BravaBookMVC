  document.addEventListener('DOMContentLoaded', function() {
    // Para el modal de error
    const errorModal = document.getElementById('errorModal');
    if (errorModal) {
      setTimeout(function() {
        const modal = bootstrap.Modal.getInstance(errorModal);
        if (modal) {
          modal.hide();
        }
      }, 3000);
    }

    // Para el modal de éxito
    const successModal = document.getElementById('successModal');
    if (successModal) {
      setTimeout(function() {
        const modal = bootstrap.Modal.getInstance(successModal);
        if (modal) {
          modal.hide();
        }
      }, 3000);
    }
  });