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
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="space-y-4">
        <Link to="/learning" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-2">
          <ArrowLeft size={16} className="mr-1" /> Back to Learning
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase tracking-wider border border-primary/20">
                {moduleData.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                {moduleData.level}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1">
                <BookOpen size={12} /> {moduleData.estimatedMinutes} mins
              </span>
              {completed && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-200 flex items-center gap-1">
                  <CheckCircle size={12} /> Completed
                </span>
              )}
              {quizScore !== undefined && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1">
                  <Trophy size={12} /> Quiz: {quizScore}%
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mt-2">
              {moduleData.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Learning Objectives */}
      {moduleData.learningObjectives && moduleData.learningObjectives.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} />
            Learning Objectives
          </h2>
          <ul className="space-y-2">
            {moduleData.learningObjectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-700">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                <span className="leading-relaxed">{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Course Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-12">
        
        {/* Left Rail: Sticky Timeline Navigation */}
        <div className="lg:col-span-1 hidden lg:block">
          <div className="sticky top-24 bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200/60 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Milestones</h3>
            <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-slate-200">
              {moduleData.sections.map((section, index) => (
                <div key={`nav-${section.id}`} className="relative flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-primary text-primary flex items-center justify-center text-xs font-bold z-10 shrink-0 shadow-sm">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-slate-700 leading-tight">
                    {section.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Rail: Rich Content Cards */}
        <div className="lg:col-span-3 space-y-8">
          {moduleData.sections.map((section, index) => (
            <div key={section.id} className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 scroll-mt-24">
              <div className="flex items-start gap-4 mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-primary font-bold shrink-0 mt-1">
                  {index + 1}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                    {section.title}
                  </h2>
                </div>
              </div>
              
              <div className="prose prose-slate prose-lg max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary 
                prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                prose-pre:bg-[#080B14] prose-pre:text-slate-50 prose-pre:border prose-pre:border-slate-800 prose-pre:shadow-inner">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {section.content}
                </ReactMarkdown>
              </div>
              
              {section.interactiveCallout && (
                <div className="mt-8 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl flex items-start gap-4 shadow-sm">
                  <div className="text-amber-500 mt-0.5 bg-white p-2 rounded-lg shadow-sm border border-amber-100"><Zap size={20} /></div>
                  <div className="prose prose-amber max-w-none text-sm font-medium">
                    <ReactMarkdown>{section.interactiveCallout}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col gap-4 pt-6 border-t border-slate-200 mt-12 mb-8">
        {/* Navigation Row */}
        <div className="flex justify-between items-center">
          <div>
            {prevModule ? (
              <Link to={`/learning/${prevModule.id}`}>
                <Button variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowLeft size={14} /> {prevModule.code}: {prevModule.title}
                </Button>
              </Link>
            ) : (
              <Link to="/learning">
                <Button variant="outline">Back to Learning</Button>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Mark Complete or Completed state */}
            {completed ? (
              <Button variant="outline" disabled style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} className="text-green-500" />
                Completed
              </Button>
            ) : (
              <Button
                variant="primary"
                className="shadow-lg shadow-primary/20"
                onClick={handleMarkComplete}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Zap size={16} />
                Mark as Complete (+{moduleData.xp} XP)
              </Button>
            )}

            {/* Quiz button */}
            {hasQuiz && (
              <Button
                variant={completed ? 'primary' : 'outline'}
                onClick={() => navigate(`/quiz/${moduleId}`)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trophy size={16} />
                {quizScore !== undefined ? `Retake Quiz (${quizScore}%)` : 'Take Quiz'}
              </Button>
            )}

            {/* Next module */}
            {nextModule && (
              <Link to={`/learning/${nextModule.id}`}>
                <Button variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {nextModule.code}: {nextModule.title} <ArrowRight size={14} />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default CourseModule;
