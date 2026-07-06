import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Eye, EyeOff, FolderKanban, LoaderCircle } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useApp } from '../context/AppContext';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', organizationName: '', email: '', password: '' });
  const { signIn } = useApp();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('');
    try {
      if (mode === 'register') {
        await api.post('/auth/register', form);
        const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
        signIn(data);
      } else {
        const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
        signIn(data);
      }
      navigate('/overview');
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return <div className="auth-page">
    <section className="auth-aside">
      <div className="auth-brand"><span className="brand-mark"><FolderKanban size={21} /></span>SprintBoard</div>
      <div className="auth-message"><span className="eyebrow">Plan. Build. Deliver.</span><h1>Keep every sprint moving in the same direction.</h1><p>A focused workspace for projects, issues, sprints and the people shipping them.</p>
        <ul><li><Check size={17} />Organized project backlogs</li><li><Check size={17} />Clear sprint ownership</li><li><Check size={17} />Fast team collaboration</li></ul>
      </div><p className="auth-aside-foot">Built for teams that value clarity.</p>
    </section>
    <main className="auth-main"><div className="auth-form-wrap">
      <div className="auth-mobile-brand"><FolderKanban size={20} />SprintBoard</div>
      <div className="auth-heading"><span className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Create your workspace'}</span><h2>{mode === 'login' ? 'Sign in to SprintBoard' : 'Start planning better'}</h2><p>{mode === 'login' ? 'Enter your account details to continue.' : 'Set up your organization and owner account.'}</p></div>
      <div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }}>Sign in</button><button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); }}>Create account</button></div>
      <form onSubmit={submit} className="form-stack">
        {mode === 'register' && <div className="form-row"><label>Full name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Morgan" required /></label><label>Organization<input value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} placeholder="Acme Studio" required /></label></div>}
        <label>Email address<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" required /></label>
        <label>Password<div className="password-input"><input type={showPassword ? 'text' : 'password'} minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 8 characters" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
        {error && <div className="form-error">{error}</div>}
        <button className="button button-primary button-full" disabled={loading}>{loading ? <LoaderCircle className="spin" size={18} /> : <>{mode === 'login' ? 'Sign in' : 'Create workspace'}<ArrowRight size={17} /></>}</button>
      </form>
    </div></main>
  </div>;
}
