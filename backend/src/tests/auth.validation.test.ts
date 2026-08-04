import request from "supertest";
import {
  afterAll,
  describe,
  expect,
  it,
} from "vitest";

import { app } from "../app.js";
import { prisma } from "../config/prisma.js";

describe("Authentication validation", () => {
  const uniqueId = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

  const validUser = {
    name: "Auth Validation User",
    email: `auth-validation-${uniqueId}@example.com`,
    password: "TestPassword123",
  };

  let userId = "";

  afterAll(async () => {
    if (userId) {
      await prisma.user.deleteMany({
        where: {
          id: userId,
        },
      });
    }
  });

  describe("POST /api/auth/register", () => {
    it("rejects an empty body", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Validation failed"
      );
    });

    it("rejects a missing name", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: validUser.email,
          password: validUser.password,
        });

      expect(response.status).toBe(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "name",
          }),
        ])
      );
    });

    it("rejects a short name", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "A",
          email: validUser.email,
          password: validUser.password,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("rejects an invalid email", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: validUser.name,
          email: "not-an-email",
          password: validUser.password,
        });

      expect(response.status).toBe(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "email",
          }),
        ])
      );
    });

    it("rejects a missing password", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: validUser.name,
          email: validUser.email,
        });

      expect(response.status).toBe(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "password",
          }),
        ])
      );
    });

    it("rejects a short password", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: validUser.name,
          email: validUser.email,
          password: "Short1",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("rejects non-string registration fields", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: 123,
          email: true,
          password: [],
        });

      expect(response.status).toBe(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "name",
          }),
          expect.objectContaining({
            field: "email",
          }),
          expect.objectContaining({
            field: "password",
          }),
        ])
      );
    });

    it("registers a valid user", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(validUser);

      expect([200, 201]).toContain(
        response.status
      );

      expect(response.body.success).toBe(true);

      expect(response.body.data.user).toMatchObject({
        name: validUser.name,
        email: validUser.email,
      });

      expect(
        response.body.data.user.passwordHash
      ).toBeUndefined();

      userId = response.body.data.user.id;
    });

    it("rejects a duplicate email", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(validUser);

      expect([400, 409]).toContain(
        response.status
      );

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    it("rejects an empty body", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("rejects an invalid email format", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "invalid-email",
          password: validUser.password,
        });

      expect(response.status).toBe(400);
    });

    it("rejects a missing password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: validUser.email,
        });

      expect(response.status).toBe(400);
    });

    it("rejects an incorrect password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: validUser.email,
          password: "WrongPassword123",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("logs in a valid user", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: validUser.email,
          password: validUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data.token).toEqual(
        expect.any(String)
      );

      expect(response.body.data.user).toMatchObject({
        id: userId,
        email: validUser.email,
      });
    });
  });
});