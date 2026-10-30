(function () {
  // === 1. КАЛЕНДАРЬ НА ДАШБОРДЕ ===
  const cal = document.getElementById("calendar");
  const segBtns = document.querySelectorAll(".seg .seg-btn");
  
  // Данные для календаря
  const calData = MOCK.calendar;
  let currentCalView = "week"; // По умолчанию показываем неделю

  function renderCalendar() {
    if (!cal) return;
    cal.innerHTML = "";

    // В режиме "День" берем только один день (например, 29 октября)
    // В режиме "Неделя" берем все 7 дней
    const itemsToShow = currentCalView === "week" ? calData : [calData[3]];
    
    // Настраиваем сетку
    cal.style.gridTemplateColumns = currentCalView === "week" ? "repeat(7, 1fr)" : "1fr";

    itemsToShow.forEach((d) => {
      const el = document.createElement("div");
      el.className = "cal-day";
      
      // В режиме дня делаем ячейку повыше
      if (currentCalView === "day") el.style.minHeight = "180px";
      
      let html = `<span class="num" style="font-weight:600; margin-bottom:8px; display:block;">${d.day} окт</span>`;
      
      if (d.items.length === 0) {
        html += `<div class="muted" style="font-size:12px; font-style:italic;">Нет тренировок</div>`;
      } else {
        d.items.forEach((it) => {
          html += `<div class="chip" style="background:${it.color}; margin-bottom:4px; padding:6px; border-radius:6px; color:#334155; font-size:12px;">${it.t}</div>`;
        });
      }
      
      el.innerHTML = html;
      cal.appendChild(el);
    });
  }

  // Обработчики кнопок День/Неделя
  segBtns.forEach(btn => {
    btn.onclick = () => {
      segBtns.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      
      currentCalView = btn.textContent.trim() === "День" ? "day" : "week";
      renderCalendar();
    };
  });

  renderCalendar();

  // === 2. КЛИЕНТЫ В ТАБЛИЦЕ ===
  const tbody = document.querySelector("#clientsTable tbody");
  const search = document.getElementById("clientSearch");
  const storedClients = JSON.parse(localStorage.getItem("fitClients")) || MOCK.clients;

  function renderClients(filter = "") {
    if (!tbody) return;
    tbody.innerHTML = "";
    storedClients
      .filter((c) => c.name.toLowerCase().includes(filter.toLowerCase()))
      .forEach((c) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${c.name}</strong></td>
          <td>${c.weight}</td>
          <td><span class="badge badge-${c.statusColor}">${c.status}</span></td>
          <td class="muted">${c.last}</td>`;
        tbody.appendChild(tr);
      });
  }
  renderClients();
  if (search) search.addEventListener("input", (e) => renderClients(e.target.value));

  // === 3. ЛОГИ ===
  const logs = document.getElementById("logList");
  if (logs && MOCK.logs) {
    MOCK.logs.forEach((l) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${l.title}</span><span class="muted">${l.meta}</span>`;
      logs.appendChild(li);
    });
  }

  // === 4. ГЛОБАЛЬНЫЙ ПОИСК ===
  const searchInput = document.getElementById("globalSearch");
  const searchResults = document.getElementById("searchResults");

  if (searchInput && searchResults) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (query.length < 2) { searchResults.classList.remove("is-open"); return; }

      const foundClients = storedClients.filter(c => c.name.toLowerCase().includes(query));
      const foundLogs = MOCK.logs.filter(l => l.title.toLowerCase().includes(query));

      if (foundClients.length === 0 && foundLogs.length === 0) {
        searchResults.innerHTML = `<div class="search-empty">Ничего не найдено по запросу "${query}"</div>`;
      } else {
        let html = "";
        if (foundClients.length > 0) {
          html += `<div class="search-group-title">Клиенты</div>`;
          foundClients.forEach(c => {
            html += `<div class="search-item" onclick="window.location.href='clients.html'"><span>👤 ${c.name}</span><span class="sub">${c.weight}</span></div>`;
          });
        }
        if (foundLogs.length > 0) {
          html += `<div class="search-group-title" style="margin-top:8px;">Тренировки</div>`;
          foundLogs.forEach(l => {
            html += `<div class="search-item" onclick="window.location.href='workout.html'"><span>🏋️ ${l.title.split('—')[0]}</span><span class="sub">Открыть</span></div>`;
          });
        }
        searchResults.innerHTML = html;
      }
      searchResults.classList.add("is-open");
    });

    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove("is-open");
      }
    });
  }

  // === 5. ЗАДАЧИ ===
  const taskList = document.getElementById("taskList");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const defaultTasks = [
    { text: "Проверить план Анны на неделю 3", color: "dot-amber" },
    { text: "Ответить на отчёт Максима", color: "dot-blue" },
    { text: "Обновить шаблон «Верх тела B»", color: "dot-rose" },
    { text: "Созвон с новым клиентом в 18:00", color: "dot-green" }
  ];
  
  let tasks = JSON.parse(localStorage.getItem("fitTasks"));
  if (!tasks) {
    tasks = defaultTasks;
    localStorage.setItem("fitTasks", JSON.stringify(tasks));
  }

  function renderTasks() {
    if (!taskList) return;
    taskList.innerHTML = "";
    tasks.forEach((t, index) => {
      const li = document.createElement("li");
      li.className = "task";
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";
      li.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;"><span class="dot ${t.color}"></span><span>${t.text}</span></div>
        <button class="del-task" data-idx="${index}" style="background:none; border:none; cursor:pointer; color:var(--muted); font-size:16px; padding:0 4px;" title="Удалить">&times;</button>
      `;
      taskList.appendChild(li);
    });

    document.querySelectorAll(".del-task").forEach(btn => {
      btn.onclick = () => {
        tasks.splice(btn.dataset.idx, 1);
        localStorage.setItem("fitTasks", JSON.stringify(tasks));
        renderTasks();
      };
    });
  }

  if (addTaskBtn) {
    addTaskBtn.onclick = () => {
      const colorOptions = `
        <option value="dot-amber">🟡 Желтый</option>
        <option value="dot-blue">🔵 Синий</option>
        <option value="dot-rose">🔴 Розовый</option>
        <option value="dot-green">🟢 Зеленый</option>
      `;
      const html = `
        <div class="form-group"><label>Текст задачи</label><input class="input" id="newTaskText" placeholder="Заказать инвентарь" style="width:100%;" /></div>
        <div class="form-group"><label>Цвет маркера</label><select class="input" id="newTaskColor" style="width:100%;">${colorOptions}</select></div>
      `;
      UI.openModal("Новая задача", html, (modal) => {
        const text = modal.querySelector("#newTaskText").value;
        const color = modal.querySelector("#newTaskColor").value;
        if (text.trim()) {
          tasks.push({ text, color });
          localStorage.setItem("fitTasks", JSON.stringify(tasks));
          renderTasks();
          UI.toast("Задача добавлена!");
        }
      });
    };
  }
  renderTasks();

  // === 6. ПЕРЕКЛЮЧАТЕЛЬ ТЕМ ===
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    const settings = JSON.parse(localStorage.getItem("fitSettings")) || [false, true, false, true];
    if (settings[0]) document.documentElement.classList.add("dark-theme");
    themeToggle.textContent = settings[0] ? "☀️" : "🌙";

    themeToggle.onclick = () => {
      const isDark = document.documentElement.classList.toggle("dark-theme");
      themeToggle.textContent = isDark ? "☀️" : "🌙";
      settings[0] = isDark;
      localStorage.setItem("fitSettings", JSON.stringify(settings));
    };
  }
})();