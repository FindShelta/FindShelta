import React, { useState } from 'react';
import { Building2, User, Clock, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AgentRegistrationFormProps {
  onClose: () => void;
}

const AgentRegistrationForm: React.FC<AgentRegistrationFormProps> = ({ onClose }) => {
  const { registerAgent } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const ok = await registerAgent(formData);
      if (ok) {
        setSuccess(true);
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="panel w-full max-w-lg rounded-2xl p-8 text-center">
          <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
            <Clock className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-[color:var(--text)]">Registration submitted</h2>
          <p className="mt-3 text-sm text-[color:var(--text-muted)]">
            Your agent profile is under review. We will notify you once approval is complete.
          </p>

          <div className="mt-5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 text-left text-sm text-[color:var(--text-muted)]">
            <p className="font-semibold text-[color:var(--text)]">Next steps</p>
            <p className="mt-1">1. Admin review in 1-2 business days</p>
            <p>2. Approval update sent by email</p>
            <p>3. Listing access enabled in agent dashboard</p>
          </div>

          <button onClick={onClose} className="brand-button mt-6 w-full rounded-lg py-3 font-semibold">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="panel w-full max-w-2xl rounded-2xl p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Agent Onboarding</p>
            <h2 className="mt-1 text-2xl font-bold text-[color:var(--text)]">Register as an Agent</h2>
          </div>
          <button onClick={onClose} className="ghost-button inline-flex h-9 w-9 items-center justify-center rounded-lg" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">Full Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                className="brand-input w-full rounded-lg px-3 py-2.5"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="brand-input w-full rounded-lg px-3 py-2.5"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              className="brand-input w-full rounded-lg px-3 py-2.5"
            />
          </div>

          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 text-sm text-[color:var(--text-muted)]">
            <div className="mb-2 flex items-center gap-2 font-semibold text-[color:var(--text)]">
              <ShieldCheck className="h-4 w-4 text-[color:var(--brand)]" />
              Approval process
            </div>
            Registration is reviewed before listing access is enabled.
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="ghost-button w-full rounded-lg py-2.5 font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="brand-button w-full rounded-lg py-2.5 font-semibold disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentRegistrationForm;
