import request from "supertest";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";

import { app } from "../app.js";
import { prisma } from "../config/prisma.js";

describe("Jobs authorization and user isolation", () => {
  const uniqueId = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

  const firstUser = {
    name: "First Test User",
    email: `first-user-${uniqueId}@example.com`,
    password: "TestPassword123",
  };

  const secondUser = {
    name: "Second Test User",
    email: `second-user-${uniqueId}@example.com`,
    password: "TestPassword123",
  };

  let firstUserId = "";
  let secondUserId = "";

  let firstUserToken = "";
  let secondUserToken = "";

  let firstUserJobId = "";

  const registerAndLogin = async (user: {
    name: string;
    email: string;
    password: string;
  }) => {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send(user);

    expect([200, 201]).toContain(
      registerResponse.status
    );

    const userId =
      registerResponse.body.data.user.id;

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: user.password,
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.data.token).toBeTruthy();

    return {
      userId,
      token: loginResponse.body.data.token as string,
    };
  };

  beforeAll(async () => {
    const firstUserAuth =
      await registerAndLogin(firstUser);

    firstUserId = firstUserAuth.userId;
    firstUserToken = firstUserAuth.token;

    const secondUserAuth =
      await registerAndLogin(secondUser);

    secondUserId = secondUserAuth.userId;
    secondUserToken = secondUserAuth.token;

    const createJobResponse = await request(app)
      .post("/api/jobs")
      .set(
        "Authorization",
        `Bearer ${firstUserToken}`
      )
      .send({
        company: "Private Test Company",
        role: "Backend Developer",
        description:
          "Build secure Node.js and PostgreSQL services.",
      });

    expect(createJobResponse.status).toBe(201);

    firstUserJobId =
      createJobResponse.body.data.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [
            firstUserId,
            secondUserId,
          ].filter(Boolean),
        },
      },
    });

    await prisma.$disconnect();
  });

  it("allows the owner to retrieve the job", async () => {
    const response = await request(app)
      .get(`/api/jobs/${firstUserJobId}`)
      .set(
        "Authorization",
        `Bearer ${firstUserToken}`
      );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(
      firstUserJobId
    );
  });

  it("prevents another user from retrieving the job", async () => {
    const response = await request(app)
      .get(`/api/jobs/${firstUserJobId}`)
      .set(
        "Authorization",
        `Bearer ${secondUserToken}`
      );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("prevents another user from updating the job", async () => {
    const response = await request(app)
      .patch(`/api/jobs/${firstUserJobId}`)
      .set(
        "Authorization",
        `Bearer ${secondUserToken}`
      )
      .send({
        company: "Unauthorized Update",
        role: "Unauthorized Role",
        description:
          "This update should never be saved.",
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("prevents another user from deleting the job", async () => {
    const response = await request(app)
      .delete(`/api/jobs/${firstUserJobId}`)
      .set(
        "Authorization",
        `Bearer ${secondUserToken}`
      );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("keeps the job unchanged after unauthorized attempts", async () => {
    const response = await request(app)
      .get(`/api/jobs/${firstUserJobId}`)
      .set(
        "Authorization",
        `Bearer ${firstUserToken}`
      );

    expect(response.status).toBe(200);

    expect(response.body.data).toMatchObject({
      id: firstUserJobId,
      company: "Private Test Company",
      role: "Backend Developer",
      description:
        "Build secure Node.js and PostgreSQL services.",
    });
  });

  it("allows the owner to delete the job", async () => {
    const response = await request(app)
      .delete(`/api/jobs/${firstUserJobId}`)
      .set(
        "Authorization",
        `Bearer ${firstUserToken}`
      );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});