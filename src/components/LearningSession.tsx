import { useState, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, Circle, Loader2, MessageCircle, Send, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import mermaid from 'mermaid';
import { LearningStep, DifficultyLevel, ChatMessage } from '../types';
import { generateLearningSteps, askFollowUpQuestion } from '../services/ai';

// Initialize Mermaid once, globally
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral',
    securityLevel: 'loose',
    suppressErrorRendering: true,
  });
}

const Mermaid = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState('');
  const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Only attempt to render if chart is present
    if (!chart) return;

    const render = async () => {
      try {
        // Force a small delay to ensure DOM is ready and modules loaded
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // mermaid.render usually returns object { svg } on newer versions
        const { svg: renderedSvg } = await mermaid.render(idRef.current, chart);
        setSvg(renderedSvg);
      } catch (error) {

        console.error('Mermaid render error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isDynamicImportError = errorMessage.includes('import') || errorMessage.includes('fetch') || errorMessage.includes('loading');

        setSvg(`<div class="text-red-600 bg-red-50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap border border-red-200">
          <strong>${isDynamicImportError ? 'Loading Error' : 'Failed to render diagram'}</strong><br/>
          ${isDynamicImportError 
            ? 'A required file failed to load. This usually happens after a new deployment. Please refresh the page.' 
            : errorMessage}
        </div>`);
      }
    };
    
    if (chart) {
      render();
    }
  }, [chart]);

  return <div className="my-4 flex justify-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 overflow-auto" dangerouslySetInnerHTML={{ __html: svg }} />;
};


const MarkdownComponents = {
    h1: ({node, ...props}: any) => <h1 className="text-3xl font-bold text-gray-900 mb-4" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-2xl font-bold text-gray-900 mb-3 mt-6" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-xl font-bold text-gray-900 mb-2 mt-4" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-bold text-gray-900" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
    li: ({node, ...props}: any) => <li className="pl-1" {...props} />,
    table: ({node, ...props}: any) => <div className="overflow-x-auto my-6 rounded-lg border border-gray-200 shadow-sm"><table className="min-w-full divide-y divide-gray-200" {...props} /></div>,
    thead: ({node, ...props}: any) => <thead className="bg-gray-50" {...props} />,
    th: ({node, ...props}: any) => <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider" {...props} />,
    tbody: ({node, ...props}: any) => <tbody className="bg-white divide-y divide-gray-200" {...props} />,
    tr: ({node, ...props}: any) => <tr className="hover:bg-gray-50 transition-colors" {...props} />,
    td: ({node, ...props}: any) => <td className="px-6 py-4 text-sm text-gray-700 whitespace-normal" {...props} />,
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
};

const ChatMarkdownComponents = {
    p: ({node, ...props}: any) => <p className="mb-2 last:mb-0" {...props} />,
    code: ({node, inline, className, children, ...props}: any) => (
        inline 
        ? <code className="bg-black/10 px-1 py-0.5 rounded font-mono" {...props}>{children}</code>
        : <div className="overflow-x-auto my-2"><code className="block bg-black/10 p-2 rounded font-mono text-xs whitespace-pre-wrap" {...props}>{children}</code></div>
    )
};

export default function LearningSession() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [steps, setSteps] = useState<LearningStep[]>([]);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Reset chat
    setChatHistory([]);
    setChatInput('');
    setIsChatLoading(false);
  }, [currentStepIndex, isSessionComplete]);

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: Date.now()
    };
    
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);
    
    try {
      const currentStep = steps[currentStepIndex];
      const answer = await askFollowUpQuestion(
        topic,
        currentStep.title,
        currentStep.content,
        userMsg.content,
        chatHistory
      );
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answer,
        timestamp: Date.now()
      };
      
      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleStartLearning = async (topicToLearn: string = topic, targetDifficulty: DifficultyLevel = difficulty) => {
    if (!topicToLearn.trim()) return;

    setLoading(true);
    setError('');
    setSteps([]);
    setRelatedTopics([]);
    setCurrentStepIndex(0);
    setIsSessionComplete(false);

    if (targetDifficulty !== difficulty) {
      setDifficulty(targetDifficulty);
    }

    try {
      const response = await generateLearningSteps(topicToLearn, targetDifficulty);
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
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStartLearning()}
                placeholder="e.g., React Hooks, Machine Learning, Spanish..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                disabled={loading}
              />
              
              <div className="flex gap-2 justify-center">
                {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize border ${
                      difficulty === level
                        ? 'bg-primary-100 text-primary-700 border-primary-200 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {difficulty !== 'advanced' && (
              <button
                onClick={() => handleStartLearning(topic, difficulty === 'beginner' ? 'intermediate' : 'advanced')}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <span>Continue to {difficulty === 'beginner' ? 'Intermediate' : 'Advanced'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={resetSession}
              className={`px-8 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors w-full sm:w-auto ${difficulty === 'advanced' ? 'bg-primary-600 text-white hover:bg-primary-700 border-transparent' : 'text-gray-700'}`}
            >
              Start New Topic
            </button>
          </div>
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
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-2xl font-bold">{topic}</h2>
            <span className="px-2 py-1 bg-white/20 rounded text-xs font-medium uppercase tracking-wider text-white/90">
              {difficulty}
            </span>
          </div>
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
              components={MarkdownComponents}
            >
              {currentStep.content}
            </ReactMarkdown>
          </div>

          {/* Chat Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary-600" />
              Have questions about this step?
            </h3>

            <div className="space-y-4 mb-6">
              {chatHistory.length === 0 && (
                <p className="text-gray-500 italic text-sm">
                  Ask me anything about this specific lesson to dive deeper.
                </p>
              )}
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                    }`}
                  >
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={ChatMarkdownComponents}
                    >
                        {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
               {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-none px-5 py-4 border border-gray-200 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                placeholder="Ask a specific question..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors pr-12"
                disabled={isChatLoading}
              />
              <button
                onClick={handleChatSubmit}
                disabled={!chatInput.trim() || isChatLoading}
                className="absolute right-2 top-2 bottom-2 aspect-square bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
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
