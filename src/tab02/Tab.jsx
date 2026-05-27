// src/tab02/Tab.jsx
export default function Tab({ currentValue }) {
  return (
    <>
      <h2>Вкладка 02 — отображение выбранного задания</h2>

      <p>Текущий выбранный путь к заданию:</p>

      <div
        style={{
          "font-size": "20px",
          "margin-top": "8px",
          padding: "6px 10px",
          "background-color": "#f4f4f4",
          "border-radius": "4px",
          "font-family": "monospace",
          "word-break": "break-all",
        }}
      >
        {currentValue() || "— путь ещё не выбран"}
      </div>
    </>
  );
}
