import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { HeartPulse, Smartphone } from "lucide-react";
import { Blobs, GlassCard } from "@/components/cb/glass";
import { useStore } from "@/lib/carebridge/store";
import { DEMO_PATIENT_PHONE } from "@/lib/carebridge/seed";

export const Route = createFileRoute("/patient/login")({
  head: () => ({
    meta: [
      { title: "Patient Login — CareBridge AI" },
      { name: "description", content: "Patients sign in with their mobile number and a one-time code." },
      { property: "og:title", content: "Patient Login — CareBridge AI" },
      { property: "og:description", content: "Track your care plan, medicines, appointments and care score." },
    ],
  }),
  component: PatientLogin,
});

function PatientLogin() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState(DEMO_PATIENT_PHONE);
  const [otp, setOtp] = useState("");
  const { patientLogin, patients } = useStore();
  const navigate = useNavigate();

  const demo = patients[0];

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
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === "phone"
            ? "Enter your mobile number to receive a one-time code."
            : "Enter the 6-digit code we sent to your phone."}
        </p>

        {step === "phone" ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (phone.replace(/\D/g, "").length < 10) {
                toast.error("Enter a valid 10-digit mobile number.");
                return;
              }
              setStep("otp");
              toast.success("OTP sent. Demo code: 123456");
            }}
          >
            <label className="block space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Mobile number</span>
              <div className="flex items-center gap-2 rounded-2xl bg-input px-4 py-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <input
                  data-testid="patient-phone-input"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>
            <button
              data-testid="patient-send-otp-btn"
              className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              Send code
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Demo: signs you in as {demo?.name ?? "a patient"}.
            </p>
          </form>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (otp !== "123456") {
                toast.error("Invalid code. Demo code is 123456.");
                return;
              }
              if (!demo) {
                toast.error("No patient record available.");
                return;
              }
              patientLogin(demo.id);
              toast.success(`Signed in as ${demo.name}`);
              void navigate({ to: "/patient/home" });
            }}
          >
            <label className="block space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">One-time code</span>
              <input
                data-testid="patient-otp-input"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full rounded-2xl bg-input px-4 py-3 text-center text-lg tracking-[0.5em] outline-none ring-ring focus:ring-2"
              />
            </label>
            <button
              data-testid="patient-verify-btn"
              className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              Verify &amp; continue
            </button>
            <button type="button" onClick={() => setStep("phone")} className="w-full text-xs text-muted-foreground">
              Change number
            </button>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
