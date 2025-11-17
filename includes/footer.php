      </main>
    </div>
    <footer class="app-footer">
      <small>&copy; <?php echo date('Y'); ?> <?php echo sanitize(APP_TITLE); ?></small>
    </footer>
  </div>
</div>
<div class="app-overlay" data-sidebar-overlay></div>
<div id="commandPalette" class="command-palette" hidden aria-hidden="true">
  <div class="command-palette__backdrop" data-command-close></div>
  <div class="command-palette__panel" role="dialog" aria-modal="true" aria-labelledby="commandPaletteLabel">
    <div class="command-palette__search">
      <label id="commandPaletteLabel" class="sr-only" for="commandPaletteInput">Quick find</label>
      <input id="commandPaletteInput" type="search" name="command" autocomplete="off" placeholder="Search destinations or type #ID to open a task">
      <div class="command-palette__shortcut" aria-hidden="true">
        <kbd>Ctrl</kbd>
        <span>+</span>
        <kbd>K</kbd>
      </div>
    </div>
    <ul id="commandPaletteResults" class="command-palette__results" role="listbox"></ul>
    <footer class="command-palette__hint">
      <p>Use ↑↓ to navigate, Enter to open. Try typing <strong>#42</strong> to jump to a task.</p>
    </footer>
  </div>
</div>
</body>
</html>
