import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X, Copy, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
}

export function DebugConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true); // Start minimized by default
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logQueueRef = useRef<LogEntry[]>([]);
  const flushTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Capture console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    const addLog = (type: LogEntry['type'], args: any[]) => {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');

      const timestamp = new Date().toLocaleTimeString();
      
      // Add to queue instead of updating state immediately
      logQueueRef.current.push({ timestamp, type, message });
      
      // Schedule a flush
      if (flushTimerRef.current === null) {
        flushTimerRef.current = window.setTimeout(() => {
          setLogs(prev => [...prev, ...logQueueRef.current]);
          logQueueRef.current = [];
          flushTimerRef.current = null;
        }, 0);
      }
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('log', args);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('error', args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', args);
    };

    console.info = (...args) => {
      originalInfo(...args);
      addLog('info', args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
      if (flushTimerRef.current !== null) {
        clearTimeout(flushTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (logsEndRef.current && !isMinimized) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isMinimized]);

  const copyAllLogs = () => {
    const text = logs.map(log => `[${log.timestamp}]\n[${log.type}]\n${log.message}`).join('\n');
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          alert('✅ Logs copied to clipboard!');
        })
        .catch(() => {
          // Fallback to old method
          fallbackCopy(text);
        });
    } else {
      // Fallback for browsers that don't support clipboard API
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
      document.execCommand('copy');
      textarea.remove();
      alert('✅ Logs copied to clipboard!');
    } catch (err) {
      textarea.remove();
      alert('❌ Failed to copy logs. Please copy manually.');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[9999]"
        size="sm"
      >
        Show Debug Console
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-[9999] w-[90vw] md:w-[600px] shadow-2xl border-2 border-primary">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold">Debug Console</h3>
          <span className="text-xs opacity-80">({logs.length} messages)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0 hover:bg-primary-foreground/20"
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyAllLogs}
            className="h-6 w-6 p-0 hover:bg-primary-foreground/20"
            title="Copy all logs"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearLogs}
            className="h-6 w-6 p-0 hover:bg-primary-foreground/20"
            title="Clear logs"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0 hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Logs Container */}
      {!isMinimized && (
        <div className="bg-white max-h-[400px] overflow-y-auto p-2">
          {logs.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No logs yet. Actions will appear here.
            </div>
          ) : (
            <div className="space-y-1 font-mono text-xs">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${getLogColor(log.type)} border border-current/20`}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-bold shrink-0">[{log.timestamp}]</span>
                    <span className="font-bold shrink-0 uppercase">[{log.type}]</span>
                    <pre className="whitespace-pre-wrap break-all flex-1">{log.message}</pre>
                  </div>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
