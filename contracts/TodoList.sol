// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TodoList {
    struct Task {
        uint256 id;
        string text;
        bool done;
        uint256 timestamp;
    }

    mapping(address => Task[]) private tasksOf;

    event TaskAdded(address indexed owner, uint256 id, string text, uint256 timestamp);
    event TaskToggled(address indexed owner, uint256 id, bool done);

    function addTask(string calldata text) external {
        uint256 id = tasksOf[msg.sender].length;
        tasksOf[msg.sender].push(Task({
            id: id,
            text: text,
            done: false,
            timestamp: block.timestamp
        }));
        emit TaskAdded(msg.sender, id, text, block.timestamp);
    }

    function toggleDone(uint256 id) external {
        require(id < tasksOf[msg.sender].length, "Invalid id");
        Task storage t = tasksOf[msg.sender][id];
        t.done = !t.done;
        emit TaskToggled(msg.sender, id, t.done);
    }

    function getMyTasks() external view returns (Task[] memory) {
        Task[] storage arr = tasksOf[msg.sender];
        Task[] memory copy = new Task[](arr.length);
        for (uint256 i = 0; i < arr.length; i++) {
            copy[i] = arr[i];
        }
        return copy;
    }
}
