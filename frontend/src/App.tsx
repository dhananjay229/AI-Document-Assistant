import { FileText, Sparkles, Binary, ShieldCheck } from 'lucide-react';
import { UploadPanel } from './components/UploadPanel';
import { ChatPanel } from './components/ChatPanel';
import { motion } from 'framer-motion';

function App() {
  return (
    <div className="min-h-screen w-full py-12 px-4 md:px-8">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 mb-4 justify-center md:justify-start"
            >
              <div className="p-2 bg-primary-600 rounded-xl shadow-lg shadow-primary-500/20">
                <FileText className="text-white" size={28} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Document AI
              </h1>
            </motion.div>
            <p className="text-slate-400 max-w-md">
              A production-grade RAG system for semantic search and LLM-powered document analysis.
            </p>
          </div>

          <div className="flex items-center gap-6 justify-center md:justify-start">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                <ShieldCheck size={14} className="text-green-500" /> Guardrails
              </div>
              <p className="text-[10px] text-slate-400">Active</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                <Sparkles size={14} className="text-primary-400" /> LLM
              </div>
              <p className="text-[10px] text-slate-400">OpenAI GPT-3.5</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                <Binary size={14} className="text-violet-400" /> Vector Store
              </div>
              <p className="text-[10px] text-slate-400">Pinecone</p>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <section>
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                Ingestion Pipeline
              </h4>
              <UploadPanel />
            </section>

            <section className="glass-card p-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">System Features</h4>
              <ul className="space-y-2">
                {[
                  'Recursive Text Splitting',
                  'Semantic vector search',
                  'Contextual Hallucination check',
                  'Prompt injection protection',
                  'LangSmith tracing enabled',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-primary-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="lg:col-span-2">
            <section>
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                Intelligent Retrieval & Chat
              </h4>
              <ChatPanel />
            </section>
          </div>
        </main>

        <footer className="mt-20 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-600 font-medium tracking-wider uppercase">
          <p>© 2024 AI Document Assistant</p>
          <div className="flex gap-4">
            <span>Powered by NestJS • React • Pinecone • OpenAI</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
