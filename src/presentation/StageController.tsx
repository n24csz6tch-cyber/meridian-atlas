import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ENABLE_STAGE_MODE } from './stageConfig';

const LazyStageMode = lazy(() => import('./StageMode'));

function isStageLocation(pathname: string, search: string): boolean {
  if (pathname === '/presentation' || pathname === '/stage') return true;
  return new URLSearchParams(search).get('stage') === '1';
}

export function StageController() {
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState<boolean>(() => {
    if (!ENABLE_STAGE_MODE || typeof window === 'undefined') return false;
    return isStageLocation(window.location.pathname, window.location.search);
  });

  useEffect(() => {
    if (!ENABLE_STAGE_MODE) return;
    if (isStageLocation(location.pathname, location.search)) {
      setActive(true);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!ENABLE_STAGE_MODE) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey && e.shiftKey && key === 'p') || (e.altKey && key === 'p')) {
        e.preventDefault();
        setActive((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleExit = useCallback(() => {
    setActive(false);
    if (document.fullscreenElement && document.exitFullscreen) {
      void document.exitFullscreen().catch(() => {});
    }
    const params = new URLSearchParams(location.search);
    if (location.pathname === '/presentation' || location.pathname === '/stage') {
      navigate('/', { replace: true });
      return;
    }
    if (params.has('stage')) {
      params.delete('stage');
      const nextSearch = params.toString();
      navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ''}${location.hash}`, {
        replace: true,
      });
    }
  }, [location.hash, location.pathname, location.search, navigate]);

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
