(function() {
  let clients = JSON.parse(localStorage.getItem("fitClients"));
  if (!clients) {
    clients = MOCK.clients;
    localStorage.setItem("fitClients", JSON.stringify(clients));
  }

  const grid = document.getElementById("clientsGrid");
  const search = document.getElementById("clientPageSearch");
  const addBtn = document.querySelector(".topbar-right .btn-primary");

  function render(filter = "") {
    grid.innerHTML = "";
    clients
      .filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
      .forEach((c, index) => {
        const card = document.createElement("div");
        card.className = "ex-tile";
        card.style.padding = "20px";
        card.style.position = "relative";
        
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3 style="font-size: 16px;">${c.name}</h3>
            <span class="badge badge-${c.statusColor}">${c.status}</span>
          </div>
          <p class="muted" style="margin-top: 8px;">Вес: ${c.weight}</p>
          <p class="muted">Последняя: ${c.last}</p>
          
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button class="btn open-profile" data-idx="${index}" style="flex: 1;">Профиль</button>
            <button class="btn del-client" data-idx="${index}" style="color: #ef4444; border-color: #fca5a5; padding: 8px 12px;" title="Удалить клиента">🗑</button>
          </div>
        `;
        grid.appendChild(card);
      });

    // Редактирование профиля (БЕЗ ГРАФИКА)
    document.querySelectorAll(".open-profile").forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.idx);
        const c = clients[idx];
        
        const html = `
          <div class="form-group">
            <label>Имя клиента</label>
            <input class="input" id="editName" value="${c.name}" style="width:100%;" />
          </div>
          <div class="form-group">
            <label>Вес (кг)</label>
            <input class="input" id="editWeight" value="${c.weight}" style="width:100%;" />
          </div>
          <div class="form-group">
            <label>Статус</label>
            <select class="input" id="editStatus" style="width:100%;">
              <option value="Активен" ${c.status === 'Активен' ? 'selected' : ''}>Активен</option>
              <option value="На паузе" ${c.status === 'На паузе' ? 'selected' : ''}>На паузе</option>
              <option value="Новый" ${c.status === 'Новый' ? 'selected' : ''}>Новый</option>
            </select>
          </div>
        `;

        UI.openModal(`Профиль: ${c.name}`, html, (modal) => {
          c.name = modal.querySelector("#editName").value;
          c.weight = modal.querySelector("#editWeight").value;
          const newStatus = modal.querySelector("#editStatus").value;
          c.status = newStatus;
          c.statusColor = newStatus === "Активен" ? "green" : newStatus === "На паузе" ? "amber" : "blue";
          
          localStorage.setItem("fitClients", JSON.stringify(clients));
          render(search.value);
          UI.toast("Профиль обновлен!");
        });
      };
    });

    // Удаление
    document.querySelectorAll(".del-client").forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.idx);
        if (confirm(`Удалить клиента "${clients[idx].name}"?`)) {
          clients.splice(idx, 1);
          localStorage.setItem("fitClients", JSON.stringify(clients));
          render(search.value);
          UI.toast("Клиент удален");
        }
      };
    });
  }

  // Добавление нового клиента
  if (addBtn) {
    addBtn.onclick = () => {
      const html = `
        <div class="form-group"><label>Имя</label><input class="input" id="newName" placeholder="Иван Иванов" style="width:100%;" /></div>
        <div class="form-group"><label>Вес (кг)</label><input class="input" id="newWeight" type="number" placeholder="75" style="width:100%;" /></div>
      `;
      UI.openModal("Новый клиент", html, (modal) => {
        const name = modal.querySelector("#newName").value;
        const weight = modal.querySelector("#newWeight").value;
        if (name) {
          clients.push({ name, weight: weight + " кг", status: "Новый", statusColor: "blue", last: "—" });
          localStorage.setItem("fitClients", JSON.stringify(clients));
          render(search.value);
          UI.toast(`Клиент ${name} добавлен!`);
        }
      });
    };
  }

  search.addEventListener("input", e => render(e.target.value));
  render();
})();