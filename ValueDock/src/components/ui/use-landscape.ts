import * as React from "react";

export function useIsLandscape() {
  const [isLandscape, setIsLandscape] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const checkOrientation = () => {
      // Check if device is in landscape mode
      const isLandscapeMode = window.matchMedia("(orientation: landscape)").matches;
      setIsLandscape(isLandscapeMode);
    };

    // Initial check
    checkOrientation();

    // Listen for orientation changes
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  return !!isLandscape;
}

export function useRequiresLandscape() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  const [isLandscape, setIsLandscape] = React.useState<boolean>(false);

  React.useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      const landscape = window.matchMedia("(orientation: landscape)").matches;
      setIsMobile(mobile);
      setIsLandscape(landscape);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    window.addEventListener("orientationchange", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("orientationchange", checkDevice);
    };
  }, []);

  return {
    isMobile,
    isLandscape,
    requiresLandscape: isMobile && !isLandscape,
  };
}
