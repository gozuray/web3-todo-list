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

async function renderTasks() {
  const list = document.getElementById("tasks");
  const count = document.getElementById("counter");
  if (!list) return;

  list.innerHTML = "";
  const tasks = await contract.getMyTasks();
  tasks.forEach((t) => {
    const li = document.createElement("li");
    li.className =
      "flex items-center justify-between p-2 border-b border-gray-200";

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
    if (t.done) txt.className = "line-through text-gray-500";

    left.append(cb, txt);

    const time = document.createElement("span");
    time.className = "text-xs text-gray-500";
    time.textContent = new Date(Number(t.timestamp) * 1000).toLocaleString();

    li.append(left, time);
    list.appendChild(li);
  });

  count.textContent = `📝 ${tasks.length} ${tasks.length === 1 ? "tarea" : "tareas"}`;
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
