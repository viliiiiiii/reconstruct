import { showToast } from './toast.js';

let photoListenerBound = false;

const handlePhotoClick = async (ev) => {
  const btn = ev.target.closest('[data-remove-photo]');
  if (!btn) return;

  const photoId = btn.getAttribute('data-photo-id');
  const csrfName = btn.getAttribute('data-csrf-name');
  const csrfVal  = btn.getAttribute('data-csrf-value');

  if (!photoId) { showToast('Missing photo id', 'error'); return; }
  if (!confirm('Remove this photo?')) return;

  const fd = new FormData();
  fd.append('photo_id', photoId);
  if (csrfName && csrfVal) {
    fd.append(csrfName, csrfVal);
  }

  btn.disabled = true;
  try {
    const res = await fetch('/photo_remove.php', {
      method: 'POST',
      body: fd,
      headers: { 'Accept': 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || 'Request failed');

    const slot = btn.closest('.photo-slot');
    if (slot) {
      const img = slot.querySelector('img'); if (img) img.remove();
      const acts = slot.querySelector('.photo-actions'); if (acts) acts.remove();
      if (!slot.querySelector('.no-photo-label')) {
        const label = document.createElement('div');
        label.className = 'muted small no-photo-label';
        label.textContent = 'No photo';
        const uploadForm = slot.querySelector('[data-upload-form]');
        slot.insertBefore(label, uploadForm || slot.firstChild);
      }
    }
    showToast('Photo removed', 'success');
  } catch (err) {
    const msg = err && err.message ? err.message : 'Failed to remove photo';
    showToast(msg, 'error');
  } finally {
    btn.disabled = false;
  }
};

export const initPhotoManager = () => {
  if (photoListenerBound) return;
  document.addEventListener('click', handlePhotoClick);
  photoListenerBound = true;
};
