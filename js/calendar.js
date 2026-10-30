(function() {
  const container = document.getElementById("calendarContainer");
  const addBtn = document.getElementById("addSessionBtn");
  const toggleBtns = document.querySelectorAll("#viewToggle .seg-btn");
  
  // Кнопки навигации по месяцам
  const prevBtn = document.getElementById("prevMonthBtn");
  const nextBtn = document.getElementById("nextMonthBtn");
  const monthTitle = document.getElementById("calendarMonthTitle");

  // Загружаем сессии из памяти
  let sessions = JSON.parse(localStorage.getItem("fitCalendar")) || [
    { id: 1, date: "2026-10-27", title: "Максим · Низ B", color: "#dcfce7" },
    { id: 2, date: "2026-10-28", title: "Ольга · Кардио", color: "#fef3c7" },
    { id: 3, date: "2026-10-29", title: "Анна · Верх A", color: "#dbeafe" },
    { id: 4, date: "2026-10-29", title: "Дарья · Full", color: "#fde2e4" },
    { id: 5, date: "2026-10-30", title: "Игорь · Знакомство", color: "#ede9fe" }
  ];

  let currentView = "month";
  
  // Переменные для текущего отображаемого месяца
  let currentYear = 2026;
  let currentMonth = 9; // 9 = Октябрь (0-индексация)

  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

  function save() {
    localStorage.setItem("fitCalendar", JSON.stringify(sessions));
  }

  function deleteSession(id, e) {
    e.stopPropagation(); // Предотвращаем открытие модалки
    if (confirm("Удалить эту тренировку из календаря?")) {
      sessions = sessions.filter(s => s.id !== id);
      save();
      render();
      UI.toast("Тренировка удалена");
    }
  }

  // --- НАВИГАЦИЯ ПО МЕСЯЦАМ ---
  if (prevBtn) {
    prevBtn.onclick = () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      render();
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      render();
    };
  }

  function updateTitle() {
    if (monthTitle) {
      monthTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
  }

  function render() {
    container.innerHTML = "";
    updateTitle();
    
    if (currentView === "month") {
      renderMonth();
    } else {
      renderWeek();
    }
  }

  // --- ОТРИСОВКА МЕСЯЦА ---
  function renderMonth() {
    const grid = document.createElement("div");
    grid.className = "calendar";
    // УБРАНО: grid.style.gridTemplateColumns = "repeat(7, 1fr)"; 
    // Теперь колонки задаются в CSS (и адаптируются под мобильные)
    
    // Заголовки дней недели
    ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].forEach(d => {
      const el = document.createElement("div");
      el.style.cssText = "font-size: 11px; text-transform: uppercase; color: var(--muted); text-align: center; margin-bottom: 8px; font-weight:600;";
      el.textContent = d;
      grid.appendChild(el);
    });

    // Вычисляем первый день месяца и количество дней
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); 
    // В JS воскресенье = 0, а нам нужно, чтобы понедельник был 0 (для сетки)
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Пустые ячейки для смещения (если месяц начинается не с понедельника)
    for (let i = 0; i < startOffset; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.className = "cal-day";
      emptyCell.style.background = "transparent";
      emptyCell.style.border = "1px dashed var(--border)";
      grid.appendChild(emptyCell);
    }

    // Сетка дней
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const daySessions = sessions.filter(s => s.date === dateStr);

      const cell = document.createElement("div");
      cell.className = "cal-day";
      
      let html = `<span class="num" style="font-weight:600; color:var(--text);">${day}</span>`;
      
      daySessions.forEach(s => {
        html += `
          <div class="chip" style="background:${s.color}; margin-top:4px; display:flex; justify-content:space-between; align-items:center; padding: 4px 6px; cursor:pointer;" title="${s.title}">
            <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s.title}</span>
            <span class="del-session" data-id="${s.id}" style="font-size:14px; color:#64748b; padding:0 4px; cursor:pointer;" title="Удалить">&times;</span>
          </div>
        `;
      });

      cell.innerHTML = html;
      
      // Клик по пустому месту открывает форму
      cell.onclick = (e) => {
        if (e.target.classList.contains('chip') || e.target.classList.contains('del-session')) return;
        openSessionModal(dateStr, day);
      };

      // Обработчик удаления
      cell.querySelectorAll(".del-session").forEach(btn => {
        btn.onclick = (e) => deleteSession(Number(btn.dataset.id), e);
      });

      grid.appendChild(cell);
    }
    container.appendChild(grid);
  }

  // --- ОТРИСОВКА НЕДЕЛИ ---
  function renderWeek() {
    const wrapper = document.createElement("div");
    wrapper.className = "cal-week-mode";

    // Берем первые 7 дней текущего месяца
    for (let i = 1; i <= 7; i++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const daySessions = sessions.filter(s => s.date === dateStr);
        
        const row = document.createElement("div");
        row.className = "cal-week-day";
        
        let eventsHtml = "";
        daySessions.forEach(s => {
            eventsHtml += `
            <div style="padding:6px 10px; border-radius:8px; font-size:13px; background:${s.color}; color:#334155; font-weight:500; display:flex; justify-content:space-between; align-items:center;">
                <span>${s.title}</span>
                <span class="del-session" data-id="${s.id}" style="cursor:pointer; color:#64748b; font-size:16px; line-height:1;" title="Удалить">&times;</span>
            </div>
            `;
        });

        if (daySessions.length === 0) {
            eventsHtml = `<div style="font-size:13px; color:var(--muted); padding:6px 10px; font-style:italic;">Нет тренировок. Нажмите, чтобы добавить.</div>`;
        }

        row.innerHTML = `
            <div class="cal-week-date">
            <strong>${i}</strong>
            <span>${monthNames[currentMonth].substring(0, 3)}</span>
            </div>
            <div class="cal-week-events" style="width:100%;">${eventsHtml}</div>
        `;

        row.querySelectorAll(".del-session").forEach(btn => {
            btn.onclick = (e) => deleteSession(Number(btn.dataset.id), e);
        });

        row.onclick = (e) => {
            if (e.target.classList.contains('del-session')) return;
            openSessionModal(dateStr, i);
        };
        
        wrapper.appendChild(row);
    }

    container.appendChild(wrapper);
  }

  // --- МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ---
  function openSessionModal(dateStr, dayNum) {
    const colorOptions = `
      <option value="#dbeafe">🔵 Синий (Верх тела)</option>
      <option value="#dcfce7">🟢 Зеленый (Низ тела)</option>
      <option value="#fde2e4">🔴 Розовый (Кардио)</option>
      <option value="#fef3c7">🟡 Желтый (Растяжка)</option>
      <option value="#ede9fe">🟣 Фиолетовый (Full Body)</option>
      <option value="#f1f5f9">⚪ Серый (Другое)</option>
    `;
    
    const html = `
      <div class="form-group">
        <label>Дата</label>
        <input class="input" id="sessionDate" type="text" value="${dateStr} (${dayNum} число)" style="width:100%;" disabled />
      </div>
      <div class="form-group">
        <label>Название (Клиент · Тип)</label>
        <input class="input" id="sessionTitle" placeholder="Анна · Верх тела A" style="width:100%;" />
      </div>
      <div class="form-group">
        <label>Время начала</label>
        <input class="input" id="sessionTime" type="time" value="10:00" style="width:100%;" />
      </div>
      <div class="form-group">
        <label>Тип тренировки (цвет)</label>
        <select class="input" id="sessionColor" style="width:100%;">${colorOptions}</select>
      </div>
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border);">
        <button type="button" class="btn" id="addToGoogleBtn" style="width:100%; display:flex; align-items:center; justify-content:center; gap:8px;">
          <span style="font-size:18px;">📅</span> Добавить в Google Calendar
        </button>
      </div>
    `;

    UI.openModal("Добавить сессию", html, (modal) => {
      const title = modal.querySelector("#sessionTitle").value;
      const color = modal.querySelector("#sessionColor").value;
      const time = modal.querySelector("#sessionTime").value;
      
      if (title) {
        sessions.push({ id: Date.now(), date: dateStr, title, color, time });
        save();
        render();
        UI.toast("Сессия добавлена!");
      }
    });

    // Кнопка Google Calendar
    setTimeout(() => {
      const googleBtn = document.getElementById("addToGoogleBtn");
      if (googleBtn) {
        googleBtn.onclick = () => {
          const title = document.getElementById("sessionTitle").value;
          const time = document.getElementById("sessionTime").value;
          if (!title) { UI.toast("Сначала введите название тренировки"); return; }

          const startDateTime = `${dateStr.replace(/-/g, '')}T${time.replace(':', '')}00`;
          const endHour = String(Number(time.split(':')[0]) + 1).padStart(2, '0');
          const endDateTime = `${dateStr.replace(/-/g, '')}T${endHour}${time.split(':')[1]}00`;

          const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent("Тренировка FitDesk")}`;

          window.open(googleUrl, '_blank');
          UI.toast("Открываем Google Calendar...");
        };
      }
    }, 100);
  }

  // --- ОБРАБОТЧИКИ ---
  if (addBtn) {
    addBtn.onclick = () => {
      openSessionModal(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`, 1);
    };
  }

  toggleBtns.forEach(btn => {
    btn.onclick = () => {
      toggleBtns.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      currentView = btn.dataset.view;
      render();
    };
  });

  // Инициализация
  render();
})();