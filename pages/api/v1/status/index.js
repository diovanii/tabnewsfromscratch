import database from "infra/database.js";

async function status(request, response) {
  const result = await database.query("SELECT 1 + 1 as soma_de_1_mais_1;");

  console.log(result.rows);

  response.status(200).json({
    chave: "são açima da média <3",
  });
}

export default status;
