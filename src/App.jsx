// src/App.jsx
import { createSignal, onMount } from "solid-js";

export default function App(props) {
  const [worker, setWorker_] = createSignal(null);
  const [currentValue1, setCurrentValue_] = createSignal("—");

  // --- API для вкладок ---
  const sendValue1 = (value) => {
    worker()?.port.postMessage({
      type: "setHandle2",
      handle: value,
    });
  };

  // --- Render tab component ---
  return (
    <>
      {props.tab({
        currentValue1,
        sendValue1,
      })}
    </>
  );
}
