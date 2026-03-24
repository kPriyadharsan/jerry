import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Flame, TrendingDown, Info, ShieldAlert, Zap } from 'lucide-react';

export default function Dashboard() {
  const { todayScore, streak, weakArea, weeklyScores, patternInsights, fetchDashboardData, pendingTasks, completedTasks } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalPossible = (pendingTasks?.length || 0) + (completedTasks?.length || 0);
  const progressPercent = totalPossible > 0 ? Math.round((completedTasks?.length / totalPossible) * 100) : 0;

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center relative z-0">
          <div className="absolute top-0 right-10 w-72 h-72 bg-green-core/5 rounded-[60%_40%_55%_45%/45%_55%_40%_60%] blur-[100px] animate-blob pointer-events-none -z-10" />
          <h1 className="text-3xl font-bold font-display text-text-primary">
            Analytics Overview
          </h1>
          <div className="text-sm px-4 py-2 bg-bg-secondary rounded-pill text-text-secondary font-medium">
            Live Feed Active
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-bg-glass backdrop-blur-md rounded-lg border border-green-core/20 shadow-card p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-core/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-text-muted font-medium text-sm mb-1">Today's Score</p>
                <h3 className="text-4xl font-bold text-text-primary">{todayScore}<span className="text-lg text-text-muted">/100</span></h3>
              </div>
              <div className="p-3 bg-green-core/20 rounded-xl text-green-core"><Activity size={24} /></div>
            </div>
            <div className="mt-4 flex items-center text-emerald-400 text-sm font-medium gap-1">
              <TrendingDown className="rotate-180" size={16} /> +5% from yesterday
            </div>
          </div>

          <div className="bg-bg-glass backdrop-blur-md rounded-lg border border-green-core/20 shadow-card p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-text-muted font-medium text-sm mb-1">Current Streak</p>
                <h3 className="text-4xl font-bold text-text-primary">{streak} <span className="text-lg text-text-muted">Days</span></h3>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400"><Flame size={24} className="animate-pulse" /></div>
            </div>
            <div className="mt-4 flex items-center text-orange-400 text-sm font-medium gap-1">
              Keep it burning!
            </div>
          </div>

          <div className="bg-bg-glass backdrop-blur-md rounded-lg border border-green-core/20 shadow-card p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-text-muted font-medium text-sm mb-1">Weakest Area</p>
                <h3 className="text-xl font-bold text-text-primary mt-1 leading-snug">{weakArea}</h3>
              </div>
              <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400"><ShieldAlert size={24} /></div>
            </div>
            <div className="mt-4 flex items-center text-rose-400 text-sm font-medium gap-1">
              Priority Focus Recommended
            </div>
          </div>
        </div>

        {/* Charts & Today Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-bg-glass backdrop-blur-md rounded-lg border border-green-core/20 shadow-card p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-core/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-text-primary">Performance Trajectory</h2>
              <div className="flex items-center gap-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                <div className="flex items-center gap-1.5 font-bold text-green-core">
                  <div className="w-2 h-2 rounded-full bg-green-core shadow-glow" /> Status: Optimizing
                </div>
              </div>
            </div>
            
            <div className="h-72 w-full pr-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyScores} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4cdd1e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4cdd1e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,221,30,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#3a5a3a" 
                    tick={{fill: '#7a9a7a', fontSize: 11, fontWeight: 600}} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10} 
                  />
                  <YAxis 
                    stroke="#3a5a3a" 
                    tick={{fill: '#7a9a7a', fontSize: 11, fontWeight: 600}} 
                    axisLine={false} 
                    tickLine={false} 
                    dx={-5}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-black-spore/95 backdrop-blur-md border border-green-core/30 p-3 rounded-xl shadow-glow ring-1 ring-white/5">
                            <p className="text-[10px] font-black text-green-core/60 uppercase tracking-tighter mb-1">{payload[0].payload.day}</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-black text-white">{payload[0].value}</span>
                              <span className="text-[10px] font-bold text-text-muted">SCORE</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ stroke: '#4cdd1e', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#4cdd1e"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    animationDuration={2000}
                    animationEasing="ease-in-out"
                    activeDot={{ r: 6, fill: '#4cdd1e', stroke: '#fff', strokeWidth: 2, className: "shadow-glow" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-bg-glass backdrop-blur-md rounded-lg border border-green-core/20 shadow-card p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
              <Info className="text-green-core" size={20} />
              Today's Status
            </h2>
            <div className="flex-1 bg-bg-secondary rounded-xl p-5 border border-green-core/10 flex flex-col">
              <div className="mb-4">
                <div className="flex justify-between text-xs text-text-muted mb-1 font-medium italic">
                  <span>Daily Progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden border border-green-core/5">
                  <div 
                    className="h-full bg-green-core shadow-glow transition-all duration-1000" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                   <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Completed</h4>
                   {completedTasks?.length > 0 ? (
                     completedTasks.slice(0, 3).map((t, i) => (
                       <div key={i} className="flex items-center gap-2 text-xs text-text-primary">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-core" />
                         <span className="truncate">{t.title}</span>
                       </div>
                     ))
                   ) : (
                     <p className="text-xs text-text-muted italic">No tasks completed yet.</p>
                   )}
                </div>

                <div className="space-y-2">
                   <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Pending</h4>
                   {pendingTasks?.length > 0 ? (
                     pendingTasks.slice(0, 3).map((t, i) => (
                       <div key={i} className="flex items-center justify-between gap-2 text-xs text-text-muted group/task">
                         <div className="flex items-center gap-2 truncate">
                           <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                           <span className="truncate">{t.title}</span>
                         </div>
                         <button 
                           onClick={() => {
                             useAppStore.getState().sendChatMessage(`I need help with this ${t.type} problem: ${t.title}. Please provide a structured analysis and next steps.`);
                             navigate('/');
                           }}
                           className="shrink-0 p-1 hover:text-green-core opacity-0 group-hover/task:opacity-100 transition-opacity"
                           title="Ask Jerry"
                         >
                           <Zap size={12} />
                         </button>
                       </div>
                     ))
                   ) : (
                     <p className="text-xs text-green-core italic">Goal reached! All clear.</p>
                   )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-green-core/10">
                <p className="text-text-secondary leading-relaxed text-[11px] italic">
                   "{patternInsights || 'Jerry is refining your neural path...'}"
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
