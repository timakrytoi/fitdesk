(function () {
  // 1. Загрузка состояния
  let state = JSON.parse(localStorage.getItem("workoutState")) || JSON.parse(JSON.stringify(MOCK.session));
  
  const list = document.getElementById("exerciseList");
  const sumSets = document.getElementById("sumSets");
  const sumEx = document.getElementById("sumEx");
  const saveBtn = document.getElementById("saveWorkoutBtn");
  const noteInput = document.getElementById("clientNote");
  const clientSelect = document.getElementById("workoutClientSelect");

  // 2. Заполнение списка клиентов
  const clients = JSON.parse(localStorage.getItem("fitClients")) || MOCK.clients;
  if (clientSelect) {
    clientSelect.innerHTML = clients.map(c => `<option value="${c.name}">${c.name}</option>`).join("");
    // Устанавливаем сохраненного клиента (или первого из списка)
    if (state.clientName) {
      // Если такого клиента нет в списке, добавим его принудительно
      if (!clients.find(c => c.name === state.clientName)) {
        const opt = document.createElement("option");
        opt.value = state.clientName;
        opt.textContent = state.clientName;
        clientSelect.appendChild(opt);
      }
      clientSelect.value = state.clientName;
    } else {
      state.clientName = clients[0].name;
    }

    // Обработчик смены клиента
    clientSelect.onchange = () => {
      state.clientName = clientSelect.value;
      updateMeta();
    };
  }

  // 3. Обновление заголовка (дата, статус)
  function updateMeta() {
    const metaEl = document.getElementById("workoutMeta");
    if (metaEl) {
      metaEl.innerHTML = `${state.clientName} · ${state.date} · <span class="badge badge-blue">В процессе</span>`;
    }
  }
  updateMeta();

  // === ТАЙМЕР ОТДЫХА (остался без изменений) ===
  let timer = { left: 90, total: 90, running: false, handle: null };

  function renderTimerUI() {
    const mm = String(Math.floor(timer.left / 60)).padStart(2, "0");
    const ss = String(timer.left % 60).padStart(2, "0");
    const deg = (timer.left / timer.total) * 360;

    const timerHTML = `
      <div class="rest-timer">
        <div class="rest-ring" style="background: conic-gradient(var(--accent) ${deg}deg, var(--subtle) ${deg}deg)">
          <span>⏱</span>
        </div>
        <span style="font-size:16px; font-weight:600; min-width: 50px; color:var(--text);">${mm}:${ss}</span>
        <button data-act="toggle" title="Старт/Пауза">${timer.running ? "⏸" : "▶"}</button>
        <button data-act="minus" title="-15 сек">-15</button>
        <button data-act="plus" title="+15 сек">+15</button>
        <button data-act="reset" title="Сброс">⟲</button>
      </div>
    `;

    document.getElementById("timerPill").innerHTML = timerHTML;
    document.getElementById("restTimerCard").innerHTML = timerHTML;

    document.querySelectorAll("#timerPill [data-act], #restTimerCard [data-act]").forEach(btn => {
      btn.onclick = () => {
        const act = btn.dataset.act;
        if (act === "toggle") {
          timer.running = !timer.running;
          if (timer.running) {
            clearInterval(timer.handle);
            timer.handle = setInterval(() => {
              if (timer.left > 0) { timer.left--; renderTimerUI(); }
              else { timer.running = false; clearInterval(timer.handle); renderTimerUI(); UI.toast("Отдых окончен!"); }
            }, 1000);
          } else { clearInterval(timer.handle); }
        } else if (act === "plus") { timer.left += 15; timer.total += 15; }
        else if (act === "minus") {
          if (timer.left >= 15) { timer.left -= 15; timer.total -= 15; }
          else { timer.left = 0; timer.running = false; clearInterval(timer.handle); }
        } else if (act === "reset") { timer.left = 90; timer.total = 90; timer.running = false; clearInterval(timer.handle); }
        renderTimerUI();
      };
    });
  }

  // === УПРАЖНЕНИЯ ===
  function catColor(name) {
    const cats = JSON.parse(localStorage.getItem("fitCategories")) || MOCK.categories;
    const c = cats.find((x) => x.name === name);
    return c ? c.color : "#f1f5f9";
  }

  function renderExercises() {
    list.innerHTML = "";
    state.exercises.forEach((ex) => {
      const card = document.createElement("div");
      card.className = "ex-card";
      
      // Отрисовка строк подходов с кнопкой удаления
      let setsHtml = "";
      ex.sets.forEach((s, i) => {
        setsHtml += `
          <div class="set-row ${s.done ? "is-done" : ""}" data-set="${s.id}">
            <span class="set-num">${i + 1}</span>
            <input class="set-input" type="number" value="${s.weight}" data-field="weight" />
            <input class="set-input" type="number" value="${s.reps}" data-field="reps" />
            <button class="icon-btn" data-calc="${s.id}" title="Калькулятор">⚖</button>
            <div style="display:flex; gap:8px; align-items:center; justify-content:flex-end;">
              <input class="set-check" type="checkbox" ${s.done ? "checked" : ""} data-check="${s.id}" />
              <button class="del-set-btn" data-del-set="${s.id}" data-ex="${ex.id}" title="Удалить подход">✕</button>
            </div>
          </div>`;
      });

      card.innerHTML = `
        <div class="ex-head">
          <div class="ex-head-left">
            <span class="pill" style="background:${catColor(ex.category)}">${ex.category}</span>
            <span class="ex-title">${ex.name}</span>
            ${ex.superset ? `<span class="badge badge-gray">Суперсет ${ex.superset}</span>` : ""}
          </div>
          <button class="icon-btn" data-menu="${ex.id}">⋯</button>
        </div>
        <div class="ex-cols">
          <span>Подх.</span><span>Вес (кг)</span><span>Повторы</span><span>Кальк</span><span style="text-align:right;">Готово</span>
        </div>
        <div class="ex-rows">
          ${setsHtml}
          <button class="add-set" data-add="${ex.id}">+ Добавить подход</button>
        </div>
      `;
      list.appendChild(card);
    });
    
    bindEvents();
    updateSummary();
  }

  function updateSummary() {
    const allSets = state.exercises.flatMap(e => e.sets);
    const doneSets = allSets.filter(s => s.done).length;
    sumSets.textContent = `${doneSets} / ${allSets.length}`;
    sumEx.textContent = state.exercises.length;
  }

  function bindEvents() {
    list.querySelectorAll(".set-row").forEach(row => {
      row.querySelectorAll("input[type=number]").forEach(input => {
        input.onchange = () => {
          const setId = row.dataset.set;
          const field = input.dataset.field;
          state.exercises.forEach(ex => {
            const s = ex.sets.find(x => x.id === setId);
            if (s) s[field] = Number(input.value);
          });
        };
      });
    });

    list.querySelectorAll("[data-check]").forEach(chk => {
      chk.onchange = () => {
        const id = chk.dataset.check;
        state.exercises.forEach(ex => {
          const s = ex.sets.find(x => x.id === id);
          if (s) s.done = chk.checked;
        });
        chk.closest(".set-row").classList.toggle("is-done", chk.checked);
        updateSummary();
      };
    });

    // УДАЛЕНИЕ ПОДХОДА
    list.querySelectorAll("[data-del-set]").forEach(btn => {
      btn.onclick = () => {
        const setId = btn.dataset.delSet;
        const exId = btn.dataset.ex;
        const ex = state.exercises.find(x => x.id === exId);
        if (ex) {
          if (ex.sets.length === 1) {
            UI.toast("Должен остаться хотя бы один подход");
            return;
          }
          ex.sets = ex.sets.filter(s => s.id !== setId);
          renderExercises();
        }
      };
    });

    list.querySelectorAll("[data-calc]").forEach(btn => {
      btn.onclick = (e) => openCalc(e, btn.dataset.calc);
    });

    list.querySelectorAll("[data-add]").forEach(btn => {
      btn.onclick = () => {
        const ex = state.exercises.find(x => x.id === btn.dataset.add);
        const last = ex.sets[ex.sets.length - 1];
        ex.sets.push({ id: "s" + Date.now(), weight: last ? last.weight : 0, reps: last ? last.reps : 0, done: false });
        renderExercises();
      };
    });

    list.querySelectorAll("[data-menu]").forEach(btn => {
      btn.onclick = (e) => { e.stopPropagation(); openExMenu(btn, btn.dataset.menu); };
    });
  }

  // === НОВЫЙ КАЛЬКУЛЯТОР ВЕСА ===
  function openCalc(e, setId) {
    document.querySelectorAll(".calc-pop").forEach(el => el.remove());
    const pop = document.createElement("div");
    pop.className = "calc-pop";
    
    // Находим текущий вес
    let current = 0;
    state.exercises.forEach(ex => {
      const s = ex.sets.find(x => x.id === setId);
      if (s) current = s.weight;
    });

    function render() {
      pop.innerHTML = `
        <div class="calc-title">Калькулятор веса</div>
        <input class="calc-display" type="number" value="${current}" step="0.5" />
        
        <div class="calc-grid">
          <button class="calc-btn" data-set="${current - 5}">-5</button>
          <button class="calc-btn" data-set="${current - 2.5}">-2.5</button>
          <button class="calc-btn" data-set="${current + 2.5}">+2.5</button>
          <button class="calc-btn" data-set="${current + 5}">+5</button>
        </div>
        
        <div class="calc-grid">
          <button class="calc-btn" data-pct="-5">-5%</button>
          <button class="calc-btn" data-pct="-2.5">-2.5%</button>
          <button class="calc-btn" data-pct="+2.5">+2.5%</button>
          <button class="calc-btn" data-pct="+5">+5%</button>
        </div>

        <div class="calc-footer">
          <button class="calc-btn calc-btn-primary" id="calcApply">Применить</button>
        </div>
      `;

      // Ввод вручную
      const input = pop.querySelector(".calc-display");
      input.onchange = () => {
        current = Number(input.value);
        render();
      };
      
      // Кнопки фиксированного веса
      pop.querySelectorAll("[data-set]").forEach(b => {
        b.onclick = () => {
          current = Number(b.dataset.set);
          render();
        };
      });

      // Кнопки процентов
      pop.querySelectorAll("[data-pct]").forEach(b => {
        b.onclick = () => {
          const pct = Number(b.dataset.pct);
          current = Math.round(current * (1 + pct / 100) * 2) / 2; // Округление до 0.5
          render();
        };
      });

      // Применить
      pop.querySelector("#calcApply").onclick = () => {
        state.exercises.forEach(ex => {
          const s = ex.sets.find(x => x.id === setId);
          if (s) s.weight = current;
        });
        renderExercises();
        pop.remove();
      };
    }

    document.body.appendChild(pop);
    const rect = e.target.getBoundingClientRect();
    // Позиционируем так, чтобы не уходило за экран
    let left = rect.left;
    let top = rect.bottom + 8;
    if (left + 280 > window.innerWidth) left = window.innerWidth - 290;
    
    pop.style.position = "absolute";
    pop.style.left = left + window.scrollX + "px";
    pop.style.top = top + window.scrollY + "px";
    
    render();

    // Закрытие по клику вне
    setTimeout(() => {
      const closeHandler = (ev) => {
        if (!pop.contains(ev.target) && ev.target !== e.target) {
          pop.remove();
          document.removeEventListener("click", closeHandler);
        }
      };
      document.addEventListener("click", closeHandler);
    }, 10);
  }

  // === МЕНЮ УПРАЖНЕНИЯ (Без изменений, для краткости) ===
  function openExMenu(anchor, exId) {
    document.querySelectorAll(".ex-menu").forEach(el => el.remove());
    const ex = state.exercises.find(x => x.id === exId);
    const menu = document.createElement("div");
    menu.className = "ex-menu";
    Object.assign(menu.style, { position: "absolute", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "6px", width: "220px", boxShadow: "0 8px 24px rgba(15,23,42,.15)", zIndex: 100 });
    
    const actions = [
      { icon: "✏️", text: "Редактировать", fn: () => editExercise(ex) },
      { icon: "⏱", text: "Свой таймер", fn: () => editRest(ex) },
      { icon: "⬆", text: "Вверх", fn: () => moveEx(ex, -1) },
      { icon: "⬇", text: "Вниз", fn: () => moveEx(ex, 1) },
      { icon: "🗑", text: "Удалить", color: "#ef4444", fn: () => delEx(exId) }
    ];

    menu.innerHTML = actions.map((a, i) => 
      `<div data-i="${i}" style="padding:8px 10px; border-radius:8px; font-size:13px; color:${a.color || 'var(--text)'}; cursor:pointer;" onmouseover="this.style.background='var(--subtle)'" onmouseout="this.style.background='transparent'">${a.icon} ${a.text}</div>`
    ).join("");
    
    document.body.appendChild(menu);
    const rect = anchor.getBoundingClientRect();
    menu.style.left = rect.right - 220 + window.scrollX + "px";
    menu.style.top = rect.bottom + window.scrollY + 6 + "px";

    menu.querySelectorAll("[data-i]").forEach(el => {
      el.onclick = () => { actions[el.dataset.i].fn(); menu.remove(); };
    });

    setTimeout(() => document.addEventListener("click", function close(e) {
      if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener("click", close); }
    }, { once: true }), 0);
  }

  function editExercise(ex) {
    UI.openModal("Редактировать упражнение", `<div class="form-group"><label>Название</label><input class="input" id="editExName" value="${ex.name}" style="width:100%" /></div>`, (modal) => {
      ex.name = modal.querySelector("#editExName").value;
      renderExercises(); UI.toast("Упражнение обновлено");
    });
  }

  function editRest(ex) {
    UI.openModal("Таймер отдыха", `<div class="form-group"><label>Секунды</label><input class="input" id="editRest" type="number" value="${ex.restSeconds}" style="width:100%" /></div>`, (modal) => {
      ex.restSeconds = Number(modal.querySelector("#editRest").value);
      UI.toast("Таймер обновлен");
    });
  }

  function moveEx(ex, dir) {
    const idx = state.exercises.indexOf(ex);
    if (dir === -1 && idx > 0) {
      [state.exercises[idx - 1], state.exercises[idx]] = [state.exercises[idx], state.exercises[idx - 1]];
      renderExercises();
    } else if (dir === 1 && idx < state.exercises.length - 1) {
      [state.exercises[idx + 1], state.exercises[idx]] = [state.exercises[idx], state.exercises[idx + 1]];
      renderExercises();
    }
  }

  function delEx(exId) {
    if (confirm("Удалить упражнение из тренировки?")) {
      state.exercises = state.exercises.filter(x => x.id !== exId);
      renderExercises();
    }
  }

  // === СОХРАНЕНИЕ ===
  if (saveBtn) {
    saveBtn.onclick = () => {
      localStorage.setItem("workoutState", JSON.stringify(state));
      UI.toast(`Тренировка для ${state.clientName} сохранена!`);
    };
  }

  if (noteInput) {
    noteInput.value = localStorage.getItem("workoutNote") || "";
    noteInput.addEventListener("input", () => {
      localStorage.setItem("workoutNote", noteInput.value);
    });
  }

  renderExercises();
  renderTimerUI();
})();