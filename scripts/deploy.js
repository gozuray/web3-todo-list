// scripts/deploy.js
// Este script despliega el contrato y ESCRIBE la dirección en config.js automáticamente.

const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  // 1) Compilar (opcional, Hardhat lo hace solo si hace falta)
  // await hre.run("compile");

  // 2) Obtener la “fábrica” del contrato y desplegar
  const TodoList = await hre.ethers.getContractFactory("TodoList");
  const todo = await TodoList.deploy();
  await todo.waitForDeployment();

  // 3) Dirección del contrato recién desplegado
  const address = await todo.getAddress(); // en ethers v6; en v5 sería todo.address
  console.log("✅ TodoList desplegado en:", address);

  // 4) Escribir/actualizar config.js en la raíz del proyecto
  const configPath = path.join(__dirname, "..", "config.js");
  const fileContent =
    `// config.js\n` +
    `// ⚠️ Archivo generado automáticamente por scripts/deploy.js\n` +
    `// Cada vez que hagas un deploy, esta dirección se actualiza.\n` +
    `window.contractAddress = "${address}";\n`;

  fs.writeFileSync(configPath, fileContent, { encoding: "utf-8" });
  console.log("✍️  config.js actualizado en:", configPath);

  // (Opcional) Si quisieras guardar el ABI para usarlo desde un archivo:
  // const artifact = await hre.artifacts.readArtifact("TodoList");
  // fs.writeFileSync(path.join(__dirname, "..", "abi.json"),
  //   JSON.stringify(artifact.abi, null, 2)
  // );
  // Luego en index.html podrías cargar <script src="abi.json"> y usarlo.
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
