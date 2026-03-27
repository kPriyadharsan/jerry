import React, { useState, useEffect, memo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, CheckCircle2, Award, Zap, BookOpen, Laptop, BookText, Info, ShieldCheck, HelpCircle, Mic2 } from 'lucide-react';

const FormInput = ({ label, icon: Icon, type = "text", value, onChange, placeholder, required = false, ...props }) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2 px-1 opacity-70 group-focus-within:opacity-100 group-focus-within:text-green-core transition-all">
      {Icon && <Icon size={12} />}
      {label}
    </label>
    <div className="relative rounded-2xl border border-white/40 bg-white/30 backdrop-blur-md focus-within:border-green-core/50 focus-within:bg-white/50 focus-within:shadow-[0_0_20px_rgba(76,221,30,0.05)] transition-all duration-500 overflow-hidden">
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent px-5 py-3.5 outline-none text-black-spore placeholder:text-text-muted/40 font-bold text-sm"
        {...props}
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-gradient-to-r from-transparent via-green-core to-transparent transition-all duration-700 group-focus-within:w-full" />
    </div>
  </div>
);

const FormSelect = ({ label, icon: Icon, value, onChange, options }) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2 px-1 opacity-70 group-focus-within:opacity-100 group-focus-within:text-green-core transition-all">
      {Icon && <Icon size={12} />}
      {label}
    </label>
    <div className="relative rounded-2xl border border-white/40 bg-white/30 backdrop-blur-md focus-within:border-green-core/50 focus-within:bg-white/50 transition-all duration-500 overflow-hidden">
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-transparent px-5 py-3.5 outline-none text-black-spore font-black text-sm appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} className="font-bold">{opt}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-black-spore/20">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-gradient-to-r from-transparent via-green-core to-transparent transition-all duration-700 group-focus-within:w-full" />
    </div>
  </div>
);

const DSAForm = memo(({ data, setData }) => (
  <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-2 duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <FormSelect 
        label="Environment" icon={Laptop} value={data.platform} 
        onChange={(e) => setData({ ...data, platform: e.target.value })} 
        options={['LeetCode', 'Codeforces', 'HackerRank']} 
      />
      <FormInput 
        label="Context/Topics" icon={BookOpen} placeholder="e.g. Dynamic Programming" 
        value={data.topic.join(', ')} 
        onChange={(e) => setData({ ...data, topic: e.target.value.split(',').map(s => s.trim()) })} 
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="md:col-span-1">
        <FormInput 
          label="Units/IDs" required placeholder="1, 45, 8" 
          value={data.problems} 
          onChange={(e) => setData({ ...data, problems: e.target.value })} 
        />
      </div>
      <FormSelect 
        label="Tier" value={data.difficulty} 
        onChange={(e) => setData({ ...data, difficulty: e.target.value })} 
        options={['Easy', 'Medium', 'Hard']} 
      />
      <FormInput 
        label="Duration (m)" type="number" required placeholder="45" 
        value={data.timeTaken} 
        onChange={(e) => setData({ ...data, timeTaken: e.target.value })} 
      />
    </div>
    
    <div className="bg-black/5 rounded-2xl p-4 border border-white/50 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2 px-1 opacity-60 shrink-0">
          <ShieldCheck size={12} />
          Combat Style
        </label>
        <div className="flex bg-white/40 p-1 rounded-xl border border-white/60 h-[42px] max-w-sm w-full md:w-auto overflow-hidden">
          <button
            type="button"
            onClick={() => setData({ ...data, solvedWithoutHelp: true })}
            className={`flex-1 md:px-6 flex items-center justify-center gap-2 rounded-lg text-[10px] font-black tracking-widest transition-all duration-300 ${
              data.solvedWithoutHelp 
                ? 'bg-green-core text-black-spore shadow-sm' 
                : 'text-text-muted hover:text-black-spore hover:bg-white/40'
            }`}
          >
            <Zap size={13} fill={data.solvedWithoutHelp ? "currentColor" : "none"} />
            PURE
          </button>
          <button
            type="button"
            onClick={() => setData({ ...data, solvedWithoutHelp: false })}
            className={`flex-1 md:px-6 flex items-center justify-center gap-2 rounded-lg text-[10px] font-black tracking-widest transition-all duration-300 ${
              !data.solvedWithoutHelp 
                ? 'bg-amber-400 text-black-spore shadow-sm' 
                : 'text-text-muted hover:text-black-spore hover:bg-white/40'
            }`}
          >
            <HelpCircle size={13} />
            ASSISTED
          </button>
        </div>
      </div>
    </div>
  </div>
));

