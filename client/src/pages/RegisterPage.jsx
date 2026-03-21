import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AuthLayout from '../components/AuthLayout';
import { Mail, Lock, User, Target, Loader2, ArrowRight, BrainCircuit, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    goal: '',
    skills: '',
    weaknesses: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const register = useAuthStore(state => state.register);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        weaknesses: formData.weaknesses.split(',').map(s => s.trim()).filter(s => s)
      };
      await register(payload);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title={step === 1 ? "Create account" : "Initialize Jerry"} 
      subtitle={step === 1 ? "Join the AI-powered productivity revolution" : "Tell Jerry about your goals to customize your experience"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-600 text-sm animate-shake">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-text-muted text-xs uppercase tracking-widest pl-2">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-green-deep transition-colors" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-bg-secondary rounded-md px-4 py-2.5 pl-12 border border-transparent focus:border-green-core focus:ring-2 focus:ring-green-glow outline-none transition-all duration-200 text-text-primary placeholder:text-text-muted"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-text-muted text-xs uppercase tracking-widest pl-2">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-green-deep transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-bg-secondary rounded-md px-4 py-2.5 pl-12 border border-transparent focus:border-green-core focus:ring-2 focus:ring-green-glow outline-none transition-all duration-200 text-text-primary placeholder:text-text-muted"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-text-muted text-xs uppercase tracking-widest pl-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-green-deep transition-colors" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-bg-secondary rounded-md px-4 py-2.5 pl-12 border border-transparent focus:border-green-core focus:ring-2 focus:ring-green-glow outline-none transition-all duration-200 text-text-primary placeholder:text-text-muted"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="space-y-2">
              <label className="text-text-muted text-xs uppercase tracking-widest pl-2 flex items-center gap-2">
                <Target className="w-4 h-4" /> Principal Goal
              </label>
              <input
                type="text"
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                required
                className="w-full bg-bg-secondary rounded-md px-4 py-2.5 border border-transparent focus:border-green-core focus:ring-2 focus:ring-green-glow outline-none transition-all duration-200 text-text-primary placeholder:text-text-muted"
                placeholder="Ex: Master Full-Stack Dev"
              />
            </div>

            <div className="space-y-2">
              <label className="text-text-muted text-xs uppercase tracking-widest pl-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Skills (comma separated)
              </label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                className="w-full bg-bg-secondary rounded-md px-4 py-2.5 border border-transparent focus:border-green-core focus:ring-2 focus:ring-green-glow outline-none transition-all duration-200 text-text-primary placeholder:text-text-muted min-h-[80px]"
                placeholder="React, Python, Design..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-text-muted text-xs uppercase tracking-widest pl-2 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" /> Weaknesses (comma separated)
              </label>
              <textarea
                name="weaknesses"
                value={formData.weaknesses}
                onChange={handleInputChange}
                className="w-full bg-bg-secondary rounded-md px-4 py-2.5 border border-transparent focus:border-green-core focus:ring-2 focus:ring-green-glow outline-none transition-all duration-200 text-text-primary placeholder:text-text-muted min-h-[80px]"
                placeholder="Laziness, Syntax, Procrastination..."
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-core text-black-spore font-semibold rounded-pill px-6 py-3.5 shadow-glow hover:bg-green-deep hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {step === 1 ? 'Next Step' : 'Create My Brain'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {step === 2 && (
            <button
               type="button"
               onClick={() => setStep(1)}
               className="w-full text-text-muted text-sm hover:text-green-deep transition-colors py-2"
            >
              Back to account details
            </button>
          )}

          <p className="text-center text-text-muted text-sm font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-green-deep hover:text-green-core font-bold transition-all underline underline-offset-4 decoration-green-core/30">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
