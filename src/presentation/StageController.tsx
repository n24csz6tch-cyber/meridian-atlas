import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ENABLE_STAGE_MODE } from './stageConfig';

const LazyStageMode = lazy(() => import('./StageMode'));

export function StageController() {
  const location = useLocation();
  const [active, setActive] = useState<boolean>(() => {
    if (!ENABLE_STAGE_MODE || typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('stage') === '1';
  });

  useEffect(() => {
    if (!ENABLE_STAGE_MODE) return;
    const params = new URLSearchParams(location.search);
    if (params.get('stage') === '1') {
      setActive(true);
    }
  }, [location.search]);

  useEffect(() => {
    if (!ENABLE_STAGE_MODE) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setActive((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleExit = useCallback(() => {
    setActive(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('stage')) {
        url.searchParams.delete('stage');
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
      }
    }
  }, []);

  if (!ENABLE_STAGE_MODE || !active) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 bg-[#07090D] flex items-center justify-center font-mono-data text-xs text-[#9CA6B8]">
          Initializing Meridian Stage Mode…
        </div>
      }
    >
      <LazyStageMode onExit={handleExit} />
    </Suspense>
  );
}
