import activation from "models/activation.js";
import webserver from "infra/webserver.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.clearMailBox();
});

describe("Use case: Registration Flow (all successful)", () => {
  let createdUserResponseBody;

  test("🟢 Create user account", async () => {
    const createdUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usuarioFluxoRegistro",
          email: "usuarioFluxoRegistro@samba.com",
          password: "senha Mirabolante",
        }),
      },
    );

    expect(createdUserResponse.status).toBe(201);

    createdUserResponseBody = await createdUserResponse.json();

    expect(createdUserResponseBody).toEqual({
      id: createdUserResponseBody.id,
      username: "usuarioFluxoRegistro",
      email: "usuarioFluxoRegistro@samba.com",
      features: ["read:activation_token"],
      password: createdUserResponseBody.password,
      created_at: createdUserResponseBody.created_at,
      updated_at: createdUserResponseBody.updated_at,
    });
  });

  test("🟢 Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@tabnewsfromscratch.com.br>");
    expect(lastEmail.recipients[0]).toBe("<usuarioFluxoRegistro@samba.com>");
    expect(lastEmail.subject).toBe("Ative seu cadastro no TabnewsFromScratch!");
    expect(lastEmail.text).toContain("usuarioFluxoRegistro");

    const activationToken = await orchestrator.extractUUID(lastEmail.text);
    const activationTokenObject =
      await activation.findOneValidById(activationToken);

    expect(createdUserResponseBody.id).toBe(activationTokenObject.user_id);
    expect(activationTokenObject.used_at).toBe(null);
    expect(lastEmail.text).toContain(
      `${webserver.origin}/registration/activate/${activationToken}`,
    );
  });

  test("🟢 Activate account", async () => {});

  test("🟢 Login", async () => {});

  test("🟢 Get user information", async () => {});
});
