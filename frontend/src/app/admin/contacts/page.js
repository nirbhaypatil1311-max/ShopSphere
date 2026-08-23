"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AdminContactsPage() {
  const { user } = useAuth();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      setLoading(true);

      const response = await api.get("/contact");

      setContacts(
        response.data?.contacts || []
      );
    } catch (error) {
      console.error(
        "GET CONTACTS ERROR:",
        error.response?.data ||
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchContacts();
    }
  }, [user]);

  const updateStatus = async (
    id,
    status
  ) => {
    try {
      await api.put(`/contact/${id}`, {
        status
      });

      setContacts((current) =>
        current.map((contact) =>
          contact.id === id
            ? {
                ...contact,
                status
              }
            : contact
        )
      );
    } catch (error) {
      console.error(
        "UPDATE CONTACT ERROR:",
        error.response?.data ||
          error.message
      );
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <section className="container-page py-20 text-center">
        <h1 className="text-3xl font-black">
          Access Denied
        </h1>

        <p className="mt-2 text-gray-500">
          Admin access is required.
        </p>
      </section>
    );
  }

  return (
    <section className="container-page py-12">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">
            Contact Messages
          </h1>

          <p className="mt-2 text-gray-500">
            Messages submitted by ShopSphere customers.
          </p>
        </div>

        <div className="rounded-xl bg-blue-100 px-4 py-2 font-bold text-blue-700">
          {contacts.length} Messages
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          Loading messages...
        </div>
      ) : contacts.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow">
          <h2 className="text-2xl font-bold">
            No messages yet
          </h2>

          <p className="mt-2 text-gray-500">
            Customer contact messages will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-5">

          {contacts.map((contact) => (
            <article
              key={contact.id}
              className="rounded-2xl bg-white p-6 shadow"
            >

              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                <div>
                  <h2 className="text-xl font-black">
                    {contact.subject ||
                      "No Subject"}
                  </h2>

                  <p className="mt-1 font-semibold">
                    {contact.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {contact.email}
                  </p>
                </div>

                <select
                  value={contact.status}
                  onChange={(event) =>
                    updateStatus(
                      contact.id,
                      event.target.value
                    )
                  }
                  className="rounded-lg border px-3 py-2"
                >
                  <option value="new">
                    New
                  </option>

                  <option value="read">
                    Read
                  </option>

                  <option value="resolved">
                    Resolved
                  </option>
                </select>

              </div>

              <div className="mt-5 rounded-xl bg-gray-50 p-5">
                <p className="whitespace-pre-wrap text-gray-700">
                  {contact.message}
                </p>
              </div>

              <p className="mt-4 text-xs text-gray-400">
                {contact.created_at
                  ? new Date(
                      contact.created_at
                    ).toLocaleString("en-IN")
                  : ""}
              </p>

            </article>
          ))}

        </div>
      )}
    </section>
  );
}