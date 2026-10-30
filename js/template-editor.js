(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get('id');

  // Загружаем шаблоны
  let templates = JSON.parse(localStorage.getItem("fitTemplates")) || [];
  let currentTpl = templates.find(t => t.id == templateId);

  if (!currentTpl) {
    alert("Шаблон не найден!");
    window.location.href = "exercises.html";
    return;
  }

  if (!currentTpl.exercises) currentTpl.exercises = [];

  const list = document.getElementById("exerciseList");
  const sumSets = document.getElementById("sumSets");
  const sumEx = document.getElementById("sumEx");
  const saveBtn = document.getElementById("saveTemplateBtn");
  const addBtn = document.getElementById("addExToTemplateBtn");

  // Заполняем заголовки
  document.getElementById("templateTitle").textContent = currentTpl.title;
  document.getElementById("templateDesc").textContent = currentTpl.desc;
  document.getElementById("breadcrumbTitle").textContent = currentTpl.title;

  function catColor(name) {
    const c = MOCK.categories.find((x) => x.name === name);
    return c ? c.color : "#f1f5f9";
  }

  function renderExercises() {
    list.innerHTML = "";
    
    if (currentTpl.exercises.length === 0) {
      list.innerHTML = `<div class="card" style="text-align:center; padding:40px; color:var(--muted);">В шаблоне пока нет упражнений. Добавьте первое!</div>`;
    }

    currentTpl.exercises.forEach((ex) => {
      const card = document.createElement("div");
      card.className = "ex-card";
      
      // Отрисовка подходов (убрали лишние пустые колонки)
      let setsHtml = "";
      ex.sets.forEach((s, i) => {
        setsHtml += `
          <div class="set-row" data-set="${i}">
            <span class="set-num">${i + 1}</span>
            <input class="set-input" type="number" value="${s.weight}" data-field="weight" />
            <input class="set-input" type="number" value="${s.reps}" data-field="reps" />
            <span></span>
            <button class="icon-btn del-set" data-ex="${ex.id}" data-set="${i}" title="Удалить подход" style="color:#ef4444; font-size:16px; background:none; border:none;">✕</button>
          </div>`;
      });

      card.innerHTML = `
        <div class="ex-head">
          <div class="ex-head-left">
            <span class="pill" style="background:${catColor(ex.category)}">${ex.category}</span>
            <span class="ex-title">${ex.name}</span>
          </div>
          <button class="icon-btn del-ex" data-id="${ex.id}" title="Удалить упражнение">🗑</button>
        </div>
        <div class="ex-cols">
          <span>Подх.</span><span>Вес (кг)</span><span>Повторы</span><span></span><span></span>
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
    let setsCount = 0;
    currentTpl.exercises.forEach(e => setsCount += e.sets.length);
    sumSets.textContent = setsCount;
    sumEx.textContent = currentTpl.exercises.length;
  }

  function bindEvents() {
    // Изменение веса/повторов
    list.querySelectorAll(".set-row").forEach(row => {
      row.querySelectorAll("input").forEach(input => {
        input.onchange = () => {
          const exId = row.closest(".ex-card").querySelector(".del-ex").dataset.id;
          const field = input.dataset.field;
          const setIdx = Number(row.dataset.set);
          const ex = currentTpl.exercises.find(x => x.id == exId);
          if (ex) ex.sets[setIdx][field] = Number(input.value);
        };
      });
    });

    // Удаление упражнения
    list.querySelectorAll(".del-ex").forEach(btn => {
      btn.onclick = () => {
        if(confirm("Удалить упражнение из шаблона?")) {
          currentTpl.exercises = currentTpl.exercises.filter(x => x.id != btn.dataset.id);
          renderExercises();
        }
      };
    });

    // Удаление подхода
    list.querySelectorAll(".del-set").forEach(btn => {
      btn.onclick = () => {
        const ex = currentTpl.exercises.find(x => x.id == btn.dataset.ex);
        if (ex) {
          ex.sets.splice(Number(btn.dataset.set), 1);
          // Если удалили все подходы, добавляем один пустой по умолчанию
          if (ex.sets.length === 0) ex.sets.push({ weight: 0, reps: 10 });
          renderExercises();
        }
      };
    });

    // Добавление подхода
    list.querySelectorAll(".add-set").forEach(btn => {
      btn.onclick = () => {
        const ex = currentTpl.exercises.find(x => x.id == btn.dataset.add);
        const last = ex.sets[ex.sets.length - 1];
        ex.sets.push({ weight: last ? last.weight : 0, reps: last ? last.reps : 0 });
        renderExercises();
      };
    });
  }

  // ДОБАВЛЕНИЕ УПРАЖНЕНИЯ ИЗ БАЗЫ
  if (addBtn) {
    addBtn.onclick = () => {
      let availableEx = JSON.parse(localStorage.getItem("fitExercises")) || MOCK.exercises;
      
      const optionsHtml = availableEx.map((e, i) => `
        <div class="ex-tile" style="cursor:pointer; padding:12px; margin-bottom:8px;" onclick="
          this.style.borderColor='var(--accent)';
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent('addExToTpl', { detail: ${i} }));
            document.querySelector('.modal-close').click();
          }, 150);
        ">
          <span class="pill" style="background:${catColor(e.cat)}; align-self:flex-start; margin-bottom:8px;">${e.cat}</span>
          <div style="font-weight:500; font-size:14px;">${e.name}</div>
        </div>
      `).join("");

      UI.openModal("Выберите упражнение", `<div style="max-height:400px; overflow-y:auto; padding-right:10px;">${optionsHtml}</div>`, null);
      
      // Обработчик выбора
      const handler = (ev) => {
        const idx = ev.detail;
        const selected = availableEx[idx];
        currentTpl.exercises.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          name: selected.name,
          category: selected.cat,
          sets: [{ weight: 0, reps: 10 }]
        });
        renderExercises();
        document.removeEventListener('addExToTpl', handler);
      };
      document.addEventListener('addExToTpl', handler);
    };
  }

  // СОХРАНЕНИЕ
  if (saveBtn) {
    saveBtn.onclick = () => {
      currentTpl.exCount = currentTpl.exercises.length;
      
      // Обновляем общий массив шаблонов
      const idx = templates.findIndex(t => t.id == currentTpl.id);
      if (idx !== -1) templates[idx] = currentTpl;
      
      localStorage.setItem("fitTemplates", JSON.stringify(templates));
      UI.toast("Шаблон сохранен!");
      setTimeout(() => window.location.href = "exercises.html", 1000);
    };
  }

  renderExercises();
})();