import Swal from 'sweetalert2';

// Cores do seu sistema
const COLOR_PRIMARY = '#194775'; 
const COLOR_SECONDARY = '#A07146';
const COLOR_DANGER = '#ef4444'; 

// Configuração Base (Estilo arredondado e clean)
const MySwal = Swal.mixin({
  customClass: {
    popup: 'rounded-2xl shadow-2xl font-sans',
    confirmButton: 'btn btn-primary shadow-md mx-2',
    cancelButton: 'btn btn-secondary shadow-md mx-2',
    title: 'text-gray-800 font-bold text-xl',
    htmlContainer: 'text-gray-600'
  },
  buttonsStyling: false, // Desativa estilo padrão
  confirmButtonColor: COLOR_PRIMARY,
  cancelButtonColor: COLOR_SECONDARY
});

export const showSuccess = (titulo, texto) => {
  return MySwal.fire({
    icon: 'success',
    title: titulo,
    text: texto,
    confirmButtonText: 'OK, Entendi',
    timer: 3000,
    timerProgressBar: true
  });
};

export const showError = (titulo, texto) => {
  return MySwal.fire({
    icon: 'error',
    title: titulo,
    text: texto,
    confirmButtonText: 'Fechar'
  });
};

export const showWarning = (titulo, texto) => {
  return MySwal.fire({
    icon: 'warning',
    title: titulo,
    text: texto,
    confirmButtonText: 'OK'
  });
};

// Para perguntas de SIM ou NÃO
export const askConfirm = async (titulo, texto) => {
  const result = await MySwal.fire({
    icon: 'question',
    title: titulo,
    text: texto,
    showCancelButton: true,
    confirmButtonText: 'Sim, confirmar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  });
  return result.isConfirmed;
};
