import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.clearMailBox();
});

describe("Use case: Registration Flow (all successful)", () => {
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

    const createdUserResponseBody = await createdUserResponse.json();

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

  test("🟢 Receive activation email", async () => {});

  test("🟢 Activate account", async () => {});

  test("🟢 Login", async () => {});

  test("🟢 Get user information", async () => {});
});
