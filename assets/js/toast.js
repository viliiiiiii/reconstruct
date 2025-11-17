const TOAST_DURATION = 6000;
let container = null;

const ensureContainer = () => {
  if (container && document.body.contains(container)) {
    return container;
  }
  container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
};

const removeToast = (toast) => {
  if (!toast) return;
  toast.classList.add('is-leaving');
  setTimeout(() => {
    toast.remove();
  }, 200);
};

export const showToast = (message, type = 'info', opts = {}) => {
  const target = ensureContainer();
  if (!target) return null;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.dataset.toastType = type;

  const text = document.createElement('div');
  text.className = 'toast__message';
  text.textContent = message;

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'toast__close';
  close.setAttribute('aria-label', 'Dismiss notification');
  close.innerHTML = '&times;';
  close.addEventListener('click', () => removeToast(toast));

  toast.appendChild(text);
  toast.appendChild(close);

  target.appendChild(toast);

  const duration = Number(opts.duration) || TOAST_DURATION;
  if (duration > 0) {
    setTimeout(() => removeToast(toast), duration);
  }
  return toast;
};

export const initToasts = () => {
  ensureContainer();
  const flashNodes = document.querySelectorAll('[data-flash-toast]');
  flashNodes.forEach((node) => {
    const text = node.textContent ? node.textContent.trim() : '';
    const type = node.getAttribute('data-flash-toast') || 'info';
    if (text) {
      showToast(text, type);
    }
    node.remove();
  });
};

if (typeof window !== 'undefined') {
  window.showToast = showToast;
}
