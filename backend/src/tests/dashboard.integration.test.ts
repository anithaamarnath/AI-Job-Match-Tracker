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

describe("Dashboard API integration", () => {
  const uniqueId = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

  const testUser = {
    name: "Dashboard Test User",
    email: `dashboard-${uniqueId}@example.com`,
    password: "TestPassword123",
  };

  let userId = "";
  let accessToken = "";

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

    accessToken =
      loginResponse.body.data.token;
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.deleteMany({
        where: {
          id: userId,
        },
      });
    }
  });

  it("rejects unauthenticated dashboard access", async () => {
    const response = await request(app)
      .get("/api/dashboard");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("returns an empty dashboard for a new user", async () => {
    const response = await request(app)
      .get("/api/dashboard")
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data).toMatchObject({
      totalResumes: 0,
      totalJobs: 0,
      totalMatches: 0,
      latestResume: null,
      bestMatch: null,
    });
  });

  it("updates dashboard totals after creating a job", async () => {
    const createJobResponse = await request(app)
      .post("/api/jobs")
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      )
      .send({
        company: "Dashboard Test Company",
        role: "Software Developer",
        description:
          "Build TypeScript, React, Node.js, and PostgreSQL applications.",
      });

    expect(createJobResponse.status).toBe(201);

    const dashboardResponse = await request(app)
      .get("/api/dashboard")
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(dashboardResponse.status).toBe(200);

    expect(
      dashboardResponse.body.data.totalJobs
    ).toBe(1);

    expect(
      dashboardResponse.body.data.totalResumes
    ).toBe(0);

    expect(
      dashboardResponse.body.data.totalMatches
    ).toBe(0);
  });
});