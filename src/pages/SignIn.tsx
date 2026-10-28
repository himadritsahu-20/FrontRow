import { useState } from "react";
import { useApp } from "../lib/store";
import { GraduationCap, ArrowRight } from "lucide-react";

export default function SignIn() {
  const { signIn } = useApp();
  const [fullName, setFullName] = useState("");
  const [roll, setRoll] = useState("");
  const [branch, setBranch] = useState("");
  const [errors, setErrors] = useState<{ fullName?: string; roll?: string; branch?: string }>({});
  const [touched, setTouched] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!fullName.trim()) e.fullName = "Please enter your full name";
    if (!roll.trim()) e.roll = "Please enter your roll number";
    if (!branch.trim()) e.branch = "Please enter your branch";
    return e;
  };

  const submit = () => {
    const e = validate();
    setErrors(e);
    setTouched(true);
    if (Object.keys(e).length === 0) {
      signIn({ fullName: fullName.trim(), roll: roll.trim(), branch: branch.trim() });
    }
  };

  return (
    <div className="dotted flex min-h-screen items-center justify-center bg-[#f6f3ec] px-4 py-10">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-[#dde6f2] bg-white shadow-[0_20px_60px_rgba(21,33,66,0.14)]">
        <div className="grid md:grid-cols-2">
          {/* Left illustration panel */}
          <div className="relative hidden bg-[#152142] md:block">
            <img src="/images/signin.png" alt="" className="h-full w-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#152142] via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="tracking-label text-[10px] font-bold text-[#d9a62e]">FRONTROW</p>
              <p className="font-serif-display mt-1 text-2xl font-bold leading-tight text-[#f6f3ec]">
                Your semester,<br />in the front row.
              </p>
            </div>
          </div>

          {/* Right form panel */}
          <div className="p-7 sm:p-9">
            <div className="flex items-center gap-3 md:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d9a62e]">
                <GraduationCap size={22} className="text-[#152142]" />
              </span>
              <div>
                <p className="font-serif-display text-xl font-bold leading-none text-[#152142]">FrontRow</p>
                <p className="tracking-label text-[9px] font-semibold text-[#5d759c]">ACADEMIC PRIORITIES</p>
              </div>
            </div>

            <h1 className="font-serif-display mt-2 text-[26px] font-bold tracking-tight text-[#152142] md:mt-0">
              Welcome back, student.
            </h1>
            <p className="mt-1 text-[13.5px] leading-relaxed text-[#5d759c]">
              Sign in with your student details to see your tasks, deadlines and workload. This keeps your data in this browser — nothing is sent anywhere.
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => { e.preventDefault(); submit(); }}
              noValidate
            >
              <Field
                label="Full name"
                value={fullName}
                onChange={setFullName}
                placeholder="e.g. Alex Rivera"
                error={touched ? errors.fullName : undefined}
                autoFocus
              />
              <Field
                label="Roll number"
                value={roll}
                onChange={setRoll}
                placeholder="e.g. 2024-0001"
                error={touched ? errors.roll : undefined}
              />
              <Field
                label="Branch"
                value={branch}
                onChange={setBranch}
                placeholder="e.g. Computer Science"
                error={touched ? errors.branch : undefined}
                list="branches"
              />
              <datalist id="branches">
                {["Computer Science", "Physics", "Mathematics", "Economics", "Literature", "Chemistry", "Sociology"].map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>

              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#d9a62e] px-4 py-3.5 text-[15px] font-bold text-[#152142] shadow-[0_4px_16px_rgba(217,166,46,0.4)] transition hover:bg-[#e0b23c] active:translate-y-px"
              >
                Enter Dashboard
                <ArrowRight size={18} strokeWidth={2.6} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>

            <p className="mt-5 text-center text-[11.5px] leading-relaxed text-[#8494ad]">
              Local demo profile — not verified, no password.<br />Stored only in this browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, error, list, autoFocus }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string; list?: string; autoFocus?: boolean;
}) {
  const id = `field-${label.replace(/\s+/g, "-")}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12.5px] font-semibold text-[#152142]">
        {label} <span className="text-[#d9a62e]">*</span>
      </label>
      <input
        id={id}
        type="text"
        value={value}
        list={list}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={`w-full rounded-xl border bg-[#fbf9f4] px-3.5 py-3 text-[14.5px] text-[#152142] placeholder:text-[#aab8cc] focus:outline-none ${
          error ? "border-[#d97070] focus:border-[#c05252]" : "border-[#dde6f2] focus:border-[#d9a62e]"
        }`}
      />
      {error && <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-[#8f2d2d]">⚠ {error}</p>}
    </div>
  );
}
