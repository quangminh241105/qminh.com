"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAdminAction } from "@/app/admin/actions";
import { LockIcon, TerminalIcon, ArrowLeftIcon } from "@/components/icons";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdminAction, null);

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-geo-dots">
      <div className="w-full max-w-md border-2 border-black bg-white p-8 shadow-[6px_6px_0px_#000000] dark:border-[#ffe600] dark:bg-zinc-900 dark:shadow-[6px_6px_0px_#000000]">
        <div className="flex items-center justify-between border-b-2 border-black pb-4 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center border-2 border-black bg-[#ffe600] text-black shadow-[2px_2px_0px_#000000]">
              <LockIcon className="h-4 w-4" />
            </span>
            <h1 className="font-mono text-lg font-black uppercase tracking-wider text-black dark:text-white">
              Admin Access
            </h1>
          </div>
          <span className="border border-black bg-[#ffe600] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-black">
            Secure
          </span>
        </div>

        <p className="mt-4 text-xs font-mono text-zinc-600 dark:text-zinc-400">
          Enter your <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 border border-zinc-400 font-bold">ADMIN_API_KEY</code> to manage portfolio projects, blog posts, resume timeline, and profile.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-zinc-300">
              Admin Secret / Key
            </label>
            <div className="mt-1 relative">
              <input
                name="password"
                type="password"
                required
                autoFocus
                placeholder="Enter password or admin key"
                className="w-full border-2 border-black bg-white px-3.5 py-2.5 font-mono text-sm text-black outline-none focus:bg-[#fffde6] focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-[#ffe600]"
              />
            </div>
          </div>

          {state?.error ? (
            <div className="border-2 border-red-600 bg-red-50 p-2.5 font-mono text-xs font-bold text-red-700 dark:bg-red-950/50 dark:text-red-300 dark:border-red-500">
              {state.error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="w-full border-2 border-black bg-[#ffe600] py-3 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 dark:shadow-[3px_3px_0px_#000000] dark:hover:shadow-[5px_5px_0px_#000000]"
          >
            <TerminalIcon className="h-4 w-4" />
            <span>{isPending ? "Verifying..." : "Authenticate"}</span>
          </button>
        </form>

        <div className="mt-6 border-t-2 border-black pt-4 dark:border-zinc-700 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-[#ffe600]"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Back to Public Portfolio</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
