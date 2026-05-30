import { createSignal, onMount, onCleanup } from "solid-js";
import "../App.css";
import { createSharedWorker } from "../shared-worker-client";

export default function Tab() {
  const [currentValue, setCurrentValue] = createSignal("");
  const [logLines, setLogLines] = createSignal([]);
  let worker;
  let port;

  onMount(() => {
    const worker = createSharedWorker();
    port = worker.port;
    port.start();
    port.onmessage = (event) => {
      const msg = event.data;
      switch (msg.type) {
        case "connected":
          // Запрашиваем текущее значение
          port.postMessage({ type: "getHandle2" });
          break;
        case "handle2Updated":
          setCurrentValue(
            msg.handle ? `${msg.handle.kind}: ${msg.handle.name}` : "null",
          );
          break;
        case "handle2":
          setCurrentValue(
            msg.handle ? `${msg.handle.kind}: ${msg.handle.name}` : "null",
          );
          break;
        case "ack":
          addLog(`ack received: ${msg.status}`);
          break;
        case "pong":
          addLog("pong received");
          break;
        default:
          addLog(`unknown message type: ${msg.type}`);
      }
    };
  });

  onCleanup(() => {
    if (port) {
      port.close();
    }
  });

  return (
    <>
      <h2>Вкладка 02 — отображение выбранного задания</h2>
      <p>Текущий handle2:</p>
      <div
        style={{
          "font-size": "16px",
          "margin-top": "8px",
          padding: "6px 10px",
          "background-color": "#f4f4f4",
          "border-radius": "4px",
          "font-family": "monospace",
          "word-break": "break-all",
        }}
      >
        {currentValue() || "— данных ещё нет"}
      </div>
      <h3 style={{ "margin-top": "24px" }}>Debug log</h3>
      <div
        style={{
          padding: "10px",
          "background-color": "#111",
          color: "#0f0",
          "font-family": "monospace",
          "font-size": "13px",
          "border-radius": "4px",
          "max-height": "300px",
          overflow: "auto",
        }}
      >
        {logLines().map((line) => (
          <div>{line}</div>
        ))}
      </div>
    </>
  );
}
