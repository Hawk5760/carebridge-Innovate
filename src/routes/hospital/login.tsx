import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Blobs, GlassCard } from "@/components/cb/glass";
import { useStore } from "@/lib/carebridge/store";
import type { HospitalRole } from "@/lib/carebridge/types";
import { HeartPulse } from "lucide-react";

export const Route = createFileRoute("/hospital/login")({
  head: () => ({
    meta: [
      { title: "Hospital Login — CareBridge AI" },
      { name: "description", content: "Secure hospital staff login with role-based access and OTP verification." },
      { property: "og:title", content: "Hospital Login — CareBridge AI" },
      { property: "og:description", content: "Role-based hospital access to the CareBridge AI continuity dashboard." },
    ],
  }),
  component: HospitalLogin,
});

const roles: HospitalRole[] = ["Admin", "Doctor", "Care Coordinator", "Nurse"];

function HospitalLogin() {
  const [step, setStep] = useState<"creds" | "otp">("creds");
  const [email, setEmail] = useState("admin@apollocare.in");
  const [password, setPassword] = useState("carebridge");
  const [role, setRole] = useState<HospitalRole>("Admin");
  const [otp, setOtp] = useState("");
  const { hospitalLogin } = useStore();
  const navigate = useNavigate();

  return (
    <div className="relative grid min-h-screen place-items-center px-5">
      <Blobs />
      <GlassCard className="relative w-full max-w-md p-7">
        <Link to="/" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/25 text-primary">
            <HeartPulse className="h-5 w-5" />
          </span>
          CareBridge AI
        </Link>
        <h1 className="text-2xl font-semibold">Hospital sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === "creds" ? "Use your hospital email and password." : "Enter the 6-digit OTP sent to your device."}
        </p>

        {step === "creds" ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.includes("@") || password.length < 6) {
                toast.error("Enter a valid email and a password of 6+ characters.");
                return;
              }
              setStep("otp");
              toast.success("OTP sent. Demo code: 123456");
            }}
          >
            <Field label="Hospital email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl bg-input px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl bg-input px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
              />
            </Field>
            <Field label="Role">
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={
                      r === role
                        ? "rounded-2xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                        : "rounded-2xl bg-glass-strong px-3 py-2 text-xs font-medium text-foreground"
                    }
                  >
                    {r}
                  </button>
                ))}
              </div>
            </Field>
            <button className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground">
              Continue
            </button>
          </form>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (otp !== "123456") {
                toast.error("Invalid OTP. Demo code is 123456.");
                return;
              }
              hospitalLogin({ email, name: role === "Admin" ? "Dr. A. Menon" : role, role });
              toast.success(`Signed in as ${role}`);
              void navigate({ to: "/hospital/overview" });
            }}
          >
            <Field label="2FA / OTP">
              <input
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full rounded-2xl bg-input px-4 py-3 text-center text-lg tracking-[0.5em] outline-none ring-ring focus:ring-2"
              />
            </Field>
            <button className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground">
              Verify &amp; enter dashboard
            </button>
            <button
              type="button"
              onClick={() => setStep("creds")}
              className="w-full text-xs text-muted-foreground"
            >
              Back
            </button>
          </form>
        )}
      </GlassCard>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
