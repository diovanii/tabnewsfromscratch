import email from "infra/email.js";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.clearMailBox();

    await email.send({
      from: "Diovani <diovanidalmoro28@gmail.com>",
      to: "saracura@prato.com",
      subject: "Assunto sobre evoluçao animal",
      text: "Corpo do email sobre animais raros",
    });

    await email.send({
      from: "Sabugo <sabugado@gmail.com>",
      to: "ultimo@rato.com",
      subject: "Assunto sobre Sabugos",
      text: "Corpo do email Ultimo",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<sabugado@gmail.com>");
    expect(lastEmail.recipients[0]).toBe("<ultimo@rato.com>");
    expect(lastEmail.subject).toBe("Assunto sobre Sabugos");
    expect(lastEmail.text).toBe("Corpo do email Ultimo\n");
  });
});
