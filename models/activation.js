import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";
import { UnauthorizedError } from "infra/errors";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userID, expiresAt) {
    const results = await database.query({
      text: "INSERT INTO user_activation_tokens (user_id, expires_at) VALUES ($1, $2) RETURNING *;",
      values: [userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "TabnewsFromScratch <contato@tabnewsfromscratch.com.br>",
    to: user.email,
    subject: "Ative seu cadastro no TabnewsFromScratch!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro!
    \n
${webserver.origin}/registration/activate/${activationToken.id}
    \n
Atenciosamente, Equipe TabnewsFromScratch`,
  });
}

async function findOneValidById(tokenId) {
  const tokenFound = await runSelectQuery(tokenId);

  return tokenFound;

  async function runSelectQuery(tokenId) {
    const results = await database.query({
      text: "SELECT * FROM user_activation_tokens WHERE id = $1 AND expires_at > NOW() AND used_at IS NULL LIMIT 1;",
      values: [tokenId],
    });

    if (results.rowCount === 0) {
      throw new UnauthorizedError({
        message:
          "O token de ativação utilizado não foi encontrado no sistema ou expirou",
        action: "Faça um novo cadastro",
      });
    }

    return results.rows[0];
  }
}

const activation = {
  create,
  sendEmailToUser,
  findOneValidById,
};

export default activation;
