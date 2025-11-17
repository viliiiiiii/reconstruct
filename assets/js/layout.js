import { initToasts } from './toast.js';
import { initTaskRoomPicker } from './tasks.js';
import { initNotesPage } from './notes.js';
import { initPhotoManager } from './photos.js';

const ready = (fn) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
};

const sidebarStorageKey = 'app:sidebar-collapsed';

function initSidebar() {
  const shell = document.querySelector('.app-shell');
  const sidebar = document.querySelector('[data-sidebar]');
  const collapseBtn = document.querySelector('[data-sidebar-collapse]');
  const mobileToggle = document.querySelector('[data-sidebar-mobile-toggle]');
  const overlay = document.querySelector('[data-sidebar-overlay]');
  if (!shell || !sidebar) return;

  const applyCollapsed = (state) => {
    shell.classList.toggle('sidebar-collapsed', state);
    shell.dataset.sidebarCollapsed = state ? 'true' : 'false';
  };

  const stored = localStorage.getItem(sidebarStorageKey);
  applyCollapsed(stored === 'true');

  const toggleCollapsed = () => {
    const next = shell.dataset.sidebarCollapsed !== 'true';
    applyCollapsed(next);
    localStorage.setItem(sidebarStorageKey, next ? 'true' : 'false');
  };

  const openMobile = () => {
    shell.classList.add('sidebar-open');
    if (overlay) overlay.classList.add('is-visible');
  };

  const closeMobile = () => {
    shell.classList.remove('sidebar-open');
    if (overlay) overlay.classList.remove('is-visible');
  };

  if (collapseBtn) {
    collapseBtn.addEventListener('click', (event) => {
      event.preventDefault();
      toggleCollapsed();
    });
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', (event) => {
      event.preventDefault();
      if (shell.classList.contains('sidebar-open')) {
        closeMobile();
      } else {
        openMobile();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => closeMobile());
  }

  sidebar.addEventListener('click', (event) => {
    if (!shell.classList.contains('sidebar-open')) return;
    if (event.target.closest('a')) {
      closeMobile();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      closeMobile();
    }
  });
}

function initCommandPalette() {
  const palette = document.getElementById('commandPalette');
  const input = document.getElementById('commandPaletteInput');
  const results = document.getElementById('commandPaletteResults');
  const openButtons = document.querySelectorAll('[data-command-open]');
  if (!palette || !input || !results || !openButtons.length) return;

  let activeIndex = 0;
  let visibleCommands = [];
  const baseCommands = [
    { label: 'Dashboard', url: '/index.php', group: 'Navigate' },
    { label: 'Tasks', url: '/tasks.php', group: 'Navigate' },
    { label: 'Rooms', url: '/rooms.php', group: 'Navigate' },
    { label: 'Inventory', url: '/inventory.php', group: 'Navigate' },
    { label: 'Notes', url: '/notes/index.php', group: 'Navigate' },
    { label: 'Photos', url: '/public_task_photos.php', group: 'Navigate' },
    { label: 'Settings', url: '/account/profile.php', group: 'Navigate' },
  ];

  const openPalette = () => {
    palette.removeAttribute('hidden');
    palette.setAttribute('aria-hidden', 'false');
    document.body.classList.add('command-open');
    input.value = '';
    filterCommands('');
    setTimeout(() => input.focus(), 50);
  };

  const closePalette = () => {
    palette.setAttribute('hidden', 'true');
    palette.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('command-open');
  };

  const activateItem = (index) => {
    const items = results.querySelectorAll('.command-palette__item');
    items.forEach((item) => item.classList.remove('is-active'));
    const el = items[index];
    if (el) {
      el.classList.add('is-active');
      el.scrollIntoView({ block: 'nearest' });
      activeIndex = index;
    }
  };

  const executeCommand = (command) => {
    closePalette();
    if (!command) return;
    if (command.url) {
      window.location.href = command.url;
      return;
    }
    if (typeof command.handler === 'function') {
      command.handler();
    }
  };

  const renderCommands = (commands) => {
    visibleCommands = commands;
    results.innerHTML = '';
    if (!commands.length) {
      const empty = document.createElement('li');
      empty.className = 'command-palette__item is-empty';
      empty.textContent = 'No matches found. Try broader terms or #ID.';
      results.appendChild(empty);
      activeIndex = 0;
      return;
    }

    let currentGroup = null;
    commands.forEach((cmd, idx) => {
      if (cmd.group && cmd.group !== currentGroup) {
        currentGroup = cmd.group;
        const groupLi = document.createElement('li');
        groupLi.className = 'command-palette__group';
        groupLi.textContent = currentGroup;
        groupLi.setAttribute('role', 'presentation');
        results.appendChild(groupLi);
      }
      const li = document.createElement('li');
      li.className = 'command-palette__item';
      li.setAttribute('role', 'option');
      li.dataset.index = String(idx);
      const metaParts = [];
      if (cmd.description) metaParts.push(`<span>${cmd.description}</span>`);
      if (cmd.shortcut) metaParts.push(`<span>${cmd.shortcut}</span>`);
      const meta = metaParts.length ? `<span class="command-palette__item-meta">${metaParts.join('')}</span>` : '';
      li.innerHTML = `
        <span class="command-palette__item-label">${cmd.label}</span>
        ${meta}
      `;
      li.addEventListener('click', () => {
        const position = Number(li.dataset.index);
        executeCommand(visibleCommands[position]);
      });
      results.appendChild(li);
    });

    activeIndex = 0;
    activateItem(activeIndex);
  };

  const buildSpecialCommands = (query) => {
    const specials = [];
    const trimmed = query.trim();
    const taskMatch = trimmed.match(/^#?(\d{1,8})$/);
    if (taskMatch) {
      const id = taskMatch[1];
      specials.push({
        label: `Open Task #${id}`,
        url: `/task_view.php?id=${id}`,
        description: 'Jump directly to task details',
        group: 'Shortcuts',
      });
    }
    return specials;
  };

  const filterCommands = (query) => {
    const normalized = query.trim().toLowerCase();
    const specials = buildSpecialCommands(normalized);
    if (!normalized) {
      renderCommands([...specials, ...baseCommands]);
      return;
    }
    const matches = baseCommands.filter((cmd) => {
      const haystack = [cmd.label, cmd.description, cmd.group]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });
    renderCommands([...specials, ...matches]);
  };

  input.addEventListener('input', () => filterCommands(input.value));

  openButtons.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      openPalette();
    });
  });

  palette.addEventListener('click', (event) => {
    if (event.target.closest('[data-command-close]')) {
      closePalette();
    }
  });

  document.addEventListener('keydown', (event) => {
    if ((event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (palette.hasAttribute('hidden')) {
        openPalette();
      } else {
        closePalette();
      }
    }
  });

  input.addEventListener('keydown', (event) => {
    const items = results.querySelectorAll('.command-palette__item');
    if (!items.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      activateItem(Math.min(activeIndex + 1, items.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activateItem(Math.max(activeIndex - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const el = items[activeIndex];
      if (el) {
        const index = Number(el.dataset.index);
        executeCommand(visibleCommands[index]);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closePalette();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closePalette();
    }
  });
}

ready(() => {
  initToasts();
  initSidebar();
  initCommandPalette();
  initTaskRoomPicker();
  initNotesPage();
  initPhotoManager();
});
