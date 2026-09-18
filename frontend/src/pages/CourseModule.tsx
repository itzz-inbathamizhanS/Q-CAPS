import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { curriculumModules } from '@/data/curriculumData';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { quizzesData } from '@/data/quizzesData';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, CheckCircle, ArrowLeft, ArrowRight, Lock, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const CourseModule: React.FC = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  
  const {
    markModuleRead,
    isModuleUnlocked,
    isModuleCompleted,
    quizScores,
  } = useCurriculumStore();
  
  const moduleData = curriculumModules.find(m => m.id === moduleId);

  if (!moduleData) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-slate-800">Module Not Found</h1>
        <p className="text-slate-600 mb-6">The course module you are looking for does not exist.</p>
        <Link to="/learning">
          <Button variant="primary">Return to Learning</Button>
        </Link>
      </div>
    );
  }

  // Prerequisite guard: prevent direct URL access to locked modules
  const unlocked = isModuleUnlocked(moduleData.id);
  if (!unlocked) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <Lock className="text-red-500" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Module Locked</h1>
        <p className="text-slate-600">
          This module requires completing prerequisite modules before it can be accessed.
        </p>
        {moduleData.prerequisites.length > 0 && (
          <div className="text-sm text-slate-500">
            <p className="font-medium mb-2">Prerequisites:</p>
            <ul className="space-y-1">
              {moduleData.prerequisites.map(prereqId => {
                const prereq = curriculumModules.find(m => m.id === prereqId);
                const completed = isModuleCompleted(prereqId);
                return (
                  <li key={prereqId} className="flex items-center justify-center gap-2">
                    {completed ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : (
                      <Lock size={14} className="text-red-400" />
                    )}
                    <span>{prereq?.code} — {prereq?.title ?? prereqId}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <Link to="/curriculum">
          <Button variant="primary">View Curriculum Map</Button>
        </Link>
      </div>
    );
  }

  const completed = isModuleCompleted(moduleData.id);
  const quizScore = quizScores[moduleData.id];
  const hasQuiz = !!(moduleId && quizzesData[moduleId]);

  // Find previous and next modules in the curriculum
  const currentIdx = curriculumModules.findIndex(m => m.id === moduleId);
  const prevModule = currentIdx > 0 ? curriculumModules[currentIdx - 1] : null;
  const nextModule = currentIdx >= 0 && currentIdx < curriculumModules.length - 1
    ? curriculumModules[currentIdx + 1]
    : null;

  const handleMarkComplete = () => {
    if (!moduleId || completed) return;
    markModuleRead(moduleId);
  };
  
  return (
    <div className="max-w-7xl mx-auto p-8 md:p-12 flex flex-col min-h-screen bg-slate-50/50">
      
      {/* TOP MODULE CONTEXT HEADER & METADATA BAR */}
      <section className="bg-white/80 border-b border-slate-200/60 backdrop-blur-md -mx-8 md:-mx-12 px-8 md:px-12 py-10 mb-12 shadow-sm">
        <div className="w-full max-w-7xl mx-auto">
          {/* Top Breadcrumb & Return */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <Link to="/learning" className="flex items-center gap-1 text-slate-500 hover:text-primary text-sm font-medium transition-colors">
                <ArrowLeft size={16} />
                <span>Back to Learning</span>
              </Link>
              <span className="text-slate-300 font-mono">/</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Cyber Fundamentals Path</span>
                <span className="text-slate-300">&gt;</span>
                <span className="text-primary font-bold">{moduleData.code}</span>
              </div>
            </div>
            
            {/* Badges Cluster */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 text-slate-600 text-xs font-medium">
                <BookOpen size={15} />
                <span>{moduleData.estimatedMinutes} mins</span>
              </div>
              <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 text-primary text-xs font-medium">
                <Zap size={16} />
                <span>+{moduleData.xp} XP</span>
                {completed && <span className="text-[10px] bg-indigo-100 text-primary px-1.5 rounded font-bold">+50 Streak Bonus</span>}
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 text-xs font-medium">
                <span className="text-slate-500">Module {currentIdx + 1} of {curriculumModules.length}</span>
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${completed ? 'bg-emerald-500 w-[100%] shadow-[0_0_8px_#10B981]' : 'bg-primary w-[35%]'}`}></div>
                </div>
                {completed ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle size={12}/> Completed</span>
                ) : (
                  <span className="text-primary font-bold">In Progress</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Module Headline Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs px-2 py-0.5 rounded tracking-widest font-bold uppercase">{moduleData.level}</span>
                <span className="text-slate-400 text-xs font-mono">{moduleData.code}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                {moduleData.title}
              </h1>
            </div>
            {quizScore !== undefined && (
              <div className="flex items-center gap-2">
                 <span className="px-4 py-2 rounded-lg border border-amber-200 text-amber-700 bg-amber-50 flex items-center gap-2 font-bold text-sm shadow-sm">
                   <Trophy size={18} /> Quiz: {quizScore}%
                 </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MAIN OPERATIONAL WORKSPACE (Bento & Timeline Layout) */}
      <main className="w-full mx-auto flex-1 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Sticky Vertical Milestone Timeline Navigation (4 cols) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-8">
            
            {/* Timeline Navigation Card */}
            <div className="bg-white/90 border border-slate-200/70 rounded-2xl p-8 shadow-sm backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-8">
                <div className="flex items-center gap-3">
                  <BookOpen className="text-primary" size={24} />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Execution Sequence</h2>
                </div>
                <span className="text-primary text-xs font-bold bg-indigo-50 px-2.5 py-1 rounded">{moduleData.code}</span>
              </div>
              
              {/* Step Progression Node Track */}
              <div className="relative space-y-8 before:absolute before:left-[17px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
                {moduleData.sections.map((section, index) => {
                  // For visual demonstration, we'll mark the first one as active, others pending/done based on index
                  // Since we don't have per-section tracking, we just style them dynamically
                  const isActive = index === 0 && !completed;
                  const isDone = completed || index < 0; // if we had real tracking
                  
                  return (
                    <div key={`nav-${section.id}`} className="relative flex items-start gap-4 group cursor-pointer">
                      <div className={`relative z-10 w-9 h-9 rounded-lg flex items-center justify-center transition-colors
                        ${isDone ? 'bg-emerald-50 border border-emerald-500 text-emerald-500 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]' : 
                          isActive ? 'bg-indigo-50 border-2 border-primary text-primary shadow-[0_0_15px_-3px_rgba(79,70,229,0.3)]' : 
                          'bg-white border border-slate-300 text-slate-400 group-hover:border-primary/50'}`}>
                        {isDone ? (
                          <CheckCircle size={20} />
                        ) : isActive ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div className={`flex-1 pt-1 ${isActive ? 'bg-slate-50/60 p-3 rounded-lg border border-slate-200/60' : ''}`}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-xs font-bold ${isActive ? 'text-primary' : isDone ? 'text-emerald-600' : 'text-slate-500'}`}>
                            Step {String(index + 1).padStart(2, '0')}
                          </span>
                          {isActive && (
                            <span className="text-[10px] text-primary bg-indigo-100 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Active</span>
                          )}
                          {isDone && (
                            <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle size={12} /> Done
                            </span>
                          )}
                        </div>
                        <h3 className={`text-sm font-medium transition-colors ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-600 group-hover:text-primary'}`}>
                          {section.title}
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Operator Session Status Widget (Aesthetic) */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/60 font-mono text-sm shadow-sm mt-8">
              <div className="flex items-center justify-between text-slate-500 mb-4">
                <span>TARGET INSTANCE</span>
                <span className="text-emerald-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> ONLINE
                </span>
              </div>
              <div className="text-slate-800 font-bold text-base">192.168.104.{Math.floor(Math.random() * 50) + 10} ({moduleData.code.toLowerCase()}-node)</div>
              <div className="text-slate-400 text-xs mt-3 flex justify-between">
                <span>PORT: 2222 (SSH)</span>
                <span>ARCH: ELF 64-bit</span>
              </div>
            </div>
            
          </aside>

          {/* RIGHT COLUMN: Step-by-Step Rich Content Cards (8 cols) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Learning Objectives Header Card */}
            {moduleData.learningObjectives && moduleData.learningObjectives.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm relative overflow-hidden transition-all hover:border-slate-300">
                <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded bg-indigo-50 text-primary border border-indigo-100">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Target Competencies</h3>
                      <p className="text-sm text-slate-500">Validated against NIST SP 800-181 Cyberspace Workforce Framework</p>
                    </div>
                  </div>
                  <span className="bg-indigo-50 text-primary border border-indigo-100 text-xs px-3 py-1 rounded-full font-bold">
                    [{moduleData.learningObjectives.length}/{moduleData.learningObjectives.length} Checked]
                  </span>
                </div>
                <div className="space-y-3">
                  {moduleData.learningObjectives.map((obj, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <CheckCircle className="text-primary mt-0.5 shrink-0" size={18} />
                      <div className="flex-1">
                        <p className="text-sm text-slate-800 font-medium leading-relaxed">{obj}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Content Sections */}
            {moduleData.sections.map((section, index) => (
              <div key={section.id} className="bg-white border border-slate-200 rounded-2xl p-10 md:p-12 shadow-sm space-y-8 relative group hover:border-primary/30 transition-colors">
                <div className="space-y-4 border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-primary text-sm tracking-wider font-bold uppercase">SECTION {String(index + 1).padStart(2, '0')} • CORE MATERIAL</span>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-4">
                    <span className="w-10 h-10 rounded-full bg-indigo-50 text-primary flex items-center justify-center text-lg shrink-0">
                      {index + 1}
                    </span>
                    {section.title}
                  </h2>
                </div>
                
                {/* Prose Markdown Content */}
                <div className="prose prose-slate prose-lg max-w-none 
                  prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary 
                  prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                  prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:border prose-pre:border-slate-800 prose-pre:shadow-xl prose-pre:rounded-xl">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {section.content}
                  </ReactMarkdown>
                </div>
                
                {/* Interactive Callout (Tactical Advisory) */}
                {section.interactiveCallout && (
                  <div className="relative rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 p-8 md:p-10 shadow-sm overflow-hidden mt-10">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="flex items-start gap-6 relative z-10">
                      <div className="p-3 rounded-xl bg-white border border-amber-200 text-amber-500 shadow-sm shrink-0 mt-1">
                        <Zap size={28} />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-amber-600 uppercase tracking-widest bg-white px-3 py-1 rounded border border-amber-200 shadow-sm">
                              TACTICAL ADVISORY
                            </span>
                          </div>
                        </div>
                        <div className="prose prose-amber max-w-none text-sm font-medium leading-relaxed">
                          <ReactMarkdown>{section.interactiveCallout}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FIXED BOTTOM COMMAND RAIL */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-slate-200 shadow-[0_-4px_25px_rgba(0,0,0,0.05)]">
        <div className="w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Previous Section Anchor */}
          <div className="w-full sm:w-auto flex justify-start">
            {prevModule ? (
              <Link to={`/learning/${prevModule.id}`}>
                <Button variant="outline" className="flex items-center gap-2 text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-all font-medium text-sm">
                  <ArrowLeft size={16} /> Previous: {prevModule.code}
                </Button>
              </Link>
            ) : (
              <div className="w-[150px]"></div> /* Placeholder to balance flex */
            )}
          </div>
          
          {/* Center Dynamic Action Group */}
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-center">
            {hasQuiz && (
              <Button
                variant={completed ? 'primary' : 'outline'}
                onClick={() => navigate(`/quiz/${moduleId}`)}
                className="flex items-center gap-2 font-bold tracking-wide shadow-sm"
              >
                <Trophy size={18} className={completed ? "text-white" : "text-amber-500"} />
                {quizScore !== undefined ? `Retake Quiz (${quizScore}%)` : 'Take Quiz (+50 XP)'}
              </Button>
            )}

            {completed ? (
              <Button variant="outline" disabled className="flex items-center gap-2 font-bold tracking-wide bg-slate-50 border-slate-200 text-slate-500">
                <CheckCircle size={18} className="text-emerald-500" />
                Completed
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleMarkComplete}
                className="flex items-center gap-2 font-bold tracking-wide shadow-[0_0_15px_-3px_rgba(79,70,229,0.4)] hover:shadow-[0_0_20px_-3px_rgba(79,70,229,0.5)] transition-shadow"
              >
                <CheckCircle size={18} />
                Mark Complete (+{moduleData.xp} XP)
              </Button>
            )}
          </div>
          
          {/* Forward Module Transition Button */}
          <div className="w-full sm:w-auto flex justify-end">
            {nextModule ? (
              <Link to={`/learning/${nextModule.id}`}>
                <Button variant="outline" className="flex items-center gap-2 text-primary border-primary/20 bg-indigo-50/50 hover:bg-indigo-50 hover:border-primary/40 transition-all font-medium text-sm group">
                  Next: {nextModule.code} <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            ) : (
              <Link to="/learning">
                <Button variant="outline" className="flex items-center gap-2 text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-all font-medium text-sm group">
                  Finish Path <CheckCircle size={16} />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CourseModule;
