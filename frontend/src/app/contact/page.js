"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function ContactPage() {
  const [form, setForm] =
    useState({
      name: "",
      email: "",
      subject: "",
      message: ""
    });

  const [sent, setSent] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      await api.post(
        "/contact",
        form
      );

      setSent(true);
      setError("");

      setForm({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch {
      setError(
        "Unable to send message."
      );
    }
  };

  return (
    <section className="container-page py-12">
      <h1 className="text-4xl font-black">
        Contact Us
      </h1>

      <form
        onSubmit={handleSubmit}
        className="card mt-8 max-w-2xl space-y-4 p-6"
      >
        <input
          required
          className="input"
          placeholder="Name"
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
          className="input"
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
          className="input"
          placeholder="Subject"
          value={form.subject}
          onChange={(event) =>
            setForm({
              ...form,
              subject:
                event.target.value
            })
          }
        />

        <textarea
          required
          className="input min-h-36"
          placeholder="Message"
          value={form.message}
          onChange={(event) =>
            setForm({
              ...form,
              message:
                event.target.value
            })
          }
        />

        {sent && (
          <p className="text-green-600">
            Message sent successfully.
          </p>
        )}

        {error && (
          <p className="text-red-600">
            {error}
          </p>
        )}

        <button className="btn btn-primary">
          Send Message
        </button>
      </form>
    </section>
  );
}