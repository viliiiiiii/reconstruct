const roomsCache = new Map();

async function fetchRoomsForBuilding(buildingId) {
  const key = String(buildingId || '');
  if (!key || key === '0') return [];
  if (roomsCache.has(key)) {
    return roomsCache.get(key);
  }
  try {
    const resp = await fetch(`/rooms.php?action=by_building&id=${encodeURIComponent(key)}`, {
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' },
    });
    if (!resp.ok) throw new Error('Failed to fetch rooms');
    const data = await resp.json();
    if (Array.isArray(data)) {
      roomsCache.set(key, data);
      return data;
    }
  } catch (err) {
    console.warn('Room lookup failed', err);
  }
  roomsCache.set(key, []);
  return [];
}

const ensurePlaceholder = (target) => {
  if (!target || target.dataset.roomPlaceholder) return;
  const first = target.querySelector('option[value=""]');
  if (first) target.dataset.roomPlaceholder = first.textContent.trim();
};

const populateSelect = (target, rooms) => {
  if (!target) return;
  ensurePlaceholder(target);
  const placeholder = target.dataset.roomPlaceholder || 'Select room';
  const current = target.value;
  target.innerHTML = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = placeholder;
  target.appendChild(defaultOption);
  let found = false;
  rooms.forEach((room) => {
    const option = document.createElement('option');
    option.value = String(room.id);
    option.textContent = room.label || room.room_number || `Room ${room.id}`;
    if (String(room.id) === current) {
      option.selected = true;
      found = true;
    }
    target.appendChild(option);
  });
  if (!found) {
    target.value = '';
  }
};

const populateDatalist = (datalist, rooms) => {
  if (!datalist) return;
  datalist.innerHTML = '';
  rooms.forEach((room) => {
    const opt = document.createElement('option');
    opt.value = room.room_number || room.label || '';
    opt.label = room.label || opt.value;
    datalist.appendChild(opt);
  });
};

const validateRoomInput = (input, rooms, buildingId) => {
  if (!input) return;
  const trimmed = input.value.trim();
  if (!buildingId) {
    input.setCustomValidity(trimmed ? 'Choose a building first.' : '');
    return;
  }
  if (!trimmed) {
    input.setCustomValidity('');
    return;
  }
  const exists = rooms.some((room) => {
    const number = (room.room_number || '').toLowerCase();
    return number && number === trimmed.toLowerCase();
  });
  input.setCustomValidity(exists ? '' : 'Room not found for this building.');
};

export const initTaskRoomPicker = () => {
  const sources = document.querySelectorAll('[data-room-source]');
  if (!sources.length) return;

  sources.forEach((select) => {
    const targetAttr = select.dataset.roomTarget || '';
    const targetIds = targetAttr.split(/\s+/).filter(Boolean);
    const inputId = select.dataset.roomInput;
    const datalistId = select.dataset.roomDatalist;
    const targets = targetIds.length
      ? targetIds.map((id) => document.getElementById(id)).filter(Boolean)
      : [];
    const target = targets[0] || null;
    const input = inputId ? document.getElementById(inputId) : null;
    const datalist = datalistId ? document.getElementById(datalistId) : null;

    targets.forEach((t) => ensurePlaceholder(t));
    if (!targets.length && target) ensurePlaceholder(target);

    const refresh = async () => {
      const buildingId = select.value;
      if (!buildingId) {
        targets.forEach((t) => {
          populateSelect(t, []);
          t.disabled = true;
        });
        if (!targets.length && target) {
          populateSelect(target, []);
          target.disabled = true;
        }
        if (datalist) datalist.innerHTML = '';
        if (input) input.setCustomValidity('');
        return;
      }
      const rooms = await fetchRoomsForBuilding(buildingId);
      targets.forEach((t) => {
        populateSelect(t, rooms);
        t.disabled = false;
      });
      if (!targets.length && target) {
        populateSelect(target, rooms);
        target.disabled = false;
      }
      populateDatalist(datalist, rooms);
      validateRoomInput(input, rooms, buildingId);
    };

    select.addEventListener('change', refresh);

    if (input) {
      input.addEventListener('blur', async () => {
        const buildingId = select.value;
        if (!buildingId) {
          validateRoomInput(input, [], '');
          return;
        }
        const rooms = await fetchRoomsForBuilding(buildingId);
        validateRoomInput(input, rooms, buildingId);
      });
      input.addEventListener('input', () => {
        input.setCustomValidity('');
      });
    }

    if (select.value) {
      refresh();
    } else {
      targets.forEach((t) => { if (t) t.disabled = true; });
      if (!targets.length && target) target.disabled = true;
    }
  });
};
