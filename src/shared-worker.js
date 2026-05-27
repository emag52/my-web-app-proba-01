/*
SharedWorker позволяет:
    хранить handle2 в одном месте
    делиться им между вкладками
    не сериализовать его (он передаётся как transferable object)
*/
let currentHandle2 = null;
const clients = new Set(); // Храним все подключённые порты

// Обработчик подключения новых клиентов
onconnect = (event) => {
    // Получаем порт для коммуникации с клиентом
    const port = event.ports[0];
    clients.add(port);
    port.onmessage = (e) => {
        const msg = e.data;
        console.log('SharedWorker получил:', msg)
        switch (msg.type) {
            case 'setHandle2':
                currentHandle2 = msg.handle;
                console.log('SharedWorker: handle2 обновлён');
                // Рассылаем обновление всем подключённым клиентам
                clients.forEach(client => {
                    client.postMessage({
                        type: 'handle2Updated',
                        handle: currentHandle2,
                        timestamp: Date.now()
                    });
                });
                port.postMessage({ type: "ack", status: "stored" });
                break;
            case 'getHandle2':
                port.postMessage({ type: "handle2", handle: currentHandle2 });
                break;
            case 'ping':
                port.postMessage({
                    type: 'pong',
                    response: 'Pong!',
                    timestamp: Date.now()
                })
            default:
                console.warn('Неизвестный тип сообщения:', msg.type);
        }
    };
    // Уведомление о подключении
    port.postMessage({ type: 'connected', status: 'ready' });
    port.start();
    // Очистка при закрытии порта
    port.addEventListener('close', () => {
        clients.delete(port);
    });
};
