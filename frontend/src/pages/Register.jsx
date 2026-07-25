import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import { getApiUrl } from '../apiClient';

export default function Register(){
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const resp = await axios.post(getApiUrl('/api/auth/register'),{ name, email, password });
      if (resp.data && resp.data.success) {
        localStorage.setItem('pp_token', resp.data.token);
        localStorage.setItem('pp_user', JSON.stringify(resp.data.user));
        window.location.href = '/';
      } else {
        setError(resp.data?.message || 'Registration failed');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />
      <main className="mx-auto max-w-[1280px] px-4 md:px-6 py-12">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <h2 className="text-xl font-bold mb-4">Create account</h2>
          <form onSubmit={submit} className="space-y-4">
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Full name" className="w-full rounded-md bg-slate-800 px-3 py-2" />
            <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="w-full rounded-md bg-slate-800 px-3 py-2" />
            <input value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full rounded-md bg-slate-800 px-3 py-2" />
            {error && <div className="text-sm text-red-400">{error}</div>}
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="rounded-md bg-blue-600 px-4 py-2">{loading ? 'Creating...' : 'Create account'}</button>
              <a href="/login" className="ml-auto text-sm text-slate-300">Sign in</a>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
