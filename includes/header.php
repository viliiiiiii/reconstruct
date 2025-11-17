<?php
if (!isset($title)) { $title = APP_TITLE; }
$roleKey = current_user_role_key();
$me = current_user();
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

function bc_s($s){ return sanitize($s); }

function build_breadcrumbs(string $path): array {
  $crumbs = [
    ['label' => 'Dashboard', 'href' => '/index.php'],
  ];

  $script = basename($path);
  $dir    = trim(dirname($path), '/');

  if ($script === 'tasks.php' || preg_match('#^task_#', $script)) {
    $crumbs[] = ['label' => 'Tasks', 'href' => '/tasks.php'];
    if ($script === 'task_view.php' && isset($_GET['id'])) {
      $id = (int)$_GET['id'];
      $crumbs[] = ['label' => "Task #{$id}", 'href' => null];
    } elseif ($script === 'task_edit.php') {
      $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
      if ($id) {
        $crumbs[] = ['label' => "Task #{$id}", 'href' => "/task_view.php?id={$id}"];
        $crumbs[] = ['label' => 'Edit', 'href' => null];
      } else {
        $crumbs[] = ['label' => 'New Task', 'href' => null];
      }
    }
  }

  if ($script === 'rooms.php' || preg_match('#^rooms(/|$)#', $path)) {
    $crumbs[] = ['label' => 'Rooms', 'href' => '/rooms.php'];
  }

  if ($script === 'inventory.php' || preg_match('#^inventory(/|$)#', $path)) {
    $crumbs[] = ['label' => 'Inventory', 'href' => '/inventory.php'];
  }

  if (str_starts_with($dir, 'notes') || $dir === 'notes') {
    $crumbs[] = ['label' => 'Notes', 'href' => '/notes/index.php'];
    if ($script === 'view.php' && isset($_GET['id'])) {
      $id = (int)$_GET['id'];
      $crumbs[] = ['label' => "Note #{$id}", 'href' => null];
    } elseif ($script === 'edit.php') {
      $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
      if ($id) {
        $crumbs[] = ['label' => "Note #{$id}", 'href' => "/notes/view.php?id={$id}"];
        $crumbs[] = ['label' => 'Edit', 'href' => null];
      } else {
        $crumbs[] = ['label' => 'New Note', 'href' => null];
      }
    }
  }

  if (str_starts_with($dir, 'account') || $dir === 'account') {
    $crumbs[] = ['label' => 'Account', 'href' => '/account/profile.php'];
    if ($script === 'profile.php') {
      $crumbs[] = ['label' => 'Profile', 'href' => null];
    }
  }

  if (str_starts_with($dir, 'admin') || $dir === 'admin') {
    $crumbs[] = ['label' => 'Admin', 'href' => '/admin/activity.php'];
    if ($script === 'users.php')      $crumbs[] = ['label' => 'Users', 'href' => null];
    if ($script === 'sectors.php')    $crumbs[] = ['label' => 'Sectors', 'href' => null];
    if ($script === 'activity.php')   $crumbs[] = ['label' => 'Activity', 'href' => null];
    if ($script === 'settings.php')   $crumbs[] = ['label' => 'Settings', 'href' => null];
  }

  if (count($crumbs) === 1 && ($path !== '/' && $path !== '/index.php')) {
    $label = $script ?: 'Page';
    $crumbs[] = ['label' => $label, 'href' => null];
  }

  return $crumbs;
}

$breadcrumbs = build_breadcrumbs($path);

$navItems = [
  [
    'label' => 'Dashboard',
    'href'   => '/index.php',
    'icon'   => '🏠',
    'active' => ($path === '/' || $path === '/index.php'),
  ],
  [
    'label' => 'Tasks',
    'href'   => '/tasks.php',
    'icon'   => '🗂️',
    'active' => preg_match('#^/(tasks\.php|task_)#', $path),
  ],
  [
    'label' => 'Rooms',
    'href'   => '/rooms.php',
    'icon'   => '🏢',
    'active' => preg_match('#^/rooms(\.php|/|$)#', $path),
  ],
  [
    'label' => 'Inventory',
    'href'   => '/inventory.php',
    'icon'   => '📦',
    'active' => preg_match('#^/inventory(\.php|/|$)#', $path),
  ],
  [
    'label' => 'Notes',
    'href'   => '/notes/index.php',
    'icon'   => '📝',
    'active' => preg_match('#^/notes(/|$)#', $path),
  ],
  [
    'label' => 'Photos',
    'href'   => '/public_task_photos.php',
    'icon'   => '📷',
    'active' => preg_match('#photo#', $path),
  ],
  [
    'label' => 'Settings',
    'href'   => '/account/profile.php',
    'icon'   => '⚙️',
    'active' => str_starts_with($path, '/account/'),
  ],
];

