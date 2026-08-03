import { useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { apiClient } from "../api/client";

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters.")
      .max(100, "Name must be 100 characters or fewer."),

    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email address."),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .regex(/[A-Z]/, "Password must contain an uppercase letter.")
      .regex(/[a-z]/, "Password must contain a lowercase letter.")
      .regex(/\d/, "Password must contain a number."),

    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
    };
    token?: string;
  };
}

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const validationErrors = error.response?.data?.errors;

    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      return validationErrors
        .map((item: { message?: string }) => item.message)
        .filter(Boolean)
        .join(" ");
    }

    return (
      error.response?.data?.message ?? "Registration could not be completed."
    );
  }

  return "An unexpected error occurred.";
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setApiError("");

      const response = await apiClient.post<RegisterResponse>(
        "/auth/register",
        {
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
        },
      );

      const token = response.data.data.token;

      if (token) {
        localStorage.setItem("accessToken", token);

        localStorage.setItem("user", JSON.stringify(response.data.data.user));

        navigate("/dashboard", {
          replace: true,
        });

        return;
      }

      navigate("/login", {
        replace: true,
        state: {
          message: "Account created successfully. Please log in.",
        },
      });
    } catch (error) {
      setApiError(getErrorMessage(error));
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-intro">
          <p className="page-eyebrow">AI Job Match Tracker</p>

          <h1>Create your account</h1>

          <p>
            Save resumes, track jobs, and compare your skills with job
            descriptions.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="form-field">
            <label htmlFor="name">Full name</label>

            <input
              id="name"
              type="text"
              autoComplete="name"
              aria-invalid={errors.name ? "true" : "false"}
              {...register("name")}
            />

            {errors.name && (
              <p className="field-error">{errors.name.message}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="register-email">Email</label>

            <input
              id="register-email"
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? "true" : "false"}
              {...register("email")}
            />

            {errors.email && (
              <p className="field-error">{errors.email.message}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="register-password">Password</label>

            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={errors.password ? "true" : "false"}
              {...register("password")}
            />

            {errors.password && (
              <p className="field-error">{errors.password.message}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="confirm-password">Confirm password</label>

            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              {...register("confirmPassword")}
            />

            {errors.confirmPassword && (
              <p className="field-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          {apiError && (
            <p className="auth-error" role="alert">
              {apiError}
            </p>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
};
