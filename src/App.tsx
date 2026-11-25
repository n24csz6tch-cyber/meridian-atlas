import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { CoursePage } from './pages/CoursePage';
import { FloridaTextbookPage } from './pages/FloridaTextbookPage';
import { GradePlannerPage } from './pages/GradePlannerPage';
import { HomePage } from './pages/HomePage';
import { InstrumentsPage } from './pages/InstrumentsPage';
import { LogarithmsLessonPage } from './pages/LogarithmsLessonPage';
import { MapPage } from './pages/MapPage';
import { NeuralMathPage } from './pages/NeuralMathPage';
import { QuadraticLessonPage } from './pages/QuadraticLessonPage';
import { SolidsLessonPage } from './pages/SolidsLessonPage';
import { StringTheoryPage } from './pages/StringTheoryPage';
import { TopicLessonPage } from './pages/TopicLessonPage';
import { UnitCircleLessonPage } from './pages/UnitCircleLessonPage';
import { ENABLE_STAGE_MODE } from './presentation/stageConfig';
import { StageController } from './presentation/StageController';
import {
  LogsSandbox,
  MapSandbox,
  NeuralSandbox,
  ParabolaSandbox,
  SolidsSandbox,
  TrigSandbox,
  VortexSandbox,
} from './sandbox/SandboxRoutes';

const routerBasename =
  import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, '');

const ROUTE_TITLES: [RegExp, string][] = [
  [/^\/$/, 'AUREA — Living Atlas of Mathematics & String Geometry'],
  [/^\/course\/algebra-1/, 'AUREA — Algebra 1 Guided Hub & 9-Unit Path'],
  [/^\/course\/geometry/, 'AUREA — Geometry Guided Hub & 3D Proofs'],
  [/^\/course\/algebra-2/, 'AUREA — Algebra 2 Guided Hub & Neural Matrices'],
  [/^\/course\/precalculus/, 'AUREA — Precalculus Honors & Harmonic Calculus'],
  [/^\/instruments/, 'AUREA — 26 Interactive 3D & Math Instruments'],
  [/^\/neural/, 'AUREA — Neural Matrices, Dataflow & Harmonic Studio'],
  [/^\/frontier/, 'AUREA — String Theory 3D & Calabi-Yau Frontier'],
  [/^\/textbook/, 'AUREA — Florida B.E.S.T. 28-Chapter Interactive Book'],
  [/^\/map/, 'AUREA — 36-Node Prerequisite Constellation'],
  [/^\/planner/, 'AUREA — Syllabus Grade Planner'],
  [/^\/(presentation|stage)/, 'AUREA — Live Keynote Stage Mode'],
  [/^\/lesson\//, 'AUREA — 7-Layer Visual Math Lesson'],
];

function ScrollAndTitleManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const matched = ROUTE_TITLES.find(([pattern]) => pattern.test(pathname));
    document.title = matched ? matched[1] : 'AUREA — Living Atlas of Mathematics';

    if (hash) {
      const id = hash.slice(1);
      window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter basename={routerBasename} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollAndTitleManager />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/presentation" element={<HomePage />} />
        <Route path="/stage" element={<HomePage />} />
        <Route path="/frontier" element={<StringTheoryPage />} />
        <Route path="/textbook" element={<FloridaTextbookPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/neural" element={<NeuralMathPage />} />
        <Route path="/course/:courseId" element={<CoursePage />} />
        <Route path="/lesson/quadratics" element={<QuadraticLessonPage />} />
        <Route path="/lesson/a1-quadratics" element={<QuadraticLessonPage />} />
        <Route path="/lesson/solids-3d" element={<SolidsLessonPage />} />
        <Route path="/lesson/g-solids" element={<SolidsLessonPage />} />
        <Route path="/lesson/logarithms" element={<LogarithmsLessonPage />} />
        <Route path="/lesson/a2-logarithms" element={<LogarithmsLessonPage />} />
        <Route path="/lesson/unit-circle" element={<UnitCircleLessonPage />} />
        <Route path="/lesson/pc-unit-circle" element={<UnitCircleLessonPage />} />
        <Route path="/lesson/a2-matrices" element={<NeuralMathPage />} />
        <Route path="/lesson/:topicId" element={<TopicLessonPage />} />
        <Route path="/instruments" element={<InstrumentsPage />} />
        <Route path="/planner" element={<GradePlannerPage />} />

        {/* Isolated QA Sandboxes (dev only) */}
        {import.meta.env.DEV && (
          <>
            <Route path="/sandbox/parabola" element={<ParabolaSandbox />} />
            <Route path="/sandbox/solids-3d" element={<SolidsSandbox />} />
            <Route path="/sandbox/map" element={<MapSandbox />} />
            <Route path="/sandbox/neural" element={<NeuralSandbox />} />
            <Route path="/sandbox/vortex" element={<VortexSandbox />} />
            <Route path="/sandbox/trig" element={<TrigSandbox />} />
            <Route path="/sandbox/logs" element={<LogsSandbox />} />
          </>
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {ENABLE_STAGE_MODE && <StageController />}
    </BrowserRouter>
  );
}
