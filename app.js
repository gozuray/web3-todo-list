// app.js
const contractAddress = window.contractAddress;

const abi = [
  "function addTask(string text) external",
  "function toggleDone(uint256 id) external",
  "function getMyTasks() external view returns (tuple(uint256 id,string text,bool done,uint256 timestamp)[])",
  "event TaskAdded(address indexed owner, uint256 id, string text, uint256 timestamp)",
  "event TaskToggled(address indexed owner, uint256 id, bool done)",
];

let provider, signer, contract;

async function init() {
  if (!window.ethereum) throw new Error("MetaMask no detectado");
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  contract = new ethers.Contract(contractAddress, abi, signer);

  contract.removeAllListeners?.("TaskAdded");
  contract.removeAllListeners?.("TaskToggled");

  contract.on("TaskAdded", async (owner) => {
    const my = await signer.getAddress();
    if (owner.toLowerCase() === my.toLowerCase()) renderTasks();
  });
  contract.on("TaskToggled", async (owner) => {
    const my = await signer.getAddress();
    if (owner.toLowerCase() === my.toLowerCase()) renderTasks();
  });

  await renderTasks();
}
// Llevamos un registro de tareas ya renderizadas
const renderedTaskIds = new Set();
const CLEAR_KEY = "clearTimestamp";
let clearTimestamp = Number(localStorage.getItem(CLEAR_KEY) || 0);
async function renderTasks() {
  const list = document.getElementById("tasks");
  const count = document.getElementById("counter");
  if (!list) return;

  const tasks = await contract.getMyTasks();

  let visibles = tasks.filter(
    (t) => Number(t.timestamp) * 1000 > clearTimestamp
  );

  visibles.forEach((t) => {
    const key = `task-${t.id}`;
    if (renderedTaskIds.has(key)) return;

    const li = document.createElement("li");
    li.className = "task-enter";

    const left = document.createElement("div");
    left.className = "flex items-center gap-2";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = t.done;
    cb.addEventListener("change", async () => {
      try {
        cb.disabled = true;
        const tx = await contract.toggleDone(t.id);
        await tx.wait();
      } finally {
        cb.disabled = false;
      }
    });

    const txt = document.createElement("span");
    txt.textContent = t.text;
    txt.className = "task-text" + (t.done ? " done" : "");

    left.append(cb, txt);

    const time = document.createElement("span");
    time.className = "time";
    time.textContent = new Date(Number(t.timestamp) * 1000).toLocaleString();

    li.append(left, time);
    list.appendChild(li);

    renderedTaskIds.add(key);
  });

  count.textContent = `📝 ${visibles.length} ${
    visibles.length === 1 ? "tarea" : "tareas"
  }`;
}



document.getElementById("connect")?.addEventListener("click", init);

document.getElementById("add")?.addEventListener("click", async () => {
  const input = document.getElementById("todo");
  const text = input?.value.trim();
  if (!text) return;
  try {
    document.getElementById("add").disabled = true;
    const tx = await contract.addTask(text);
    await tx.wait();
    input.value = "";
    await renderTasks();
  } finally {
    document.getElementById("add").disabled = false;
  }
});

document.getElementById("clear")?.addEventListener("click", () => {
  clearTimestamp = Date.now();
  localStorage.setItem(CLEAR_KEY, clearTimestamp);

  const list = document.getElementById("tasks");
  if (list) list.innerHTML = "";

  renderedTaskIds.clear();
  document.getElementById("counter").textContent = "📝 0 tareas";
});

window.addEventListener("load", async () => {
  // Auto-conectar si ya diste permisos
  try {
    if (!window.ethereum) return;
    const tmp = new ethers.providers.Web3Provider(window.ethereum);
    const accs = await tmp.listAccounts();
    if (accs.length) await init();
  } catch {}
});

if (window.ethereum) {
  window.ethereum.on?.("accountsChanged", init);
  window.ethereum.on?.("chainChanged", () => window.location.reload());
}
