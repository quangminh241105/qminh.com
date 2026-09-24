"use client";

import { useState } from "react";
import { MailIcon } from "@/components/icons";

const inputClassName =
  "border-2 border-black bg-white px-3.5 py-2.5 font-mono text-sm text-black outline-none focus:bg-blue-50 focus:border-blue-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-blue-400";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:phamlequangminh2411@gmail.com?subject=${subject}&body=${body}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#000000]"
    >
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 bg-green-500 border border-black" />
        <h3 className="font-mono text-lg font-black uppercase tracking-wider text-black dark:text-white">
          Send a Message
        </h3>
      </div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        This form opens your email app with the message pre-filled.
      </p>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-1">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Name
          </span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClassName}
            placeholder="Your name"
          />
        </label>

        <label className="grid gap-1">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Email
          </span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
            placeholder="you@example.com"
          />
        </label>

        <label className="grid gap-1">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Message
          </span>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className={inputClassName}
            placeholder="Tell me about your project or collaboration idea"
          />
        </label>
      </div>

      <button
        type="submit"
        className="mt-6 inline-flex items-center gap-2 border-2 border-black bg-[#ffe600] px-5 py-3 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer dark:shadow-[3px_3px_0px_#ffffff] dark:hover:shadow-[5px_5px_0px_#ffffff]"
      >
        <MailIcon className="h-4 w-4" />
        <span>Open Email Draft</span>
      </button>
    </form>
  );
}