if ($roleKey === 'root') {
  $navItems[] = ['label' => 'Admin', 'is_section' => true];
  $navItems[] = [
    'label' => 'Users',
    'href'   => '/admin/users.php',
    'icon'   => '👥',
    'active' => preg_match('#^/admin/users#', $path),
  ];
  $navItems[] = [
    'label' => 'Sectors',
    'href'   => '/admin/sectors.php',
    'icon'   => '🛰️',
    'active' => preg_match('#^/admin/sectors#', $path),
  ];
  $navItems[] = [
    'label' => 'Activity',
    'href'   => '/admin/activity.php',
    'icon'   => '📊',
    'active' => preg_match('#^/admin/activity#', $path),
  ];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?php echo bc_s($title); ?> - <?php echo bc_s(APP_TITLE); ?></title>
  <link rel="stylesheet" href="/assets/css/app.css?v=pro-2.0">
  <link rel="icon" href="/assets/favicon.ico">
  <meta name="theme-color" content="#f5f7fb">
  <script type="module" src="/assets/js/layout.js?v=pro-2.0" defer></script>
</head>
<body>
<div id="toast-container" class="toast-container" aria-live="polite" aria-atomic="true"></div>
<div class="app-shell" data-sidebar-collapsed="false">
  <aside class="app-sidebar" data-sidebar>
    <div class="app-sidebar__brand">
      <a href="/index.php" class="brand" aria-label="<?php echo bc_s(APP_TITLE); ?>">
        <span class="brand__mark"><img src="/assets/logo.png" alt="" class="brand__logo"></span>
        <div class="brand__text">
          <span class="brand__title"><?php echo bc_s(APP_TITLE); ?></span>
          <span class="brand__subtitle">Field Ops Hub</span>
        </div>
      </a>
      <button class="sidebar-collapse" type="button" aria-label="Collapse sidebar" data-sidebar-collapse>
        <span class="sidebar-collapse__icon" aria-hidden="true"></span>
      </button>
    </div>
    <nav class="app-sidebar__nav" aria-label="Primary">
      <?php foreach ($navItems as $item): ?>
        <?php if (!empty($item['is_section'])): ?>
          <div class="app-sidebar__section"><?php echo bc_s($item['label']); ?></div>
          <?php continue; ?>
        <?php endif; ?>
        <?php
          $isActive = !empty($item['active']);
          $label = bc_s($item['label']);
          $href  = bc_s($item['href']);
        ?>
        <a class="app-sidebar__link<?php echo $isActive ? ' is-active' : ''; ?>"
           href="<?php echo $href; ?>"
           title="<?php echo $label; ?>"
           data-tooltip="<?php echo $label; ?>"
           <?php echo $isActive ? 'aria-current="page"' : ''; ?>>
          <span class="app-sidebar__icon" aria-hidden="true"><?php echo $item['icon']; ?></span>
          <span class="app-sidebar__label"><?php echo $label; ?></span>
        </a>
      <?php endforeach; ?>
    </nav>
    <div class="app-sidebar__footer">
      <?php if ($me): ?>
        <div class="user-chip">
          <span class="user-chip__avatar" aria-hidden="true"><?php echo strtoupper(substr(bc_s($me['email'] ?? 'U'), 0, 1)); ?></span>
          <div class="user-chip__meta">
            <span class="user-chip__name"><?php echo bc_s($me['email'] ?? ''); ?></span>
            <span class="user-chip__role"><?php echo bc_s(ucfirst($roleKey ?? 'user')); ?></span>
          </div>
        </div>
        <a class="btn btn-ghost" href="/logout.php">Logout</a>
      <?php else: ?>
        <a class="btn btn-primary" href="/login.php">Login</a>
      <?php endif; ?>
    </div>
  </aside>
  <div class="app-shell__main">
    <header class="app-topbar">
      <button class="icon-button" type="button" aria-label="Toggle navigation" data-sidebar-mobile-toggle>
        <span></span><span></span><span></span>
      </button>
      <div class="app-topbar__title">
        <p class="eyebrow">Currently viewing</p>
        <h1><?php echo bc_s($title); ?></h1>
      </div>
      <div class="app-topbar__actions">
        <button type="button" class="btn btn-ghost" data-command-open>
          <span class="btn-icon" aria-hidden="true">⌘</span>
          Quick Find
        </button>
        <?php if ($me): ?>
          <a class="btn btn-primary" href="/account/profile.php">Profile</a>
        <?php else: ?>
          <a class="btn btn-primary" href="/login.php">Login</a>
        <?php endif; ?>
      </div>
    </header>
    <div class="app-content">
      <?php if (!empty($breadcrumbs) && is_array($breadcrumbs)): ?>
        <div class="page-head">
          <nav class="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              <?php
                $lastIdx = count($breadcrumbs) - 1;
                foreach ($breadcrumbs as $i => $c) {
                  $label = bc_s($c['label'] ?? '');
                  $href  = $c['href'] ?? null;
                  if ($i === $lastIdx || !$href) {
                    echo '<li><span aria-current="page">'.$label.'</span></li>';
                  } else {
                    echo '<li><a href="'.bc_s($href).'">'.$label.'</a></li>';
                  }
                }
              ?>
            </ol>
          </nav>
        </div>
      <?php endif; ?>
      <main class="page-main container" id="app-main">
        <?php flash_message(); ?>
