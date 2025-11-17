let notesInitialized = false;

export const initNotesPage = () => {
  if (notesInitialized) return;
  notesInitialized = true;

  document.querySelectorAll('form.photo-upload-inline input[type="file"]').forEach((input) => {
    if (input.dataset.notesBound) return;
    input.dataset.notesBound = '1';
    input.addEventListener('change', () => {
      const form = input.closest('form');
      if (form) form.submit();
    });
  });
};
