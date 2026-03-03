"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { loginWithEmail, loginWithGoogle } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left — brand panel */}
      <div className="relative flex h-48 shrink-0 flex-col justify-between overflow-hidden bg-zinc-900 px-6 py-6 text-white md:h-auto md:w-1/2 md:px-12 md:py-14">
        <img
          src="/darkmountain2.avif"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />

        <div className="relative z-10">
          <Link href="/" className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">
            CentonisCC
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-5xl">
            Welcome back.
          </h1>
          <p className="mt-2 hidden text-base leading-relaxed text-white/70 md:block">
            Pick up right where you left off. Your goals, projects, and notes are waiting.
          </p>
        </div>

        <div className="relative z-10 hidden md:block">
          <p className="text-xs text-white/40">
            Made for builders.
          </p>
        </div>
      </div>

      {/* Right — sign in form */}
      <div className="flex flex-1 items-center justify-center bg-white px-5 py-8 md:px-16 md:py-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Sign in
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
              Log in to your account
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Enter your details to continue.
            </p>
          </div>

          <AuthForm
            submitLabel="Log in"
            onSubmit={async (email, password) => {
              await loginWithEmail(email, password);
              router.replace("/dashboard");
            }}
            onGoogleSignIn={async () => {
              await loginWithGoogle();
              router.replace("/dashboard");
            }}
          />

          <p className="text-center text-sm text-zinc-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-zinc-900 transition-colors hover:text-zinc-700 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
