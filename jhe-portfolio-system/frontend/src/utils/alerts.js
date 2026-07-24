import Swal from 'sweetalert2';

// O SweetAlert aceita a injeção direta de variáveis CSS no JS
// Como o nosso global.css já faz a troca automática do Light/Dark no [data-theme="dark"],
// o SweetAlert vai herdar a paleta instantaneamente!
export const themeAlert = Swal.mixin({
  background: 'var(--bg-color)',
  color: 'var(--text-color)',
  confirmButtonColor: 'var(--primary-color)',
  cancelButtonColor: '#ef4444',
  customClass: {
    popup: 'swal2-border-radius', // Podemos forçar bordas arredondadas depois
  }
});

// Helper de Sucesso Rápido
export const showAlertSuccess = (title, text = '') => {
  return themeAlert.fire({
    title,
    text,
    icon: 'success',
  });
};

// Helper de Erro Rápido
export const showAlertError = (title, text = '') => {
  return themeAlert.fire({
    title,
    text,
    icon: 'error',
  });
};

// Helper de Confirmação (Sim / Não)
export const showConfirmDialog = (title, text = '') => {
  return themeAlert.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, continuar',
    cancelButtonText: 'Cancelar'
  });
};
