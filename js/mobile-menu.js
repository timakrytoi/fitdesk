(function() {
  // Ждем загрузки страницы
  document.addEventListener("DOMContentLoaded", () => {
    const topbar = document.querySelector(".topbar");
    const sidebar = document.querySelector(".sidebar");
    
    // Если на странице нет шапки или меню — выходим
    if (!topbar || !sidebar) return;

    // 1. Создаем кнопку-бургер
    const burgerBtn = document.createElement("button");
    burgerBtn.className = "mobile-menu-btn";
    burgerBtn.innerHTML = "<span></span><span></span><span></span>";
    
    // Вставляем её в начало шапки
    topbar.insertBefore(burgerBtn, topbar.firstChild);

    // 2. Создаем затемняющий фон (оверлей)
    const overlay = document.createElement("div");
    overlay.className = "mobile-overlay";
    document.body.appendChild(overlay);

    // 3. Логика открытия/закрытия
    function toggleMenu() {
      sidebar.classList.toggle("is-open");
      overlay.classList.toggle("is-open");
    }

    burgerBtn.onclick = toggleMenu;
    overlay.onclick = toggleMenu;

    // Закрываем меню при клике на любую ссылку внутри него
    sidebar.querySelectorAll(".nav-item").forEach(link => {
      link.addEventListener("click", () => {
        sidebar.classList.remove("is-open");
        overlay.classList.remove("is-open");
      });
    });
  });
})();