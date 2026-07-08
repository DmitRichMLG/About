/* ==========================================================================
   Windows 98 desktop — behaviour
   Window drag / focus / minimize / maximize / close, taskbar, Start menu,
   clock, desktop-icon selection, Telegram links, shutdown easter egg.
   ========================================================================== */
(function () {
  "use strict";

  var desktop   = document.getElementById("desktop");
  var taskTray  = document.getElementById("taskbar-tasks");
  var startBtn  = document.getElementById("start-button");
  var startMenu = document.getElementById("start-menu");
  var clockEl   = document.getElementById("clock");
  var shutdown  = document.getElementById("shutdown-screen");
  var boot      = document.getElementById("boot");

  var windows = {};                // id -> { el, taskBtn }
  var zTop    = 100;

  // reliable touch detection (matchMedia("(hover:none)") alone is flaky)
  var isTouchDevice = (navigator.maxTouchPoints > 0) ||
                      ("ontouchstart" in window) ||
                      window.matchMedia("(hover: none)").matches;
  var isMobile = function () { return window.innerWidth <= 640; };

  /* ---------------------------------------------------------------- init */
  document.querySelectorAll(".window").forEach(function (el) {
    var id = el.getAttribute("data-win");
    windows[id] = { el: el, taskBtn: null,
                    home: { left: el.style.left, top: el.style.top, width: el.style.width } };
    makeDraggable(el);
    wireControls(el, id);

    // clicking anywhere in a window brings it to front
    el.addEventListener("pointerdown", function () { focusWindow(id); });
  });

  // any element with data-open launches / focuses a window
  document.querySelectorAll("[data-open]").forEach(function (el) {
    var target = el.getAttribute("data-open");
    var handler = function (e) { if (e) e.stopPropagation(); openWindow(target); };
    // desktop icons: single click selects, double click opens
    // (on touch devices a single tap both selects and opens)
    if (el.classList.contains("desktop-icon")) {
      el.addEventListener("dblclick", handler);
      el.addEventListener("click", function (e) {
        selectIcon(el);
        if (isTouchDevice) handler(e);
      });
    } else {
      el.addEventListener("click", handler);
    }
  });

  // external links (Telegram)
  document.querySelectorAll("[data-link]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      window.open(el.getAttribute("data-link"), "_blank", "noopener");
    });
  });

  // course row selection (file-manager feel)
  document.querySelectorAll(".course-item").forEach(function (row) {
    row.addEventListener("click", function () {
      document.querySelectorAll(".course-item.selected")
        .forEach(function (r) { r.classList.remove("selected"); });
      row.classList.add("selected");
      var win = windows.courses.el;
      var status = win.querySelector(".status-bar .field.small");
      if (status) status.textContent = row.querySelector(".course-title").textContent;
    });
    row.addEventListener("dblclick", function () { openWindow("contact"); });
  });

  /* --------------------------------------------------------- windows API */
  function openWindow(id) {
    var w = windows[id];
    if (!w) return;
    w.el.classList.remove("hidden");
    layoutWindow(w.el);
    ensureTaskButton(id);
    focusWindow(id);
    startMenu.classList.add("hidden");
    startBtn.classList.remove("active");
  }

  // On narrow screens fixed pixel coordinates push windows off-screen. Re-flow
  // them to fit: viewport-wide and anchored to the BOTTOM (just above the
  // taskbar) so the desktop icons at the top stay visible and tappable.
  function layoutWindow(el) {
    if (el.classList.contains("maximized")) return;
    var id = el.getAttribute("data-win");
    if (isMobile()) {
      var m = 6, tb = 30;                       // margin, taskbar height
      var icons = document.querySelector(".desktop-icons");
      var reserveTop = icons ? Math.ceil(icons.getBoundingClientRect().bottom) + 10 : 200;
      var avail = window.innerHeight - tb - m - reserveTop;
      if (avail < 220) avail = 220;             // keep the window usable
      el.style.left = m + "px";
      el.style.right = "auto";
      el.style.width = (window.innerWidth - m * 2) + "px";
      el.style.top = "auto";
      el.style.bottom = (tb + m) + "px";        // sit right above the taskbar
      el.style.maxHeight = avail + "px";        // grows upward, body scrolls
    } else {
      var home = windows[id] && windows[id].home;
      if (home) {
        el.style.left = home.left;
        el.style.top = home.top;
        el.style.width = home.width;
      }
      el.style.right = "";
      el.style.bottom = "";
      el.style.maxHeight = "";
    }
  }

  function closeWindow(id) {
    var w = windows[id];
    if (!w) return;
    if (w.el.classList.contains("maximized")) restoreMax(w.el);
    w.el.classList.add("hidden");
    removeTaskButton(id);
  }

  function minimizeWindow(id) {
    var w = windows[id];
    w.el.classList.add("hidden");
    if (w.taskBtn) w.taskBtn.classList.remove("active");
  }

  function focusWindow(id) {
    var w = windows[id];
    if (!w || w.el.classList.contains("hidden")) return;
    Object.keys(windows).forEach(function (k) {
      windows[k].el.classList.add("inactive");
      if (windows[k].taskBtn) windows[k].taskBtn.classList.remove("active");
    });
    w.el.classList.remove("inactive");
    w.el.style.zIndex = ++zTop;
    if (w.taskBtn) w.taskBtn.classList.add("active");
  }

  /* title-bar controls */
  function wireControls(el, id) {
    el.querySelectorAll(".title-bar-controls button").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var action = b.getAttribute("data-action");
        if (action === "close")        closeWindow(id);
        else if (action === "minimize") minimizeWindow(id);
        else if (action === "maximize") toggleMax(el, b);
      });
    });
    // double click the title bar = maximize toggle
    var bar = el.querySelector(".title-bar");
    bar.addEventListener("dblclick", function () {
      var b = el.querySelector('[data-action="maximize"]');
      toggleMax(el, b);
    });
  }

  function toggleMax(el, btn) {
    if (el.classList.contains("maximized")) restoreMax(el, btn);
    else {
      el._prev = { left: el.style.left, top: el.style.top,
                   width: el.style.width, height: el.style.height };
      el.classList.add("maximized");
      if (btn) { btn.classList.remove("btn-max"); btn.classList.add("btn-restore"); }
    }
  }
  function restoreMax(el, btn) {
    el.classList.remove("maximized");
    if (el._prev) {
      el.style.left = el._prev.left; el.style.top = el._prev.top;
      el.style.width = el._prev.width; el.style.height = el._prev.height;
    }
    layoutWindow(el);   // re-apply the bottom anchor on mobile
    btn = btn || el.querySelector('[data-action="maximize"]');
    if (btn) { btn.classList.remove("btn-restore"); btn.classList.add("btn-max"); }
  }

  /* ----------------------------------------------------------- taskbar */
  function ensureTaskButton(id) {
    var w = windows[id];
    if (w.taskBtn) return;
    var titleEl = w.el.querySelector(".title-bar-text");
    var iconEl  = w.el.querySelector(".title-bar-icon");

    var btn = document.createElement("div");
    btn.className = "task-button";
    if (iconEl && iconEl.tagName === "IMG") {
      var im = document.createElement("img");
      im.src = iconEl.getAttribute("src");
      im.alt = "";
      btn.appendChild(im);
    } else {
      var g = document.createElement("span");
      g.className = "glyph glyph-folder";
      g.style.cssText = "width:14px;height:11px;margin-top:2px";
      btn.appendChild(g);
    }
    var lbl = document.createElement("span");
    lbl.textContent = titleEl.textContent;
    btn.appendChild(lbl);
    btn.addEventListener("click", function () {
      var hidden = w.el.classList.contains("hidden");
      var active = !w.el.classList.contains("inactive");
      if (hidden) { openWindow(id); }
      else if (active) { minimizeWindow(id); }   // active -> minimize
      else { focusWindow(id); }                  // background -> focus
    });
    taskTray.appendChild(btn);
    w.taskBtn = btn;
  }

  function removeTaskButton(id) {
    var w = windows[id];
    if (w.taskBtn) { w.taskBtn.remove(); w.taskBtn = null; }
  }

  /* --------------------------------------------------------- dragging */
  function makeDraggable(el) {
    var bar = el.querySelector(".title-bar");
    var startX, startY, origLeft, origTop, dragging = false;

    bar.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".title-bar-controls")) return;
      if (el.classList.contains("maximized")) return;
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      var r = el.getBoundingClientRect();
      origLeft = r.left; origTop = r.top;
      // drop the bottom anchor (mobile) so top-based dragging doesn't stretch
      el.style.bottom = "auto";
      el.style.top = r.top + "px";
      bar.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    bar.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var nx = origLeft + (e.clientX - startX);
      var ny = origTop  + (e.clientY - startY);
      // keep the title bar reachable
      var maxX = window.innerWidth  - 60;
      var maxY = window.innerHeight - 60;
      nx = Math.max(-el.offsetWidth + 80, Math.min(nx, maxX));
      ny = Math.max(0, Math.min(ny, maxY));
      el.style.left = nx + "px";
      el.style.top  = ny + "px";
    });

    var stop = function (e) {
      if (!dragging) return;
      dragging = false;
      try { bar.releasePointerCapture(e.pointerId); } catch (_) {}
    };
    bar.addEventListener("pointerup", stop);
    bar.addEventListener("pointercancel", stop);
  }

  /* --------------------------------------------------- desktop icons */
  function selectIcon(icon) {
    document.querySelectorAll(".desktop-icon.selected")
      .forEach(function (i) { i.classList.remove("selected"); });
    icon.classList.add("selected");
  }
  desktop.addEventListener("pointerdown", function (e) {
    if (e.target === desktop) {
      document.querySelectorAll(".desktop-icon.selected")
        .forEach(function (i) { i.classList.remove("selected"); });
    }
  });

  /* ------------------------------------------------------- Start menu */
  startBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = startMenu.classList.toggle("hidden");
    startBtn.classList.toggle("active", !open);
  });
  document.addEventListener("click", function () {
    startMenu.classList.add("hidden");
    startBtn.classList.remove("active");
  });
  startMenu.addEventListener("click", function (e) { e.stopPropagation(); });

  startMenu.querySelectorAll(".start-item").forEach(function (item) {
    item.addEventListener("click", function () {
      if (item.hasAttribute("data-shutdown")) { doShutdown(); return; }
      var target = item.getAttribute("data-open");
      if (target) openWindow(target);
      startMenu.classList.add("hidden");
      startBtn.classList.remove("active");
    });
  });

  /* -------------------------------------------------------- shutdown */
  function doShutdown() {
    startMenu.classList.add("hidden");
    startBtn.classList.remove("active");
    shutdown.classList.add("show");
  }
  shutdown.addEventListener("click", function () {
    shutdown.classList.remove("show");
  });

  /* ----------------------------------------------------------- clock */
  function tick() {
    var d = new Date();
    var h = d.getHours(), m = d.getMinutes();
    clockEl.textContent = (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
  }
  tick();
  setInterval(tick, 15000);

  /* ------------------------------------------ Telegram avatar cycle */
  var avatar = document.getElementById("tg-avatar");
  if (avatar) {
    var faces = ["img/telegram.png", "img/1.png", "img/2.png", "img/3.png",
                 "img/4.png", "img/5.png", "img/6.png", "img/7.png"];
    faces.forEach(function (s) { var im = new Image(); im.src = s; });
    var fi = 0;
    setInterval(function () {
      fi = (fi + 1) % faces.length;
      avatar.src = faces[fi];
    }, 1600);
  }

  /* --------------------------------------------- re-flow on resize/rotate */
  var _resizeT;
  window.addEventListener("resize", function () {
    clearTimeout(_resizeT);
    _resizeT = setTimeout(function () {
      Object.keys(windows).forEach(function (k) {
        if (!windows[k].el.classList.contains("hidden")) layoutWindow(windows[k].el);
      });
    }, 150);
  });

  /* ------------------------------------------------------------ boot */
  function finishBoot() {
    boot.classList.add("done");
    setTimeout(function () { boot.style.display = "none"; }, 450);
    // the About window is shown by default — make sure it fits this screen
    layoutWindow(windows.about.el);
    ensureTaskButton("about");
    focusWindow("about");
  }

  window.addEventListener("load", function () { setTimeout(finishBoot, 1900); });

  // if load already fired
  if (document.readyState === "complete") finishBoot();
})();
