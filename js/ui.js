// === ПРОВЕРКА ТЕМЫ ПРИ ЗАГРУЗКЕ ЛЮБОЙ СТРАНИЦЫ ===
(function applyTheme() {
  const settings = JSON.parse(localStorage.getItem("fitSettings")) || [false, true, false, true];
  if (settings[0]) {
    document.documentElement.classList.add("dark-theme");
  }
})();

window.UI = {
  // Показ уведомления
  toast(message) {
    if (!document.getElementById("toast-container")) {
      const cont = document.createElement("div");
      cont.id = "toast-container";
      document.body.appendChild(cont);
    }
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>✅</span> ${message}`;
    document.getElementById("toast-container").appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  // Открытие модального окна
  openModal(title, contentHTML, onSave) {
    this.closeModal();
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay is-open";
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-head">
          <h2>${title}</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">${contentHTML}</div>
        <div class="modal-footer">
          <button class="btn" id="modalCancel">Отмена</button>
          <button class="btn btn-primary" id="modalSave">Сохранить</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const close = () => this.closeModal();
    overlay.querySelector(".modal-close").onclick = close;
    overlay.querySelector("#modalCancel").onclick = close;
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

    overlay.querySelector("#modalSave").onclick = () => {
      if (onSave) onSave(overlay);
      this.closeModal();
    };
  },

  closeModal() {
    document.querySelectorAll(".modal-overlay").forEach(el => el.remove());
  }
};