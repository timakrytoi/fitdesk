window.MOCK = {
  clients: [
    { name: "Анна Ковалёва", weight: "62 кг", status: "Активен", statusColor: "green", last: "29 окт · Верх тела A" },
    { name: "Максим Орлов", weight: "84 кг", status: "На паузе", statusColor: "amber", last: "27 окт · Низ тела B" },
    { name: "Дарья Соколова", weight: "57 кг", status: "Активен", statusColor: "green", last: "29 окт · Full body" },
    { name: "Игорь Лебедев", weight: "91 кг", status: "Новый", statusColor: "blue", last: "—" },
    { name: "Ольга Морозова", weight: "68 кг", status: "Активен", statusColor: "green", last: "28 окт · Кардио" }
  ],
  calendar: [
    { day: 26, items: [] },
    { day: 27, items: [{ t: "Максим · Низ B", color: "#dcfce7" }] },
    { day: 28, items: [{ t: "Ольга · Кардио", color: "#fef3c7" }] },
    { day: 29, items: [{ t: "Анна · Верх A", color: "#dbeafe" }, { t: "Дарья · Full", color: "#fde2e4" }] },
    { day: 30, items: [{ t: "Игорь · Знакомство", color: "#ede9fe" }] },
    { day: 31, items: [] },
    { day: 1, items: [{ t: "Анна · Низ A", color: "#dbeafe" }] }
  ],
  logs: [
    { title: "Анна Ковалёва — Верх тела A", meta: "Сегодня · 12 подходов · 4800 кг" },
    { title: "Максим Орлов — Низ тела B", meta: "27 окт · 10 подходов · 6200 кг" },
    { title: "Дарья Соколова — Full body", meta: "26 окт · 14 подходов · 3900 кг" }
  ],
  categories: [
    { name: "Грудь", color: "#fde2e4" },
    { name: "Спина", color: "#dbeafe" },
    { name: "Ноги", color: "#dcfce7" },
    { name: "Руки", color: "#fef3c7" },
    { name: "Кор", color: "#ede9fe" }
  ],
  exercises: [
    { name: "Жим лёжа", cat: "Грудь" },
    { name: "Жим гантелей на наклонной", cat: "Грудь" },
    { name: "Тяга штанги в наклоне", cat: "Спина" },
    { name: "Подтягивания", cat: "Спина" },
    { name: "Приседания со штангой", cat: "Ноги" },
    { name: "Румынская тяга", cat: "Ноги" },
    { name: "Подъём на бицепс", cat: "Руки" },
    { name: "Разгибание на трицепс", cat: "Руки" },
    { name: "Планка", cat: "Кор" },
    { name: "Скручивания", cat: "Кор" }
  ],
  session: {
    title: "Верх тела A",
    clientName: "Анна Ковалёва",
    date: "29 октября 2026",
    exercises: [
      {
        id: "ex1", name: "Жим лёжа", category: "Грудь", restSeconds: 90,
        sets: [
          { id: "s1", num: 1, weight: 60, reps: 10, done: false },
          { id: "s2", num: 2, weight: 60, reps: 10, done: false },
          { id: "s3", num: 3, weight: 60, reps: 8,  done: false }
        ]
      },
      {
        id: "ex2", name: "Тяга штанги в наклоне", category: "Спина", restSeconds: 90,
        sets: [
          { id: "s4", num: 1, weight: 50, reps: 12, done: false },
          { id: "s5", num: 2, weight: 50, reps: 12, done: false },
          { id: "s6", num: 3, weight: 50, reps: 10, done: false }
        ]
      },
      {
        id: "ex3", name: "Подъём на бицепс", category: "Руки", restSeconds: 60, superset: "A",
        sets: [
          { id: "s7", num: 1, weight: 14, reps: 12, done: false },
          { id: "s8", num: 2, weight: 14, reps: 12, done: false }
        ]
      },
      {
        id: "ex4", name: "Разгибание на трицепс", category: "Руки", restSeconds: 60, superset: "A",
        sets: [
          { id: "s9", num: 1, weight: 20, reps: 12, done: false },
          { id: "s10", num: 2, weight: 20, reps: 12, done: false }
        ]
      }
    ]
  }
};