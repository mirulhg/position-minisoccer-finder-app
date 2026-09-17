import { useState, type FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';

interface LoginFormProps {
  onEmailSent: () => void;
}

/**
 * Metode login MVP: Google OAuth + magic link email. OTP nomor HP (literal
 * di FR-01) ditunda — butuh provider SMS berbayar terpisah yang belum
 * disetujui (deviasi terdokumentasi, bukan diam-diam diganti).
 */
export function LoginForm({ onEmailSent }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    if (!supabase) return;
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (oauthError) setError(oauthError.message);
  }

  async function handleEmailSubmit(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setError(null);
    setIsSendingLink(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setIsSendingLink(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }
    onEmailSent();
  }

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={handleGoogleLogin} className="w-full">
        Masuk dengan Google
      </Button>

      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" />
        atau
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
        <Input
          id="login-email"
          label="Email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nama@email.com"
        />
        <Button type="submit" variant="secondary" disabled={isSendingLink} className="w-full">
          {isSendingLink ? 'Mengirim tautan…' : 'Kirim tautan masuk'}
        </Button>
      </form>

      {error && (
        <p role="alert" className="text-sm text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
}
