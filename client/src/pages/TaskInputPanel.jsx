import React, { useState, useEffect, memo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, CheckCircle2, Award, Zap, BookOpen, Laptop, BookText, Info, ShieldCheck, HelpCircle } from 'lucide-react';
import EnglishPracticeMini from '../components/EnglishPracticeMini';

const FormInput = ({ label, icon: Icon, type = "text", value, onChange, placeholder, required = false, ...props }) => (
  <div className="space-y-2 group">
    <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5 px-1">
      {Icon && <Icon size={12} className="text-green-core" />}
      {label}
    </label>
    <div className="relative overflow-hidden rounded-xl border border-green-core/10 bg-black-mist/5 focus-within:border-green-core/40 focus-within:bg-white/50 transition-all duration-300">
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent px-4 py-3 outline-none text-text-primary placeholder:text-text-muted/50 font-medium"
        {...props}
      />
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-green-core transition-all duration-500 group-focus-within:w-full" />
    </div>
  </div>
);

const FormSelect = ({ label, icon: Icon, value, onChange, options }) => (
  <div className="space-y-2 group">
    <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5 px-1">
      {Icon && <Icon size={12} className="text-green-core" />}
      {label}
    </label>
    <div className="relative overflow-hidden rounded-xl border border-green-core/10 bg-black-mist/5 focus-within:border-green-core/40 focus-within:bg-white/50 transition-all duration-300">
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-transparent px-4 py-3 outline-none text-text-primary placeholder:text-text-muted/50 font-medium appearance-none"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-text-muted">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-green-core transition-all duration-500 group-focus-within:w-full" />
    </div>
  </div>
);

