"use client";
/* This file renders the shared sign up and login email/password form. */
import { useState } from "react";

type AuthFormProps = {
  submitLabel: string;
  onSubmit: (email: string, password: string) => Promise<void>;
  onGoogleSignIn?: () => Promise<void>;
};

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 41.939 C -8.804 40.009 -11.514 38.989 -14.754 38.989 C -19.444 38.989 -23.494 41.689 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
      </g>
    </svg>
  );
}

export function AuthForm({ submitLabel, onSubmit, onGoogleSignIn }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await onSubmit(email, password);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Authentication failed.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    if (!onGoogleSignIn) return;
    setErrorMessage("");
    setIsGoogleSubmitting(true);
    try {
      await onGoogleSignIn();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Google authentication failed.";
      setErrorMessage(message);
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Email
          </label>
          <input
            className="w-full rounded-xl border border-transparent bg-zinc-50 px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Password
          </label>
          <input
            className="w-full rounded-xl border border-transparent bg-zinc-50 px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200"
            type="password"
            placeholder="••••••••"
            minLength={6}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {errorMessage && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
            {errorMessage}
          </div>
        )}

        <button
          disabled={isSubmitting || isGoogleSubmitting}
          type="submit"
          className="w-full rounded-full bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Please wait..." : submitLabel}
        </button>
      </form>

      {onGoogleSignIn && (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-zinc-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting || isGoogleSubmitting}
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-transparent bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoogleIcon className="h-5 w-5" />
            {isGoogleSubmitting ? "Connecting..." : "Google"}
          </button>
        </>
      )}
    </div>
  );
}
