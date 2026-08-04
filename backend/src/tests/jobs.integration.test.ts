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

describe("Jobs API integration", () => {
  const uniqueId = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

  const testUser = {
    name: "Integration Test User",
    email: `integration-${uniqueId}@example.com`,
    password: "TestPassword123",
  };

  let accessToken = "";
  let userId = "";
  let jobId = "";

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect([200, 201]).toContain(
      registerResponse.status
    );

    userId = registerResponse.body.data.user.id;

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.data.token).toBeTruthy();

    accessToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.deleteMany({
        where: {
          id: userId,
        },
      });
    }

    await prisma.$disconnect();
  });

  it("creates a job", async () => {
    const response = await request(app)
      .post("/api/jobs")
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      )
      .send({
        company: "OpenAI Test Company",
        role: "Full Stack Developer",
        description:
          "Build and maintain a production React and Node.js application.",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    expect(response.body.data).toMatchObject({
      company: "OpenAI Test Company",
      role: "Full Stack Developer",
      description:
        "Build and maintain a production React and Node.js application.",
    });

    expect(response.body.data.id).toBeTruthy();

    jobId = response.body.data.id;
  });

  it("retrieves the authenticated user's jobs", async () => {
    const response = await request(app)
      .get("/api/jobs")
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(
      true
    );

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: jobId,
          company: "OpenAI Test Company",
          role: "Full Stack Developer",
        }),
      ])
    );
  });

  it("retrieves one job by ID", async () => {
    const response = await request(app)
      .get(`/api/jobs/${jobId}`)
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data).toMatchObject({
      id: jobId,
      company: "OpenAI Test Company",
      role: "Full Stack Developer",
    });
  });

  it("updates the job", async () => {
    const response = await request(app)
      .patch(`/api/jobs/${jobId}`)
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      )
      .send({
        company: "Updated Test Company",
        role: "Senior Full Stack Developer",
        description:
          "Build scalable React, TypeScript, Node.js, and PostgreSQL services.",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data).toMatchObject({
      id: jobId,
      company: "Updated Test Company",
      role: "Senior Full Stack Developer",
      description:
        "Build scalable React, TypeScript, Node.js, and PostgreSQL services.",
    });
  });

  it("deletes the job", async () => {
    const response = await request(app)
      .delete(`/api/jobs/${jobId}`)
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("returns 404 after the job is deleted", async () => {
    const response = await request(app)
      .get(`/api/jobs/${jobId}`)
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});