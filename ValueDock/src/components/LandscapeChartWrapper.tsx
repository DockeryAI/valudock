import React from 'react';
import { LandscapePrompt } from './LandscapePrompt';
import { useRequiresLandscape } from './ui/use-landscape';

interface LandscapeChartWrapperProps {
  children: React.ReactNode;
  message?: string;
  height?: string | number;
}

export function LandscapeChartWrapper({ 
  children, 
  message = "Please rotate your device to landscape mode to view this chart",
  height = "100vh"
}: LandscapeChartWrapperProps) {
  const { requiresLandscape, isMobile, isLandscape } = useRequiresLandscape();

  // If mobile and in portrait mode, show prompt
  if (requiresLandscape) {
    return <LandscapePrompt message={message} />;
  }

  // If mobile and in landscape mode, use full viewport height
  if (isMobile && isLandscape) {
    return (
      <div style={{ height: height }} className="w-full">
        {children}
      </div>
    );
  }

  // Desktop - use default height
  return <>{children}</>;
}
