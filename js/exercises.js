(function() {
  // ==========================================
  // 1. ЗАГРУЗКА ДАННЫХ (С фиксацией в памяти)
  // ==========================================
  let exercises = JSON.parse(localStorage.getItem("fitExercises"));
  if (!exercises) {
    exercises = MOCK.exercises;
    localStorage.setItem("fitExercises", JSON.stringify(exercises));
  }

  let categories = JSON.parse(localStorage.getItem("fitCategories"));
  if (!categories) {
    categories = MOCK.categories;
    localStorage.setItem("fitCategories", JSON.stringify(categories));
  }

  let templates = JSON.parse(localStorage.getItem("fitTemplates"));
  if (!templates) {
    templates = [
      { id: 1, title: "Верх тела A", desc: "Грудь, спина, руки", exCount: 0, exercises: [] },
      { id: 2, title: "Низ тела A", desc: "Квадрицепс, ягодицы", exCount: 0, exercises: [] }
    ];
    localStorage.setItem("fitTemplates", JSON.stringify(templates));
  }

  // Обновляем MOCK, чтобы другие страницы видели новые категории
  MOCK.categories = categories;

  // ==========================================
  // 2. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
  // ==========================================
  const tabs = document.querySelectorAll("#exTabs .tab");
  const tabContents = {
    my: document.getElementById("tab-my"),
    templates: document.getElementById("tab-templates"),
    categories: document.getElementById("tab-categories")
  };

  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove("is-active"));
      Object.values(tabContents).forEach(c => { if(c) c.style.display = "none"; });
      
      tab.classList.add("is-active");
      const target = tab.dataset.tab;
      if (tabContents[target]) tabContents[target].style.display = "block";

      // Перерисовываем нужный контент при переходе
      if (target === "templates") renderTemplates();
      if (target === "categories") renderCategoriesManage();
      if (target === "my") renderExercises();
    };
  });

  // ==========================================
  // 3. УПРАЖНЕНИЯ
  // ==========================================
  const list = document.getElementById("exList");
  const search = document.getElementById("exSearch");

  function catColor(name) {
    const c = categories.find((x) => x.name === name);
    return c ? c.color : "#f1f5f9";
  }

  function renderExercises() {
    if(!list) return;
    const filterText = search.value.toLowerCase();
    list.innerHTML = "";
    
    const filtered = exercises.filter(e => e.name.toLowerCase().includes(filterText));

    if (filtered.length === 0) {
      list.innerHTML = `<div class="muted" style="grid-column: 1 / -1;">Упражнений не найдено</div>`;
      return;
    }

    filtered.forEach((e) => {
      const realIndex = exercises.findIndex(x => x.name === e.name && x.cat === e.cat);
      const tile = document.createElement("div");
      tile.className = "ex-tile";
      tile.style.position = "relative";
      tile.innerHTML = `
        <span class="pill" style="background:${catColor(e.cat)};align-self:flex-start">${e.cat}</span>
        <h3>${e.name}</h3>
        <button class="btn del-ex" data-idx="${realIndex}" style="position:absolute; top:10px; right:10px; padding:4px 8px; font-size:12px; color:#ef4444; border-color:#fca5a5;">✕</button>
      `;
      list.appendChild(tile);
    });

    document.querySelectorAll(".del-ex").forEach(btn => {
      btn.onclick = () => {
        if (confirm("Удалить упражнение?")) {
          exercises.splice(btn.dataset.idx, 1);
          localStorage.setItem("fitExercises", JSON.stringify(exercises));
          renderExercises();
          UI.toast("Упражнение удалено");
        }
      };
    });
  }

  const addExBtn = document.getElementById("addExBtn");
  if (addExBtn) {
    addExBtn.onclick = () => {
      const catOptions = categories.map(c => `<option value="${c.name}">${c.name}</option>`).join("");
      UI.openModal("Новое упражнение", `
        <div class="form-group"><label>Название</label><input class="input" id="newExName" placeholder="Жим ногами" style="width:100%" /></div>
        <div class="form-group"><label>Категория</label><select class="input" id="newExCat" style="width:100%">${catOptions}</select></div>
      `, (modal) => {
        const name = modal.querySelector("#newExName").value;
        const cat = modal.querySelector("#newExCat").value;
        if (name) {
          exercises.push({ name, cat });
          localStorage.setItem("fitExercises", JSON.stringify(exercises));
          renderExercises();
          UI.toast("Упражнение добавлено!");
        }
      });
    };
  }

  if (search) search.addEventListener("input", renderExercises);

  // ==========================================
  // 4. ШАБЛОНЫ
  // ==========================================
  const templateList = document.getElementById("templateList");

  function renderTemplates() {
    if(!templateList) return;
    templateList.innerHTML = "";
    if (templates.length === 0) {
      templateList.innerHTML = `<div class="muted">У вас пока нет шаблонов.</div>`;
      return;
    }

    templates.forEach(t => {
      const item = document.createElement("div");
      item.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:16px; border:1px solid var(--border); border-radius:12px; background:var(--surface);";
      item.innerHTML = `
        <div>
          <h3 style="font-size: 15px;">${t.title}</h3>
          <p class="muted" style="margin-top: 4px;">${t.desc} · ${t.exCount || 0} упражнений</p>
        </div>
        <div style="display:flex; gap: 8px;">
          <button class="btn del-tpl" data-id="${t.id}" style="color:#ef4444; border-color:#fca5a5;">Удалить</button>
          <button class="btn edit-tpl" data-id="${t.id}">Редактировать</button>
          <button class="btn btn-primary use-tpl" data-id="${t.id}">Использовать</button>
        </div>
      `;
      templateList.appendChild(item);
    });

    // Удаление шаблона
    document.querySelectorAll(".del-tpl").forEach(btn => {
      btn.onclick = () => {
        if (confirm("Удалить шаблон?")) {
          templates = templates.filter(t => t.id != btn.dataset.id);
          localStorage.setItem("fitTemplates", JSON.stringify(templates));
          renderTemplates();
          UI.toast("Шаблон удален");
        }
      };
    });

    // Переход в редактор
    document.querySelectorAll(".edit-tpl").forEach(btn => {
      btn.onclick = () => {
        window.location.href = `template-editor.html?id=${btn.dataset.id}`;
      };
    });

    // Использование шаблона
    document.querySelectorAll(".use-tpl").forEach(btn => {
      btn.onclick = () => {
        const t = templates.find(x => x.id == btn.dataset.id);
        if (!t.exercises || t.exercises.length === 0) {
          UI.toast("В шаблоне нет упражнений! Добавьте их в редакторе.");
          return;
        }
        
        // Конвертируем шаблон в формат сессии для workout.html
        const sessionFormat = {
          title: t.title,
          clientName: "Выбранный клиент",
          date: new Date().toLocaleDateString('ru-RU'),
          exercises: t.exercises.map(ex => ({
            id: ex.id,
            name: ex.name,
            category: ex.category,
            restSeconds: 90,
            sets: ex.sets.map((s, i) => ({
              id: "s_" + Date.now() + i,
              num: i + 1,
              weight: s.weight,
              reps: s.reps,
              done: false
            }))
          }))
        };

        localStorage.setItem("workoutState", JSON.stringify(sessionFormat));
        localStorage.removeItem("workoutNote");
        UI.toast("Шаблон загружен в тренировку!");
        setTimeout(() => window.location.href = "workout.html", 800);
      };
    });
  }

  const addTemplateBtn = document.getElementById("addTemplateBtn");
  if (addTemplateBtn) {
    addTemplateBtn.onclick = () => {
      UI.openModal("Новый шаблон", `
        <div class="form-group"><label>Название</label><input class="input" id="tplTitle" placeholder="Спина и бицепс" style="width:100%" /></div>
        <div class="form-group"><label>Описание</label><input class="input" id="tplDesc" placeholder="Тяговые упражнения" style="width:100%" /></div>
      `, (modal) => {
        const title = modal.querySelector("#tplTitle").value;
        const desc = modal.querySelector("#tplDesc").value;
        if (title) {
          templates.push({ id: Date.now(), title, desc, exCount: 0, exercises: [] });
          localStorage.setItem("fitTemplates", JSON.stringify(templates));
          renderTemplates();
          UI.toast("Шаблон создан!");
        }
      });
    };
  }

  // ==========================================
  // 5. КАТЕГОРИИ
  // ==========================================
  const catListManage = document.getElementById("catList");

  function renderCategoriesManage() {
    if(!catListManage) return;
    catListManage.innerHTML = "";
    
    categories.forEach((c, idx) => {
      const item = document.createElement("div");
      item.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border:1px solid var(--border); border-radius:12px; background:var(--surface);";
      item.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:24px; height:24px; border-radius:6px; background:${c.color};"></div>
          <strong>${c.name}</strong>
        </div>
        <div style="display:flex; gap: 8px;">
          <button class="btn edit-cat" data-idx="${idx}">Изменить цвет</button>
          <button class="btn del-cat" data-idx="${idx}" style="color:#ef4444; border-color:#fca5a5;">✕</button>
        </div>
      `;
      catListManage.appendChild(item);
    });

    // Изменение цвета
    document.querySelectorAll(".edit-cat").forEach(btn => {
      btn.onclick = () => {
        const idx = btn.dataset.idx;
        const c = categories[idx];
        const colors = ["#fde2e4", "#dbeafe", "#dcfce7", "#fef3c7", "#ede9fe", "#ffedd5", "#f1f5f9"];
        const colorBtns = colors.map(col => 
          `<button class="color-swatch" data-color="${col}" style="width:32px; height:32px; border-radius:8px; border:1px solid var(--border); background:${col}; cursor:pointer;"></button>`
        ).join("");

        UI.openModal("Цвет категории", `
          <p style="font-size:14px; margin-bottom:12px; color:var(--text);">Выберите цвет для <strong>${c.name}</strong>:</p>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">${colorBtns}</div>
        `, null);

        setTimeout(() => {
          document.querySelectorAll(".color-swatch").forEach(sw => {
            sw.onclick = () => {
              c.color = sw.dataset.color;
              localStorage.setItem("fitCategories", JSON.stringify(categories));
              MOCK.categories = categories;
              UI.closeModal();
              renderCategoriesManage();
              renderExercises(); // Обновляем цвета в упражнениях
              UI.toast("Цвет обновлен!");
            };
          });
        }, 50);
      };
    });

    // Удаление
    document.querySelectorAll(".del-cat").forEach(btn => {
      btn.onclick = () => {
        if (confirm("Удалить категорию? Упражнения в ней останутся, но потеряют цвет.")) {
          categories.splice(btn.dataset.idx, 1);
          localStorage.setItem("fitCategories", JSON.stringify(categories));
          MOCK.categories = categories;
          renderCategoriesManage();
          renderExercises();
          UI.toast("Категория удалена");
        }
      };
    });
  }

  const addCategoryBtn = document.getElementById("addCategoryBtn");
  if (addCategoryBtn) {
    addCategoryBtn.onclick = () => {
      const colors = ["#fde2e4", "#dbeafe", "#dcfce7", "#fef3c7", "#ede9fe", "#ffedd5", "#f1f5f9"];
      const colorBtns = colors.map(col => 
        `<button class="color-swatch" data-color="${col}" style="width:32px; height:32px; border-radius:8px; border:1px solid var(--border); background:${col}; cursor:pointer;"></button>`
      ).join("");

      UI.openModal("Новая категория", `
        <div class="form-group"><label>Название</label><input class="input" id="catName" placeholder="Плечи" style="width:100%" /></div>
        <div class="form-group">
          <label>Цвет</label>
          <div style="display:flex; gap:8px; flex-wrap:wrap;" id="colorPicker">${colorBtns}</div>
          <input type="hidden" id="selectedColor" value="#f1f5f9" />
        </div>
      `, (modal) => {
        const name = modal.querySelector("#catName").value;
        const color = modal.querySelector("#selectedColor").value;
        if (name) {
          categories.push({ name, color });
          localStorage.setItem("fitCategories", JSON.stringify(categories));
          MOCK.categories = categories;
          renderCategoriesManage();
          renderExercises();
          UI.toast("Категория добавлена!");
        }
      });

      // Выделение выбранного цвета
      setTimeout(() => {
        document.querySelectorAll("#colorPicker .color-swatch").forEach(sw => {
          sw.onclick = () => {
            document.querySelectorAll("#colorPicker .color-swatch").forEach(s => s.style.border = "1px solid var(--border)");
            sw.style.border = "2px solid var(--text)";
            document.getElementById("selectedColor").value = sw.dataset.color;
          };
        });
      }, 50);
    };
  }

  // ==========================================
  // 6. ИНИЦИАЛИЗАЦИЯ
  // ==========================================
  renderExercises();
  renderTemplates();
  renderCategoriesManage();
})();