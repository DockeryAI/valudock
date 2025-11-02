import React from 'react';
import { RotateCw } from 'lucide-react';

interface LandscapePromptProps {
  message?: string;
}

export function LandscapePrompt({ message = "Please rotate your device to landscape mode to view this chart" }: LandscapePromptProps) {
  return (
    <div className="flex items-center justify-center w-full min-h-[400px] py-8">
      <div className="flex flex-col items-center gap-6 text-center max-w-md w-full">
        <div className="bg-primary/10 rounded-full p-8">
          <RotateCw className="h-20 w-20 text-primary" />
        </div>
        <p className="text-base leading-relaxed text-muted-foreground">
          {message}
        </p>
      </div>
    </div>
  );
}
