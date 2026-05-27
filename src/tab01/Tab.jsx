import { createSignal, onMount, onCleanup } from "solid-js";
import "../App.css";

function App() {
  // сигналы для хранения состояния
  const [rootHandle, setRootHandle] = createSignal(null);
  const [rootName, setRootName] = createSignal("");
  const [projects, setProjects] = createSignal([]);
  const [selectedProject, setSelectedProject] = createSignal("");
  const [tasks, setTasks] = createSignal([]);
  const [selectedTask, setSelectedTask] = createSignal("");
  const [worker, setWorker] = createSignal(null);
  const [currentHandle2, setCurrentHandle2] = createSignal(null);
  const [workerStatus, setWorkerStatus] = createSignal("Инициализация...");

  // инициализация SharedWorker
  onMount(() => {
    try {
      console.log("инициализация SharedWorker");
      const sharedWorker = new SharedWorker("/src/shared-worker.js");
      setWorker(sharedWorker);
      // Обработчик входящих сообщений
      sharedWorker.port.onmessage = (event) => {
        const data = event.data;
        switch (data.type) {
          case "handle2Update":
            setCurrentHandle2(data.handle);
            console.log("SolidJS: Получено обновление handle2");
            break;
          case "connected":
            setWorkerStatus("Worker готов");
            break;
          case "ack":
            console.log("Подтверждение от Worker:", data.status);
            break;
        }
      };
      sharedWorker.port.onerror = (error) => {
        console.error("Не удалось создать SharedWorker", error);
        setWorkerStatus("Ошибка Worker");
      };
      sharedWorker.port.start();
    } catch (error) {
      console.error("Не удалось создать SharedWorker", error);
      setWorkerStatus("файл shared-worker не найден");
    }
  });

  // Отправка handle2 в воркер
  const sendHandleToWorker = (handle) => {
    worker()?.port.postMessage({
      type: "setHandle2",
      handle: handle,
    });
  };

  // Запрос текущего handle2 из воркера
  const requestHandleFromWorker = () => {
    worker()?.port.postMessage({ type: "getHandle2" });
  };

  onCleanup(() => {
    // Закрытие соединения при удалении компонента
    if (worker()) {
      worker().port.close();
    }
  });

  // получение полного пути
  const getFullPath = async (root, handle) => {
    const segments = await root.resolve(handle);
    if (!segments) return root.name; // если handle == root
    return root.name + "/" + segments.join("/");
  };

  // чтение поддиректорий
  const getSubdirs = async (dirHandle) => {
    const dirs = [];
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === "directory") dirs.push({ name, handle });
    }
    return dirs;
  };

  // выбор каталога с проектами
  const handlePickDirectory = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setRootHandle(handle);
      setRootName("... корневой каталог: " + handle.name);
      const subdirs = await getSubdirs(handle);
      setProjects(subdirs);
      setSelectedProject("");
      setTasks([]);
    } catch (error) {
      console.error("Ошибка выбора каталога", error);
    }
  };

  // выбор проекта
  const handleProjectChange = async (event) => {
    //const target = event.currentTarget;
    //const projectName = target.value;
    const projectName = event.currentTarget.value; // Извлекаем сразу
    setSelectedProject(projectName);
    setTasks([]);
    if (!projectName) return;
    try {
      const root = rootHandle();
      if (!root) return;
      const projectHandle = await root.getDirectoryHandle(projectName);
      const taskDirs = await getSubdirs(projectHandle);
      setTasks(taskDirs);
    } catch (error) {
      console.error(
        "Ошибка получения списка заданий в выбранном проекте",
        error,
      );
    }
  };

  // выбор задания
  const handleTaskClick = async (task) => {
    setSelectedTask(task.name);
    try {
      const root = rootHandle();
      if (!root) return;
      const path = await getFullPath(root, task.handle);
      console.log("Выбранное задание: ", path);
      // отправляем handle2 в Shared Worker
      worker().port.postMessage({
        type: "setHandle2",
        handle: task.handle,
      });
    } catch (error) {
      console.error("Ошибка обработки задания:", error);
    }
  };

  return (
    <>
      <div>
        <span>
          <button id="pickDir" onClick={handlePickDirectory}>
            Выбрать каталог с проектами
          </button>
        </span>
        <span id="rootName">{rootName()}</span>
        <p></p>
      </div>
      <div class="box">
        <h4>Список проектов</h4>
        <select
          id="list1"
          value={selectedProject()}
          onChange={handleProjectChange}
        >
          <option value="">Выбрать проект</option>
          {projects().map((project) => (
            <option value={project.name}>{project.name}</option>
          ))}
        </select>
      </div>
      <div>
        <h4>Список заданий выбранного проекта</h4>
        <h3>ОТСТУПЫ ! Текущий выбранный элемент:</h3>
        <div>{currentHandle2() || "—"}</div>
        <h4>Статус SharedWorker: {workerStatus()}</h4>{" "}
        <div id="list2" class="list2">
          {tasks().map((task) => (
            <div
              classList={{
                "list2-item": true,
                selected: selectedTask() === task.name,
              }}
              onClick={() => handleTaskClick(task)}
            >
              {task.name}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
