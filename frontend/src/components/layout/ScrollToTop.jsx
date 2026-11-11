import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets window scroll position to the top whenever the route changes.
 * Renders nothing — side-effect only.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
