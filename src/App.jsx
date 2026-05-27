// src/App.jsx
import { createSignal, onMount, onCleanup } from "solid-js";

export default function App(props) {
  const [worker, setWorker] = createSignal(null);
  const [currentValue, setCurrentValue] = createSignal("—");

  onMount(() => {
    const w = new SharedWorker("/src/shared-worker.js");
    setWorker(w);

    w.port.onmessage = (event) => {
      const msg = event.data;

      switch (msg.type) {
        case "handle2Updated":
          setCurrentValue(msg.handle);
          break;

        case "handle2":
          setCurrentValue(msg.handle || "—");
          break;

        case "connected":
          // можно логировать, но не обязательно
          break;
      }
    };

    w.port.start();

    // запросить текущее значение при загрузке вкладки
    w.port.postMessage({ type: "getHandle2" });
  });

  onCleanup(() => worker()?.port.close());

  // --- API для вкладок ---
  const sendValue = (value) => {
    worker()?.port.postMessage({
      type: "setHandle2",
      handle: value,
    });
  };

  // --- Render tab component ---
  return (
    <>
      {props.tab({
        currentValue,
        sendValue,
      })}
    </>
  );
}
