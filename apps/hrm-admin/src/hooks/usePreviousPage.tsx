import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const usePreviousPage = () => {
  const location = useLocation();
  const history = useNavigate();

  useEffect(() => {
    const previousPath = sessionStorage.getItem("previousPath");
    const currentPath = location.pathname;

    if (previousPath && previousPath !== currentPath) {
      sessionStorage.setItem("previousPath", currentPath);
    } else {
      sessionStorage.setItem("previousPath", "");
    }
    return () => {};
  }, [location.pathname]);

  const goToPreviousPage = () => {
    const previousPath = sessionStorage.getItem("previousPath");
    history(previousPath || "/");
  };

  return {
    goToPreviousPage,
  };
};
