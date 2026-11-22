import { useMemo } from 'react';
import katex from 'katex';

interface MathTexProps {
  tex: string;
  displayMode?: boolean;
  className?: string;
}

export function MathTex({ tex, displayMode = false, className = '' }: MathTexProps) {
  const html = useMemo(() => {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: false,
    });
  }, [tex, displayMode]);

  if (displayMode) {
    return (
      <div
        className={`overflow-x-auto overflow-y-hidden max-w-full ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block align-baseline ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
