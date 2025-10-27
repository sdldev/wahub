// Navigation utility for programmatic routing
// This should be initialized with React Router's navigate function

type NavigateFunction = (path: string) => void;

let navigateFunction: NavigateFunction | null = null;

export const setNavigate = (navigate: NavigateFunction) => {
  navigateFunction = navigate;
};

export const navigateTo = (path: string) => {
  if (navigateFunction) {
    navigateFunction(path);
  } else {
    // Fallback to window.location if navigate is not set
    // This should only happen during initial setup
    window.location.href = path;
  }
};
