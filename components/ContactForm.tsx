"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Keep contact simple without backend by opening the visitor's email client.
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:hello@qminh.com?subject=${subject}&body=${body}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-xl font-semibold text-slate-800">Send a Message</h3>
      <p className="mt-2 text-sm text-slate-600">
        This form opens your email app with the message pre-filled.
      </p>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Name</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-600 focus:ring-2"
            placeholder="Your name"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-600 focus:ring-2"
            placeholder="you@example.com"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Message</span>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-600 focus:ring-2"
            placeholder="Tell me about your project or collaboration idea"
          />
        </label>
      </div>

      <button
        type="submit"
        className="mt-5 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
      >
        Open Email Draft
      </button>
    </form>
  );
}
