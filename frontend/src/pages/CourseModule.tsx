import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { curriculumModules } from '@/data/curriculumData';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const CourseModule: React.FC = () => {
  const { moduleId } = useParams();
  
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
  
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
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

      {/* Course Content Sections */}
      <div className="space-y-8 mt-8">
        {moduleData.sections.map((section) => (
          <div key={section.id} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm transition-shadow hover:shadow-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">
              {section.title}
            </h2>
            <div className="prose prose-slate prose-lg max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary 
              prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:border prose-pre:border-slate-800">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {section.content}
              </ReactMarkdown>
            </div>
            
            {section.interactiveCallout && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start gap-3">
                <div className="prose prose-amber max-w-none text-sm">
                  <ReactMarkdown>{section.interactiveCallout}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-200 mt-12 mb-8">
        <Link to="/learning">
          <Button variant="outline">Back to Learning</Button>
        </Link>
        <Button variant="primary" className="shadow-lg shadow-primary/20">
          Mark as Complete (+{moduleData.xp} XP)
        </Button>
      </div>

    </div>
  );
};

export default CourseModule;
