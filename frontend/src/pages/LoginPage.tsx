import { useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { apiClient } from "../api/client";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),

  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
    };
    token: string;
  };
}

interface LocationState {
  message?: string;
}

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? "Invalid email or password.";
  }

  return "An unexpected error occurred.";
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | null;

  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    try {
      setApiError("");

      const response = await apiClient.post<LoginResponse>("/auth/login", {
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      localStorage.setItem("accessToken", response.data.data.token);

      localStorage.setItem("user", JSON.stringify(response.data.data.user));

      navigate("/dashboard", {
        replace: true,
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

          <h1>Welcome back</h1>

          <p>Log in to manage your resumes, jobs, and match results.</p>
        </div>

        {state?.message && (
          <p className="auth-success" role="status">
            {state.message}
          </p>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="form-field">
            <label htmlFor="login-email">Email</label>

            <input
              id="login-email"
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? "true" : "false"}
              {...register("email", {
                onChange: () => {
                  setApiError("");
                },
              })}
            />

            {errors.email && (
              <p className="field-error">{errors.email.message}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Password</label>

            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              aria-invalid={errors.password ? "true" : "false"}
              {...register("password", {
                onChange: () => {
                  setApiError("");
                },
              })}
            />

            {errors.password && (
              <p className="field-error">{errors.password.message}</p>
            )}
          </div>

          {apiError && (
            <p className="auth-error" role="alert">
              {apiError}
            </p>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="auth-footer">
          New to the application? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
};
