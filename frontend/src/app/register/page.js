"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();

  const { login } =
    useAuth();

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    setError("");
    setLoading(true);

    try {
      const response =
        await api.post(
          "/auth/register",
          form
        );

      if (response.data.token) {
        login(
          response.data.user,
          response.data.token
        );
      }

      router.push("/");
    } catch (error) {
      setError(
        error.response?.data
          ?.message ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-md p-7"
      >
        <h1 className="text-3xl font-black">
          Create Account
        </h1>

        <input
          required
          className="input mt-6"
          placeholder="Full name"
          value={form.name}
          onChange={(event) =>
            setForm({
              ...form,
              name:
                event.target.value
            })
          }
        />

        <input
          required
          type="email"
          className="input mt-4"
          placeholder="Email"
          value={form.email}
          onChange={(event) =>
            setForm({
              ...form,
              email:
                event.target.value
            })
          }
        />

        <input
          required
          minLength={6}
          type="password"
          className="input mt-4"
          placeholder="Password"
          value={form.password}
          onChange={(event) =>
            setForm({
              ...form,
              password:
                event.target.value
            })
          }
        />

        <input
          required
          minLength={6}
          type="password"
          className="input mt-4"
          placeholder="Confirm password"
          value={form.confirmPassword}
          onChange={(event) =>
            setForm({
              ...form,
              confirmPassword:
                event.target.value
            })
          }
        />

        {error && (
          <p className="mt-3 text-red-600">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="btn btn-primary mt-5 w-full"
        >
          {loading
            ? "Creating account..."
            : "Register"}
        </button>

        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-blue-600"
          >
            Login
          </Link>
        </p>
      </form>
    </section>
  );
}