const AppsForm = memo(({ data, setData }) => (
  <div className="flex flex-col gap-5 animate-in slide-in-from-bottom-2 duration-500">
    <FormInput 
      label="Subject/Concept" icon={BookText} required placeholder="e.g. React Render Cycle" 
      value={data.topic} 
      onChange={(e) => setData({ ...data, topic: e.target.value })} 
    />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <FormInput 
        label="Time (h)" type="number" step="0.5" required placeholder="2" 
        value={data.hours} 
        onChange={(e) => setData({ ...data, hours: e.target.value })} 
      />
      <FormInput 
        label="Queries" type="number" placeholder="5" 
        value={data.questionsSolved} 
        onChange={(e) => setData({ ...data, questionsSolved: e.target.value })} 
      />
      <FormInput 
        label="Neural Mastery" type="number" placeholder="85" 
        value={data.score} 
        onChange={(e) => setData({ ...data, score: e.target.value })} 
      />
    </div>
  </div>
));

const EnglishForm = memo(() => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white/30 backdrop-blur-md rounded-3xl border border-green-core/10 animate-in fade-in zoom-in duration-500 min-h-[300px]">
      <div className="w-20 h-20 bg-green-core/10 rounded-full flex items-center justify-center text-green-core mb-6 animate-pulse shadow-glow/10">
        <Mic2 size={40} />
      </div>
      <h3 className="text-xl font-black text-black-spore mb-3">Speak to Jerry Directly</h3>
      <p className="text-sm text-text-secondary text-center max-w-sm mb-8 font-medium">
        English data is now automatically ingested during your voice practice sessions.
      </p>
      <button 
        onClick={(e) => {
          e.preventDefault();
          navigate('/voice-practice');
        }}
        className="px-8 py-3.5 bg-green-core text-black-spore font-black text-xs rounded-2xl shadow-glow hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3"
      >
        <Zap size={16} fill="currentColor" />
        LAUNCH VOICE PRACTICE
      </button>
    </div>
  );
});

