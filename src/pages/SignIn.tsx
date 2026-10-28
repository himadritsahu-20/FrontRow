import { useState } from 'react';
import { ArrowRight, CalendarDays, GaugeCircle, ListChecks } from 'lucide-react';
import { useStore } from '../lib/store';
import { LogoMark, Wordmark } from '../components/Logo';

interface Errors {
  name?: string;
  roll?: string;
  branch?: string;
}

export default function SignIn() {
  const { signIn } = useStore();
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [branch, setBranch] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};
    if (!name.trim()) errs.name = 'Please enter your full name.';
    if (!roll.trim()) errs.roll = 'Please enter your roll number.';
    if (!branch.trim()) errs.branch = 'Please enter your branch.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    signIn({ name: name.trim(), roll: roll.trim(), branch: branch.trim() });
  };

  const field =
    'w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-mist-soft focus:border-gold focus:ring-2 focus:ring-gold/40 focus:outline-none';
  const label = 'mb-1.5 block text-[11px] font-bold tracking-wide text-mist uppercase';
  const err = 'mt-1.5 text-xs font-semibold text-danger';

  return (
    <div className="flex min-h-screen flex-col bg-linen lg:flex-row">
      {/* Brand panel */}
      <div className="relative overflow-hidden bg-navy px-6 py-10 text-cream sm:px-10 lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:px-14 lg:py-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #f4ede0 0, #f4ede0 1px, transparent 1px, transparent 14px)',
          }}
        />
        <div className="relative flex items-center gap-3">
          <LogoMark size={44} />
          <Wordmark light />
        </div>
        <div className="relative mt-10 lg:mt-0">
          <h1 className="font-display max-w-md text-3xl leading-tight font-semibold sm:text-4xl">
            Every deadline, ranked.
            <span className="text-gold"> Front of the queue, always.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-mist-soft">
            FrontRow scores your academic tasks by urgency, weight, and workload — so you always know exactly what to
            work on next.
          </p>
          <ul className="mt-8 hidden space-y-4 lg:block">
            {[
              { icon: GaugeCircle, text: 'A single priority score out of 100 for every task' },
              { icon: CalendarDays, text: 'Weekly calendar with subject-coded deadlines' },
              { icon: ListChecks, text: 'Workload analytics that update as you check things off' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-cream/90">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream/10 text-gold">
                  <Icon size={18} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative mt-10 hidden text-xs text-mist-soft lg:block">
          Your profile is stored only in this browser — no account, password, or server involved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="fade-up w-full max-w-md">
          <div className="rounded-2xl border border-line bg-cream p-6 shadow-sm sm:p-8">
            <p className="text-[11px] font-bold tracking-[0.25em] text-gold-deep uppercase">Student profile</p>
            <h2 className="font-display mt-1 text-2xl font-semibold text-navy">Take your seat</h2>
            <p className="mt-1.5 text-sm text-mist">
              Tell FrontRow who you are and we'll set up your dashboard.
            </p>

            <form onSubmit={submit} noValidate className="mt-6 space-y-5">
              <div>
                <label htmlFor="si-name" className={label}>Full name *</label>
                <input
                  id="si-name"
                  className={field}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Alex Rivera"
                  autoComplete="name"
                  autoFocus
                />
                {errors.name && <p className={err}>{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="si-roll" className={label}>Roll number *</label>
                <input
                  id="si-roll"
                  className={field}
                  value={roll}
                  onChange={(e) => setRoll(e.target.value)}
                  placeholder="e.g., 22CS1042"
                />
                {errors.roll && <p className={err}>{errors.roll}</p>}
              </div>
              <div>
                <label htmlFor="si-branch" className={label}>Branch *</label>
                <input
                  id="si-branch"
                  className={field}
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g., Computer Science & Engineering"
                />
                {errors.branch && <p className={err}>{errors.branch}</p>}
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-bold text-navy shadow-sm transition hover:bg-gold-deep hover:text-cream focus-visible:ring-2 focus-visible:ring-navy focus-visible:outline-none"
              >
                Enter Dashboard
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </form>
          </div>
          <p className="mt-4 text-center text-xs leading-relaxed text-mist">
            This is a local profile, not verified sign-in. It stays in your browser and is never sent anywhere.
          </p>
        </div>
      </div>
    </div>
  );
}
