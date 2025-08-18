// SPDX-License-Identifier: MIT
// Esto indica la licencia del código. MIT es una licencia de software libre.

// Indica la versión de Solidity que se usará (en este caso, 0.8.24).
pragma solidity ^0.8.24;

// Definimos un contrato llamado "TodoList".
contract TodoList {

    // Una "struct" es como un molde para crear objetos.
    // Aquí definimos lo que es una "Tarea" (Task).
    struct Task {
        uint256 id;          // Número único para identificar la tarea.
        string text;         // El texto o descripción de la tarea.
        bool done;           // Indica si la tarea está terminada (true) o no (false).
        uint256 timestamp;   // Fecha y hora en que se creó la tarea.
    }

    // Usamos un "mapping", que es como un diccionario.
    // Cada dirección (wallet de usuario) tendrá su lista de tareas.
    mapping(address => Task[]) private tasksOf;

    // Los "eventos" permiten registrar cosas que pasan en la blockchain.
    event TaskAdded(address indexed owner, uint256 id, string text, uint256 timestamp);
    event TaskToggled(address indexed owner, uint256 id, bool done);

    // Función para AGREGAR una nueva tarea.
    function addTask(string calldata text) external {
        // El id será el número de la tarea en la lista del usuario.
        uint256 id = tasksOf[msg.sender].length;

        // Guardamos la tarea en la lista del usuario que llama a la función.
        tasksOf[msg.sender].push(Task({
            id: id,
            text: text,
            done: false,                // Al inicio siempre estará como "no terminada".
            timestamp: block.timestamp  // Hora actual de la blockchain.
        }));

        // Emitimos un evento para registrar que se agregó una tarea.
        emit TaskAdded(msg.sender, id, text, block.timestamp);
    }

    // Función para CAMBIAR el estado de una tarea (hecha/no hecha).
    function toggleDone(uint256 id) external {
        // Validamos que el id exista en la lista del usuario.
        require(id < tasksOf[msg.sender].length, "Invalid id");

        // Obtenemos la tarea de la lista.
        Task storage t = tasksOf[msg.sender][id];

        // Cambiamos el estado de la tarea al opuesto (true -> false, false -> true).
        t.done = !t.done;

        // Registramos el cambio en un evento.
        emit TaskToggled(msg.sender, id, t.done);
    }

    // Función para OBTENER todas mis tareas.
    function getMyTasks() external view returns (Task[] memory) {
        // Obtenemos la referencia a la lista de tareas del usuario.
        Task[] storage arr = tasksOf[msg.sender];

        // Creamos una copia en memoria (para poder devolverla).
        Task[] memory copy = new Task[](arr.length);

        // Copiamos cada tarea de "storage" (almacenamiento permanente)
        // a "memory" (memoria temporal para devolver al usuario).
        for (uint256 i = 0; i < arr.length; i++) {
            copy[i] = arr[i];
        }

        // Devolvemos la copia.
        return copy;
    }
}