const DevForm = memo(({ data, setData }) => (
  <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-2 duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <FormInput 
        label="Project Code" icon={Laptop} required placeholder="e.g. Jerry AI Core" 
        value={data.projectName} 
        onChange={(e) => setData({ ...data, projectName: e.target.value })} 
      />
      <FormInput 
        label="Dev Time (min)" type="number" required placeholder="120" 
        value={data.minutesWorked} 
        onChange={(e) => setData({ ...data, minutesWorked: e.target.value })} 
      />
    </div>
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
    <div className="flex-1 p-4 md:px-10 md:py-6 overflow-hidden bg-gradient-to-br from-bg-primary via-bg-primary to-green-core/5 flex flex-col">
      <div className="max-w-5xl mx-auto w-full h-full flex flex-col space-y-6">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-core font-bold text-xs uppercase tracking-widest bg-green-core/10 w-fit px-3 py-1 rounded-pill">
              <Zap size={14} className="fill-green-core" />
              Daily Optimization
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-display text-black-spore">Update Jerry's Brain</h1>
            <p className="text-text-secondary font-medium pl-1">Feed the core with your daily achievements.</p>
          </div>
          
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start overflow-hidden pb-4">
          
          {/* Unified Task Status Card */}
          <aside className="lg:col-span-4 h-full overflow-hidden flex flex-col">
            <div className="bg-white/50 backdrop-blur-2xl flex-1 flex flex-col rounded-3xl border border-white/80 shadow-xl overflow-hidden relative">
               {/* Ambient glows */}
               <div className="absolute -top-8 -right-8 w-36 h-36 bg-green-core/15 rounded-full blur-3xl pointer-events-none" />
               <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

               {/* Header */}
               <div className="px-6 pt-6 pb-4 shrink-0 flex items-center justify-between border-b border-black/5">
                 <div>
                   <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black-spore/40 mb-0.5">Today's Progress</p>
                   <h2 className="text-lg font-black text-black-spore tracking-tight">Task Board</h2>
                 </div>
                 <div className="flex items-center gap-2 bg-white/60 border border-white px-3 py-1.5 rounded-full shadow-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-core animate-pulse" />
                   <span className="text-[11px] font-black text-black-spore tabular-nums">
                     {completedTasks.length}/{completedTasks.length + pendingTasks.length}
                   </span>
                 </div>
               </div>

               {/* Unified Task List */}
               <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-2">
                 {completedTasks.length === 0 && pendingTasks.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-full opacity-30 text-center pb-10">
                     <Zap size={36} className="text-black-spore mb-3" />
                     <p className="text-[11px] font-black uppercase tracking-widest text-black-spore">Add your first task</p>
                   </div>
                 ) : (
                   <>
                     {completedTasks.map((t, i) => (
                       <div key={`done-${i}`} className="flex items-center gap-3.5 px-4 py-3.5 bg-white/40 rounded-2xl border border-green-core/10 hover:bg-white/70 hover:shadow-sm group transition-all duration-300">
                         <div className="w-7 h-7 bg-green-core/15 rounded-xl flex items-center justify-center shrink-0">
                           <CheckCircle2 size={14} className="text-green-core" />
                         </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] font-black text-green-core/50 uppercase tracking-widest">{t.type}</p>
                            <p className="text-[13px] font-black text-black-spore/50 line-clamp-2 line-through decoration-green-core/20">{t.title}</p>
                          </div>
                       </div>
                     ))}
                     {pendingTasks.map((t, i) => (
                       <div key={`pend-${i}`} className="flex items-center gap-3.5 px-4 py-3.5 bg-white/60 rounded-2xl border border-orange-500/10 hover:bg-white/90 hover:border-orange-500/20 hover:shadow-sm group/item transition-all duration-300">
                         <div className="w-7 h-7 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
                           <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                         </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] font-black text-orange-500/60 uppercase tracking-widest">{t.type}</p>
                            <p className="text-[13px] font-black text-black-spore line-clamp-2 leading-tight">{t.title}</p>
                          </div>
                         <button
                           onClick={() => { useAppStore.getState().sendChatMessage(`Help me with this ${t.type} task: ${t.title}`); navigate('/'); }}
                           className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover/item:opacity-100 group-hover/item:bg-orange-500/10 group-hover/item:text-orange-600 hover:!bg-orange-500 hover:!text-white transition-all duration-200"
                         >
                           <Zap size={13} fill="currentColor" />
                         </button>
                       </div>
                     ))}
                   </>
                 )}
               </div>

               {/* Footer Progress Bar */}
               <div className="px-6 py-4 shrink-0 border-t border-black/5">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-[9px] font-black text-black-spore/40 uppercase tracking-widest">Completion</span>
                   <span className="text-[11px] font-black text-black-spore">
                     {completedTasks.length + pendingTasks.length === 0 ? 0 : Math.round((completedTasks.length / (completedTasks.length + pendingTasks.length)) * 100)}%
                   </span>
                 </div>
                 <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                   <div
                     className="h-full bg-gradient-to-r from-green-core to-emerald-400 rounded-full transition-all duration-700"
                     style={{ width: `${completedTasks.length + pendingTasks.length === 0 ? 0 : Math.round((completedTasks.length / (completedTasks.length + pendingTasks.length)) * 100)}%` }}
                   />
                 </div>
               </div>
            </div>
          </aside>

          {/* Form Main Area */}
          <main className="lg:col-span-8 order-1 lg:order-2 h-full min-h-0 flex flex-col">
            <div className="bg-bg-glass flex-1 min-h-0 flex flex-col backdrop-blur-xl rounded-3xl border border-white shadow-card overflow-hidden">
              <nav className="flex bg-black-mist/5 p-2 gap-1 overflow-x-auto hide-scrollbar shrink-0">
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
              
              <div className="p-8 md:p-12 relative flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="absolute top-0 left-0 w-32 h-32 bg-green-core/10 rounded-full blur-3xl -ml-16 -mt-16 pointer-events-none" />
                
                <form onSubmit={handleSubmit} className="space-y-10 relative">
                  {/* Dynamic Form Content */}
                  {activeTab === 'DSA' && <DSAForm data={dsaData} setData={setDsaData} />}
                  {activeTab === 'Apps/Concepts' && <AppsForm data={appsData} setData={setAppsData} />}
                  {activeTab === 'English' && <EnglishForm />}
                  {activeTab === 'Development' && <DevForm data={devData} setData={setDevData} />}

                  {activeTab !== 'English' && (
                    <div className="pt-10 border-t border-green-core/10 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex-1 space-y-2">
                        <p className="text-xs font-black text-black-spore/60 uppercase tracking-[0.2em] flex items-center gap-2">
                          <ShieldCheck size={14} className="text-green-core" />
                          Neural Integrity Verified
                        </p>
                        <p className="text-xs text-text-muted max-w-sm font-medium leading-relaxed">
                          Your daily combat logs will be cross-referenced across Jerry's neural modules to optimize your learning path.
                        </p>
                      </div>

                      {/* Modern Sleek Sync Button */}
                      <div className="shrink-0 flex items-center">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="relative px-5 py-3 bg-black-spore text-white rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2.5 transition-all duration-300 hover:bg-green-core hover:text-black-spore hover:shadow-[0_4px_12px_rgba(76,221,30,0.2)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none group overflow-hidden"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-2 scale-90">
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span className="opacity-70">SYNCING</span>
                            </div>
                          ) : (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                              <span className="relative z-10 px-1">Execute Link</span>
                              <div className="relative z-10 w-6 h-6 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-black/10 transition-colors">
                                <Zap size={11} className="fill-current" />
                              </div>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
