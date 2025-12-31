const { exec } = require("node:child_process");
function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(errorMessage, standardOutput) {
    if (standardOutput.search("accepting connections") === -1) {
      process.stdout.write(".");
      checkPostgres();
      return;
    }

    console.log("\n🟢 Postgres está pronto para aceitar conexões\n");
  }
}

process.stdout.write("\n\n🟡 Aguardando o Postgres aceitar conexões");
checkPostgres();
