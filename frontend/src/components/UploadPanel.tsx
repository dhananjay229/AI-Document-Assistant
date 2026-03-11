import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

export const UploadPanel: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.type === 'text/plain')) {
      setFile(droppedFile);
      setStatus('idle');
    } else {
      setErrorMessage('Only PDF and TXT files are supported.');
      setStatus('error');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setStatus('uploading');
    try {
      await api.uploadDocument(file);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.response?.data?.message || 'Failed to upload document.');
    }
  };

  return (
    <div className="glass-card flex flex-col items-center justify-center min-h-[300px] border-dashed border-2 border-white/20 hover:border-primary-500/50 transition-colors">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center text-green-400"
          >
            <CheckCircle2 size={64} className="mb-4" />
            <p className="text-xl font-semibold">Ingestion Complete!</p>
            <p className="text-sm text-slate-400">Your document is ready for questioning.</p>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center"
          >
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`w-full flex flex-col items-center justify-center p-12 transition-all duration-300 rounded-xl ${
                isDragging ? 'bg-primary-500/10 scale-105' : 'bg-transparent'
              }`}
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full" />
                {file ? (
                  <FileText className="relative text-primary-400 animate-bounce" size={48} />
                ) : (
                  <Upload className="relative text-primary-400" size={48} />
                )}
              </div>

              <h3 className="text-lg font-medium mb-2">
                {file ? file.name : 'Drop your PDF here'}
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                or click to browse from your files
              </p>

              <input
                type="file"
                className="hidden"
                id="file-upload"
                accept=".pdf,.txt"
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full text-sm font-medium transition-colors mb-8"
              >
                Browse Files
              </label>
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-400 mb-6 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">
                <AlertCircle size={18} />
                <span className="text-sm">{errorMessage}</span>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || status === 'uploading'}
              className="btn-primary w-full max-w-xs flex items-center justify-center gap-2"
            >
              {status === 'uploading' ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Processing...
                </>
              ) : (
                'Start Ingestion'
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
