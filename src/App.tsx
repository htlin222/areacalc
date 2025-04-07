import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Play, Pause, Upload, MoreVertical } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const sampleMarkdown = `# Cast
* John Smith as Hero
* Jane Doe as Heroine
* Bob Wilson as Villain

# Crew
* Director: James Cameron
* Producer: Steven Spielberg
* Writer: Christopher Nolan

# Special Thanks
* Coffee Machine
* Pizza Delivery
* Stack Overflow`;

const CreditsRoll = () => {
  const [markdown, setMarkdown] = useState(sampleMarkdown);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [startOffset, setStartOffset] = useState(133); // Default 100% (just below window)
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(16); // Base font size in px
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(parseInt(e.target.value));
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current && contentRef.current.offsetHeight) {
      setContentHeight(contentRef.current.offsetHeight);
    }
    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [markdown]);

  const { toast } = useToast();
  
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.md')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a .md file',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (typeof e.target?.result === 'string') {
        setMarkdown(e.target.result);
        toast({
          title: 'File Uploaded',
          description: `Successfully loaded ${file.name}`,
        });
      } else {
        toast({
          title: 'Upload Failed',
          description: 'Could not read file content',
          variant: 'destructive',
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: 'Upload Failed',
        description: 'Could not read file',
        variant: 'destructive',
      });
    };
    reader.readAsText(file);
  };

  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const [currentPosition, setCurrentPosition] = useState(0);

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    
    const elapsed = timestamp - startTimeRef.current;
    const progress = (elapsed / 1000) * speed * 100; // pixels per second
    
    if (containerRef.current) {
      const newPosition = currentPosition - progress;
      containerRef.current.style.transform = `translateY(${newPosition}px)`;
      setCurrentPosition(newPosition);
      
      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(animate);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speed]);

  const togglePlay = () => {
    if (!isPlaying) {
      startTimeRef.current = performance.now() - (currentPosition / (speed * 100)) * 1000;
    }
    setIsPlaying(!isPlaying);
  };


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReload = () => {
    setIsPlaying(false);
    setCurrentPosition(0);
    if (containerRef.current) {
      containerRef.current.style.transform = `translateY(0px)`;
    }
  };

  const handleSpeedChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    if (containerRef.current) {
      const duration = (contentHeight + windowHeight) / (100 * newSpeed);
      containerRef.current.style.animationDuration = `${duration}s`;
    }
  };

  const handleOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOffset = parseInt(e.target.value);
    setStartOffset(newOffset);
  };

  const handleAnimationEnd = () => {
    setIsPlaying(false);
  };

  useEffect(() => {
    if (containerRef.current) {
      const duration = (contentHeight + windowHeight) / (100 * speed);
      containerRef.current.style.animationDuration = `${duration}s`;
    }
  }, [contentHeight, windowHeight, speed, fontSize]);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.offsetHeight);
    }
  }, [fontSize]);

  const renderMarkdown = (text: string): JSX.Element[] => {
    const baseSize = fontSize;
    return text.split('\n').map((line: string, index: number) => {
      // Handle headers
      if (line.startsWith('### ')) {
        return (
          <h3
            key={index}
            style={{ fontSize: baseSize * 1.25 }}
            className="font-bold mt-8 mb-4 text-white"
          >
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        return (
          <h2
            key={index}
            style={{ fontSize: baseSize * 1.5 }}
            className="font-bold mt-10 mb-5 text-white"
          >
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        return (
          <h1
            key={index}
            style={{ fontSize: baseSize * 2 }}
            className="font-bold mt-12 mb-6 text-white"
          >
            {line.slice(2)}
          </h1>
        );
      }
      
      // Handle list items
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const content = line.slice(2);
        const formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <p
            key={index}
            style={{ fontSize: baseSize }}
            className="my-6 text-white"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        );
      }
      
      // Handle regular text with bold formatting
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <p
          key={index}
          style={{ fontSize: baseSize }}
          className="text-white"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Control buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <button
          onClick={togglePlay}
          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
        >
          {isPlaying ? <Pause className="text-white" size={24} /> : <Play className="text-white" size={24} />}
        </button>
        <button
          onClick={handleReload}
          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
          title="Reload"
          aria-label="Reload credits"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
          title="Settings"
          aria-label="Open settings"
          aria-labelledby="settings-button-label"
        >
          <MoreVertical className="text-white" size={24} />
          <span id="settings-button-label" className="sr-only">Settings</span>
        </button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <label className="flex flex-col gap-2">
                <span>Starting Position (Y-offset)</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={startOffset}
                    onChange={handleOffsetChange}
                    className="w-full"
                    aria-label="Starting position offset"
                  />
                  <span className="min-w-[4ch]">{startOffset}%</span>
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span>Scroll Speed</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={speed}
                    onChange={handleSpeedChange}
                    className="w-full"
                  />
                  <span className="min-w-[3ch]">{speed}x</span>
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span>Font Size</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="12"
                    max="32"
                    step="1"
                    value={fontSize}
                    onChange={handleFontSizeChange}
                    className="w-full"
                  />
                  <span className="min-w-[3ch]">{fontSize}px</span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors w-full">
                <Upload size={20} />
                <span>Upload Markdown File</span>
                <input
                  type="file"
                  accept=".md"
                  onChange={handleFileUpload}
                  className="hidden"
                  aria-label="Upload markdown file"
                />
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credits container */}
      <div className="flex-1 overflow-hidden relative">
        <div
          ref={containerRef}
          className="absolute w-full text-center px-4"
          style={{
            animation: isPlaying ? `scroll-up ${20 / speed}s linear forwards` : 'none',
            transform: isPlaying ? 'none' : `translateY(${startOffset}%)`
          }}
          onAnimationEnd={handleAnimationEnd}
        >
          <div ref={contentRef}>
            {renderMarkdown(markdown)}
          </div>
          <div className="h-24" /> {/* Small padding at bottom */}
        </div>
      </div>

      <style>{`
        @keyframes scroll-up {
          0% {
            transform: translateY(${startOffset}%);
          }
          100% {
            transform: translateY(-${contentHeight + 96}px);
          }
        }
      `}</style>
    </div>
  );
};

export default CreditsRoll;
