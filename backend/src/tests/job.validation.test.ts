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

describe("Job API validation", () => {
  const uniqueId = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

  const testUser = {
    name: "Job Validation User",
    email: `job-validation-${uniqueId}@example.com`,
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
  });

  const createJob = (
    body: unknown,
    token = accessToken
  ) => {
    return request(app)
      .post("/api/jobs")
      .set(
        "Authorization",
        `Bearer ${token}`
      )
      .send(body);
  };

  it("rejects a request without authentication", async () => {
    const response = await request(app)
      .post("/api/jobs")
      .send({
        company: "Example Company",
        role: "Software Developer",
        description:
          "Build and maintain web applications.",
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("rejects an invalid authentication token", async () => {
    const response = await createJob(
      {
        company: "Example Company",
        role: "Software Developer",
        description:
          "Build and maintain web applications.",
      },
      "invalid-token"
    );

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("rejects an empty request body", async () => {
    const response = await createJob({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Validation failed"
    );
  });

  it("rejects a missing company", async () => {
    const response = await createJob({
      role: "Software Developer",
      description:
        "Build and maintain web applications.",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "company",
        }),
      ])
    );
  });

  it("rejects an empty company", async () => {
    const response = await createJob({
      company: "",
      role: "Software Developer",
      description:
        "Build and maintain web applications.",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "company",
        }),
      ])
    );
  });

  it("rejects a company that is too short", async () => {
    const response = await createJob({
      company: "A",
      role: "Software Developer",
      description:
        "Build and maintain web applications.",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("rejects a company that is too long", async () => {
    const response = await createJob({
      company: "A".repeat(101),
      role: "Software Developer",
      description:
        "Build and maintain web applications.",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("rejects a missing role", async () => {
    const response = await createJob({
      company: "Example Company",
      description:
        "Build and maintain web applications.",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "role",
        }),
      ])
    );
  });

  it("rejects an empty role", async () => {
    const response = await createJob({
      company: "Example Company",
      role: "",
      description:
        "Build and maintain web applications.",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("rejects a role that is too short", async () => {
    const response = await createJob({
      company: "Example Company",
      role: "A",
      description:
        "Build and maintain web applications.",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("rejects a role that is too long", async () => {
    const response = await createJob({
      company: "Example Company",
      role: "A".repeat(121),
      description:
        "Build and maintain web applications.",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("rejects a missing description", async () => {
    const response = await createJob({
      company: "Example Company",
      role: "Software Developer",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "description",
        }),
      ])
    );
  });

  it("rejects a description shorter than 10 characters", async () => {
    const response = await createJob({
      company: "Example Company",
      role: "Software Developer",
      description: "Too short",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("rejects a description longer than 20,000 characters", async () => {
    const response = await createJob({
      company: "Example Company",
      role: "Software Developer",
      description: "A".repeat(20_001),
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("rejects non-string field values", async () => {
    const response = await createJob({
      company: 123,
      role: true,
      description: [],
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "company",
        }),
        expect.objectContaining({
          field: "role",
        }),
        expect.objectContaining({
          field: "description",
        }),
      ])
    );
  });

  it("accepts a valid job request", async () => {
    const response = await createJob({
      company: "Example Company",
      role: "Software Developer",
      description:
        "Build and maintain scalable TypeScript web applications.",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    expect(response.body.data).toMatchObject({
      company: "Example Company",
      role: "Software Developer",
      description:
        "Build and maintain scalable TypeScript web applications.",
    });
  });
});