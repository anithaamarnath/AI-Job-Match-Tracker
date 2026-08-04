import path from "node:path";

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

describe("Resume-job match API integration", () => {
  const uniqueId = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

  const testUser = {
    name: "Match Test User",
    email: `match-test-${uniqueId}@example.com`,
    password: "TestPassword123",
  };

  const fixturePath = path.resolve(
    process.cwd(),
    "src/tests/fixtures/test-resume.pdf"
  );

  let userId = "";
  let accessToken = "";
  let resumeId = "";
  let jobId = "";
  let matchId = "";

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

  it("uploads a resume", async () => {
    const response = await request(app)
      .post("/api/resume/upload")
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      )
      .attach("resume", fixturePath);

    expect([200, 201]).toContain(
      response.status
    );

    expect(response.body.success).toBe(true);

    resumeId =
      response.body.data?.resume?.id ??
      response.body.data?.id;

    expect(resumeId).toBeTruthy();
  });

  it("creates a job", async () => {
    const response = await request(app)
      .post("/api/jobs")
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      )
      .send({
        company: "Match Test Company",
        role: "TypeScript Developer",
        description:
          "We need a developer with TypeScript, React, Node.js, Express, PostgreSQL, AWS, Docker, and REST API experience.",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    jobId = response.body.data.id;

    expect(jobId).toBeTruthy();
  });

 it("creates a resume-job match", async () => {
  const response = await request(app)
    .post("/api/matches")
    .set(
      "Authorization",
      `Bearer ${accessToken}`
    )
    .send({
      resumeId,
      jobId,
    });

  

  expect([200, 201]).toContain(
    response.status
  );

  expect(response.body.success).toBe(true);

  expect(response.body.data).toMatchObject({
    resumeId,
    jobId,
  });

  expect(
    response.body.data.matchScore
  ).toEqual(expect.any(Number));

  matchId = response.body.data.id;

  expect(matchId).toBeTruthy();
});

  it("retrieves match history", async () => {
    const response = await request(app)
      .get("/api/matches")
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(
      Array.isArray(response.body.data)
    ).toBe(true);

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: matchId,
          resumeId,
          jobId,
        }),
      ])
    );
  });

  it("retrieves one match by ID", async () => {
    const response = await request(app)
      .get(`/api/matches/${matchId}`)
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data).toMatchObject({
      id: matchId,
      resumeId,
      jobId,
    });
  });

  it("deletes the match", async () => {
    const response = await request(app)
      .delete(`/api/matches/${matchId}`)
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect([200, 204]).toContain(
      response.status
    );
  });

  it("returns 404 after the match is deleted", async () => {
    const response = await request(app)
      .get(`/api/matches/${matchId}`)
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});