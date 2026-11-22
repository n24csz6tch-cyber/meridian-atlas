import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CoursePage } from './pages/CoursePage';
import { GradePlannerPage } from './pages/GradePlannerPage';
import { HomePage } from './pages/HomePage';
import { InstrumentsPage } from './pages/InstrumentsPage';
import { LogarithmsLessonPage } from './pages/LogarithmsLessonPage';
import { MapPage } from './pages/MapPage';
import { NeuralMathPage } from './pages/NeuralMathPage';
import { QuadraticLessonPage } from './pages/QuadraticLessonPage';
import { SolidsLessonPage } from './pages/SolidsLessonPage';
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

export default function App() {
  return (
    <BrowserRouter basename={routerBasename} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/presentation" element={<HomePage />} />
        <Route path="/stage" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/neural" element={<NeuralMathPage />} />
        <Route path="/course/:courseId" element={<CoursePage />} />
        <Route path="/lesson/quadratics" element={<QuadraticLessonPage />} />
        <Route path="/lesson/solids-3d" element={<SolidsLessonPage />} />
        <Route path="/lesson/logarithms" element={<LogarithmsLessonPage />} />
        <Route path="/lesson/unit-circle" element={<UnitCircleLessonPage />} />
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
