(function() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  
  // Загружаем сохраненные настройки
  let saved = JSON.parse(localStorage.getItem("fitSettings"));
  if (!saved) {
    saved = [false, true, false, true]; 
  }

  function applySettings() {
    if (saved[0]) {
      document.documentElement.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
    }
  }

  checkboxes.forEach((chk, i) => {
    if (saved[i] !== undefined) chk.checked = saved[i];
    
    chk.addEventListener("change", () => {
      saved = Array.from(checkboxes).map(c => c.checked);
      localStorage.setItem("fitSettings", JSON.stringify(saved));
      applySettings();
      UI.toast("Настройки сохранены");
    });
  });

  applySettings();
})();