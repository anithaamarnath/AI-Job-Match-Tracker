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

describe("Resume API integration", () => {
  const uniqueId = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

  const testUser = {
    name: "Resume Test User",
    email: `resume-test-${uniqueId}@example.com`,
    password: "TestPassword123",
  };

  const fixturePath = path.resolve(
    process.cwd(),
    "src/tests/fixtures/test-resume.pdf"
  );

  let userId = "";
  let accessToken = "";
  let resumeId = "";

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect([200, 201]).toContain(
      registerResponse.status
    );

    userId =
      registerResponse.body.data.user.id;

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(loginResponse.status).toBe(200);
    expect(
      loginResponse.body.data.token
    ).toBeTruthy();

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

    await prisma.$disconnect();
  });

  it("uploads a resume PDF", async () => {
    const response = await request(app)
      .post("/api/resume/upload")
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      )
      .attach("resume", fixturePath);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    expect(response.body.data).toMatchObject({
      originalName: "test-resume.pdf",
    });

    expect(response.body.data.id).toBeTruthy();
    expect(
      response.body.data.extractedText
    ).toBeTruthy();

    resumeId = response.body.data.id;
  });

  it("lists the authenticated user's resumes", async () => {
    const response = await request(app)
      .get("/api/resume")
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
          id: resumeId,
          originalName: "test-resume.pdf",
        }),
      ])
    );
  });

  it("retrieves one resume by ID", async () => {
    const response = await request(app)
      .get(`/api/resume/${resumeId}`)
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data).toMatchObject({
      id: resumeId,
      originalName: "test-resume.pdf",
    });
  });

  it("rejects resume access without authentication", async () => {
    const response = await request(app)
      .get(`/api/resume/${resumeId}`);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("deletes the uploaded resume", async () => {
    const response = await request(app)
      .delete(`/api/resume/${resumeId}`)
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("returns 404 after the resume is deleted", async () => {
    const response = await request(app)
      .get(`/api/resume/${resumeId}`)
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});