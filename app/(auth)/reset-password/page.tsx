"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input } from "@/src/components/ui";
import { Spinner } from "@/src/components/ui/spinner";
import { MailCheck } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // In a real app, you'd call your API here.
      // We'll just simulate a success response.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link.");
    }

    setLoading(false);
  };

  if (sent) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-accent/10 flex items-center justify-center mx-auto mb-4">
            <MailCheck className="w-8 h-8 text-brand-accent" />
          </div>
          <CardTitle className="mb-2">Check Your Email</CardTitle>
          <CardDescription className="mb-6">
            If an account with that email exists, we've sent password reset
            instructions.
          </CardDescription>
          <Link href="/login" className="text-sm text-brand-accent font-medium hover:underline">
            Back to Sign In
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your email and we'll send you reset instructions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Spinner className="mr-2 h-4 w-4" />}
            Send Reset Link
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-center w-full">
          <Link href="/login" className="text-brand-accent font-medium hover:underline">
            Back to Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