const DSAForm = memo(({ data, setData }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-500">
    <FormSelect 
      label="Platform" icon={Laptop} value={data.platform} 
      onChange={(e) => setData({ ...data, platform: e.target.value })} 
      options={['LeetCode', 'Codeforces', 'HackerRank']} 
    />
    <FormInput 
      label="Topic Area" icon={BookOpen} placeholder="e.g. Arrays, Graph" 
      value={data.topic.join(', ')} 
      onChange={(e) => setData({ ...data, topic: e.target.value.split(',').map(s => s.trim()) })} 
    />
    <FormInput 
      label="Problem IDs" required placeholder="e.g. 104, 32" 
      value={data.problems} 
      onChange={(e) => setData({ ...data, problems: e.target.value })} 
    />
    <FormSelect 
      label="Difficulty" value={data.difficulty} 
      onChange={(e) => setData({ ...data, difficulty: e.target.value })} 
      options={['Easy', 'Medium', 'Hard']} 
    />
    <FormInput 
      label="Time Taken (mins)" type="number" required placeholder="45" 
      value={data.timeTaken} 
      onChange={(e) => setData({ ...data, timeTaken: e.target.value })} 
    />
    
    <div className="space-y-2">
      <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5 px-1">
        <ShieldCheck size={12} className="text-green-core" />
        Solving Status
      </label>
      <div className="flex bg-black-mist/5 p-1 rounded-xl border border-green-core/10 h-[52px]">
        <button
          type="button"
          onClick={() => setData({ ...data, solvedWithoutHelp: true })}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all ${
            data.solvedWithoutHelp 
              ? 'bg-green-core text-black-spore shadow-sm' 
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <ShieldCheck size={14} />
          SELF-SOLVED
        </button>
        <button
          type="button"
          onClick={() => setData({ ...data, solvedWithoutHelp: false })}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all ${
            !data.solvedWithoutHelp 
              ? 'bg-orange-500/20 text-orange-600 border border-orange-500/30' 
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <HelpCircle size={14} />
          WITH HELP
        </button>
      </div>
    </div>
  </div>
));

const AppsForm = memo(({ data, setData }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-500">
    <FormInput 
      label="Study Topic" icon={BookText} required placeholder="e.g. React Render Cycle" 
      value={data.topic} 
      onChange={(e) => setData({ ...data, topic: e.target.value })} 
    />
    <FormInput 
      label="Hours Spent" type="number" step="0.5" required placeholder="2" 
      value={data.hours} 
      onChange={(e) => setData({ ...data, hours: e.target.value })} 
    />
    <FormInput 
      label="Questions Solved" type="number" placeholder="5" 
      value={data.questionsSolved} 
      onChange={(e) => setData({ ...data, questionsSolved: e.target.value })} 
    />
    <FormInput 
      label="Mastery Score (0-100)" type="number" placeholder="85" 
      value={data.score} 
      onChange={(e) => setData({ ...data, score: e.target.value })} 
    />
  </div>
));

const EnglishForm = memo(() => (
  <div className="flex flex-col items-center justify-center p-4 min-h-[300px] animate-in slide-in-from-bottom-2 duration-500">
    <div className="max-w-md w-full">
      <div className="text-center mb-6">
        <h4 className="text-lg font-bold text-black-spore">Voice Practice Log</h4>
        <p className="text-sm text-text-secondary">Analyze your speaking skills directly from Jerry's Brain interface.</p>
      </div>
      <EnglishPracticeMini />
    </div>
  </div>
));

const DevForm = memo(({ data, setData }) => (
  <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-2 duration-500">
    <FormInput 
      label="Project Name" icon={Laptop} required placeholder="e.g. Jerry AI Brain" 
      value={data.projectName} 
      onChange={(e) => setData({ ...data, projectName: e.target.value })} 
    />
    <FormInput 
      label="Time Worked (mins)" type="number" required placeholder="120" 
      value={data.minutesWorked} 
      onChange={(e) => setData({ ...data, minutesWorked: e.target.value })} 
    />
  </div>
));

export default function TaskInputPanel() {
  const { pendingTasks, completedTasks, submitTask, fetchDashboardData } = useAppStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('DSA');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const [dsaData, setDsaData] = useState({ 
    platform: 'LeetCode', 
    topic: [], 
    problems: '', 
    difficulty: 'Medium', 
    timeTaken: '',
    solvedWithoutHelp: false 
  });
  const [appsData, setAppsData] = useState({ topic: '', hours: '', questionsSolved: '', score: '' });
  const [englishData, setEnglishData] = useState({ topic: '', minutes: '' });
  const [devData, setDevData] = useState({ projectName: '', minutesWorked: '' });

  const tabs = [
    { id: 'DSA', icon: Laptop, label: 'DSA' },
    { id: 'Apps/Concepts', icon: BookText, label: 'Aptitude' },
    { id: 'English', icon: BookOpen, label: 'English' },
    { id: 'Development', icon: Zap, label: 'Build (Optional)' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let payload = {};
    
    if (activeTab === 'DSA') {
      const problemArray = dsaData.problems.split(',').filter(x => x.trim().length > 0);
      const problemCount = problemArray.length;
      
      payload = { 
        dsa: { 
          ...dsaData, 
          problems: problemCount,
          problemIdentifiers: problemArray.map(p => p.trim()),
          timeTaken: Number(dsaData.timeTaken)
        } 
      };
    } else if (activeTab === 'Apps/Concepts') {
      payload = { 
        apps: { 
          ...appsData, 
          hours: Number(appsData.hours),
          questions: Number(appsData.questionsSolved),
          score: Number(appsData.score)
        } 
      };
    } else if (activeTab === 'English') {
      payload = { 
        english: { 
          ...englishData, 
          minutes: Number(englishData.minutes)
        } 
      };
    } else if (activeTab === 'Development') {
      payload = { 
        dev: { 
          project: devData.projectName,
          minutes: Number(devData.minutesWorked)
        } 
      };
    }
    
    const success = await submitTask(payload);
    setIsSubmitting(false);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="flex-1 p-4 md:p-10 overflow-y-auto bg-gradient-to-br from-bg-primary via-bg-primary to-green-core/5 scroll-smooth">
      <div className="max-w-5xl mx-auto space-y-10 py-6">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-core font-bold text-xs uppercase tracking-widest bg-green-core/10 w-fit px-3 py-1 rounded-pill">
              <Zap size={14} className="fill-green-core" />
              Daily Optimization
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-display text-black-spore">Update Jerry's Brain</h1>
            <p className="text-text-secondary font-medium pl-1">Feed the core with your daily achievements.</p>
          </div>
          <div className="hidden md:block">
             <div className="bg-white/40 backdrop-blur-sm border border-green-core/20 rounded-2xl p-4 flex items-center gap-4">
               <div className="w-12 h-12 bg-green-core rounded-xl flex items-center justify-center text-white shadow-glow">
                 <Award size={24} />
               </div>
               <div>
                 <p className="text-xs font-bold text-text-muted uppercase tracking-tighter">Current Readiness</p>
                 <p className="text-xl font-bold text-black-spore">Combat Ready</p>
               </div>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Status Sidebar */}
          <aside className="lg:col-span-4 space-y-8 order-2 lg:order-1">
            <section className="bg-bg-glass backdrop-blur-xl rounded-3xl border border-white p-6 shadow-card hover:shadow-glow/5 transition-all duration-500">
               <h3 className="text-lg font-black font-display text-black-spore mb-6 flex items-center gap-3">
                 <Clock className="text-orange-500" size={20} />
                 Pending Missions
               </h3>
               <div className="space-y-3">
                 {pendingTasks.length === 0 ? (
                   <div className="text-center py-6 px-4 bg-green-core/5 rounded-2xl border border-dashed border-green-core/20">
                     <p className="text-sm font-bold text-green-deep">Maximum Optimization Achieved!</p>
                   </div>
                 ) : (
                   pendingTasks.map((t, i) => (
                     <div key={i} className="group p-4 bg-black-mist/5 rounded-2xl border border-transparent hover:border-green-core/20 hover:bg-white/40 transition-all cursor-default">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t.type}</span>
                          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-black-spore group-hover:text-green-deep transition-colors">{t.title}</p>
                          <button 
                            onClick={() => {
                              useAppStore.getState().sendChatMessage(`I need help with this ${t.type} problem: ${t.title}. Please provide a structured analysis and next steps.`);
                              navigate('/');
                            }}
                            className="shrink-0 p-1.5 bg-green-core/10 rounded-lg text-green-deep opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-core hover:text-white"
                            title="Ask Jerry for help"
                          >
                            <Zap size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </section>

            <section className="bg-bg-glass backdrop-blur-xl rounded-3xl border border-white p-6 shadow-card">
               <h3 className="text-lg font-black font-display text-black-spore mb-6 flex items-center gap-3">
                 <CheckCircle2 className="text-green-core" size={20} />
                 Data Ingested
               </h3>
               <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {completedTasks.length === 0 ? (
                   <p className="text-sm text-text-muted italic text-center py-4">No data streams received yet.</p>
                 ) : (
                   completedTasks.map((t, i) => (
                     <div key={i} className="flex items-center gap-4 p-3 bg-green-core/5 rounded-xl border border-green-core/10">
                        <div className="p-2 bg-green-core rounded-lg text-white"><CheckCircle size={14} /></div>
                        <div>
                          <p className="text-xs font-black text-text-secondary uppercase">{t.type}</p>
                          <p className="text-[13px] font-bold text-black-spore">{t.title}</p>
                        </div>
                     </div>
                   ))
                 )}
               </div>
            </section>
            
            {/* EnglishPracticeMini removed from here as it is now in main form */}
          </aside>

          {/* Form Main Area */}
          <main className="lg:col-span-8 order-1 lg:order-2">
            <div className="bg-bg-glass backdrop-blur-xl rounded-3xl border border-white shadow-card overflow-hidden">
              <nav className="flex bg-black-mist/5 p-2 gap-1 overflow-x-auto hide-scrollbar">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300 relative whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-green-core text-black-spore shadow-glow/40'
                          : 'text-text-muted hover:bg-black-mist/5 hover:text-text-primary'
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                      {activeTab === tab.id && (
                        <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </nav>
              
              <div className="p-8 md:p-12 relative min-h-[400px]">
                <div className="absolute top-0 left-0 w-32 h-32 bg-green-core/10 rounded-full blur-3xl -ml-16 -mt-16 pointer-events-none" />
                
                <form onSubmit={handleSubmit} className="space-y-10 relative">
                  {/* Dynamic Form Content */}
                  {activeTab === 'DSA' && <DSAForm data={dsaData} setData={setDsaData} />}
                  {activeTab === 'Apps/Concepts' && <AppsForm data={appsData} setData={setAppsData} />}
                  {activeTab === 'English' && <EnglishForm />}
                  {activeTab === 'Development' && <DevForm data={devData} setData={setDevData} />}

                  <div className="pt-8 border-t border-green-core/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs text-text-muted max-w-xs font-medium">
                      Information processed here will be used to calibrate your neural score and pattern recognition modules.
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto px-10 py-4 bg-black-spore text-green-core font-black rounded-2xl shadow-xl hover:bg-green-core hover:text-black-spore hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 overflow-hidden group relative"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-green-core border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Zap size={18} className="group-hover:animate-bounce" />
                          <span>SYNCHRONIZE DATA</span>
                        </>
                      )}
                      <div className="absolute inset-0 bg-green-core/20 translate-y-12 group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
