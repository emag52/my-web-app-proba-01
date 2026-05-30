export function createSharedWorker() {

  return new SharedWorker(
    new URL("/src/shared-worker.js", import.meta.url),
    {
      type: "module",
      name: "global-worker",
    }
  );
}