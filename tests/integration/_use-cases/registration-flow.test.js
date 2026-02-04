import user from "models/user.js";
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
  let activationToken;

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

    activationToken = await orchestrator.extractUUID(lastEmail.text);
    const activationTokenObject =
      await activation.findOneValidById(activationToken);

    expect(createdUserResponseBody.id).toBe(activationTokenObject.user_id);
    expect(activationTokenObject.used_at).toBe(null);
    expect(lastEmail.text).toContain(
      `${webserver.origin}/registration/activate/${activationToken}`,
    );
  });

  test("🟢 Activate account", async () => {
    const activationResponse = await fetch(
      `http://localhost:3000/api/v1/activations/${activationToken}`,
      {
        method: "PATCH",
      },
    );

    expect(activationResponse.status).toBe(200);

    const activationResponseBody = await activationResponse.json();

    expect(Date.parse(activationResponseBody.used_at)).not.toBeNaN();

    const activatedUser = await user.findOneByUsername("usuarioFluxoRegistro");
    expect(activatedUser.features).toEqual(["create:session"]);
  });

  test("🟢 Login", async () => {
    const createSessionResponse = await fetch(
      "http://localhost:3000/api/v1/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "usuarioFluxoRegistro@samba.com",
          password: "senha Mirabolante",
        }),
      },
    );

    expect(createSessionResponse.status).toBe(201);
    const createSessionResponseBody = await createSessionResponse.json();
    expect(createSessionResponseBody.user_id).toBe(createdUserResponseBody.id);
  });

  test("🟢 Get user information", async () => {});
});
