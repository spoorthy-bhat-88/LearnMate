import { useState, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import mermaid from 'mermaid';
import { LearningStep } from '../types';
import { generateLearningSteps } from '../services/ai';

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  suppressErrorRendering: true,
});

const Mermaid = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState('');
  const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const render = async () => {
      try {
        const { svg: renderedSvg } = await mermaid.render(idRef.current, chart);
        setSvg(renderedSvg);
      } catch (error) {
        console.error('Mermaid render error:', error);
        setSvg(`<div class="text-red-600 bg-red-50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap border border-red-200">
          <strong>Failed to render diagram:</strong><br/>
          ${error instanceof Error ? error.message : String(error)}
        </div>`);
      }
    };
    
    if (chart) {
      render();
    }
  }, [chart]);

  return <div className="my-4 flex justify-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 overflow-auto" dangerouslySetInnerHTML={{ __html: svg }} />;
};

export default function LearningSession() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [steps, setSteps] = useState<LearningStep[]>([]);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStepIndex, isSessionComplete]);

  const handleStartLearning = async (topicToLearn: string = topic) => {
    if (!topicToLearn.trim()) return;

    setLoading(true);
    setError('');
    setSteps([]);
    setRelatedTopics([]);
    setCurrentStepIndex(0);
    setIsSessionComplete(false);

    try {
      const response = await generateLearningSteps(topicToLearn);
      const learningSteps: LearningStep[] = response.steps.map((step, index) => ({
        id: `step-${index}`,
        title: step.title,
        content: step.content,
        completed: false,
      }));
      setSteps(learningSteps);
      setRelatedTopics(response.relatedTopics || []);
      
      // Check if API key is configured
      const hasApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!hasApiKey) {
        setError('Demo mode: Using pre-generated content. Add your free Gemini API key for personalized learning!');
      }
    } catch (err) {
      // This should not happen now since we fall back to demo mode
      setError(err instanceof Error ? err.message : 'Failed to generate learning steps');
    } finally {
      setLoading(false);
    }
  };

  const goToNextStep = () => {
    // Mark current step as complete when navigating to next step
    setSteps(prev => 
      prev.map((step, idx) => 
        idx === currentStepIndex ? { ...step, completed: true } : step
      )
    );

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsSessionComplete(true);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const resetSession = () => {
    setTopic('');
    setSteps([]);
    setRelatedTopics([]);
    setCurrentStepIndex(0);
    setIsSessionComplete(false);
    setError('');
  };

  const handleRelatedTopicClick = (newTopic: string) => {
    setTopic(newTopic);
    handleStartLearning(newTopic);
  };

  if (steps.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              What would you like to learn?
            </h2>
            <p className="text-gray-600">
              Enter any topic and I'll create a learning path for you
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStartLearning()}
              placeholder="e.g., React Hooks, Machine Learning, Spanish..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
              disabled={loading}
            />

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={() => handleStartLearning()}
              disabled={loading || !topic.trim()}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating learning path...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Start Learning</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSessionComplete) {
    return (
      <div className="w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Congratulations!
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            You've completed the learning path for <span className="font-semibold text-gray-900">"{topic}"</span>.
          </p>

          <div className="bg-gray-50 rounded-xl p-8 mb-8 text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              Keep Learning: Related Topics
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedTopics.length > 0 ? (
                relatedTopics.map((relatedTopic) => (
                  <button
                    key={relatedTopic}
                    onClick={() => handleRelatedTopicClick(relatedTopic)}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all text-left group"
                  >
                    <span className="font-medium text-gray-900 group-hover:text-primary-700 block">
                      {relatedTopic}
                    </span>
                    <span className="text-sm text-gray-500 mt-1 block">
                      Click to start a new lesson
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-gray-500 italic col-span-2">No related topics suggestions available at this time.</p>
              )}
            </div>
          </div>

          <button
            onClick={resetSession}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Start New Topic
          </button>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const progress = Math.round((steps.filter(s => s.completed).length / steps.length) * 100);

  return (
    <div className="w-full mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">{topic}</h2>
          <div className="flex items-center justify-between">
            <p className="text-primary-100">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
            <button
              onClick={resetSession}
              className="text-sm bg-white/20 hover:bg-white/30 px-4 py-1 rounded transition-colors"
            >
              New Topic
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-primary-100 mt-1">{progress}% Complete</p>
        </div>

        {/* Step Navigation */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(index)}
                title={step.title}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all border ${
                  index === currentStepIndex
                    ? 'bg-primary-100 text-primary-700 font-semibold border-primary-200'
                    : step.completed
                    ? 'bg-white text-green-700 border-green-200 hover:border-green-300'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
                <span className="text-sm">{index + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {currentStep.title}
          </h3>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-gray-900 mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-gray-900 mb-3 mt-6" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-bold text-gray-900 mb-2 mt-4" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                table: ({node, ...props}) => <div className="overflow-x-auto my-6 rounded-lg border border-gray-200 shadow-sm"><table className="min-w-full divide-y divide-gray-200" {...props} /></div>,
                thead: ({node, ...props}) => <thead className="bg-gray-50" {...props} />,
                th: ({node, ...props}) => <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider" {...props} />,
                tbody: ({node, ...props}) => <tbody className="bg-white divide-y divide-gray-200" {...props} />,
                tr: ({node, ...props}) => <tr className="hover:bg-gray-50 transition-colors" {...props} />,
                td: ({node, ...props}) => <td className="px-6 py-4 text-sm text-gray-700 whitespace-normal" {...props} />,
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isMermaid = match && match[1] === 'mermaid';
                  
                  if (!inline && isMermaid) {
                    return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                  }

                  return !inline && match ? (
                    <div className="bg-slate-900 text-slate-50 rounded-lg p-5 my-4 overflow-x-auto border border-slate-700 shadow-sm relative">
                       {/* Optional: Add a subtle header or language label if desired, but for now just better styling */}
                      <code className={`${className} font-mono text-sm leading-relaxed block`} {...props}>
                        {children}
                      </code>
                    </div>
                  ) : (
                    <code className={`${className} bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono font-medium border border-slate-200`} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {currentStep.content}
            </ReactMarkdown>
          </div>

          <div className="mt-8 flex justify-end">
            <div className="flex space-x-2">
              <button
                onClick={goToPreviousStep}
                disabled={currentStepIndex === 0}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={goToNextStep}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
