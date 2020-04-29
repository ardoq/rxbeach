import React from 'react';
import styled from 'styled-components';
import { LiveProvider, LiveError, LivePreview, LiveEditor } from 'react-live';
import { stripIndent } from '../utils';
import { transpile, ScriptTarget, JsxEmit } from 'typescript';

declare global {
  interface Window {
    ts: {
      transpile: (...args: any) => string;
    };
  }
}

type ViewProps = {
  scope?: Record<string, any>;
  code: string;
  disableEditing?: boolean;
  onlySyntaxHighlighting?: boolean;
};

const CodeWrapper = styled.div`
  background-color: #2a2734;
  color: #f8f8f8;
`;

const StyledWrapper = styled.div`
  margin: 14px 0;
`;

const CodePreview = ({
  scope,
  code,
  disableEditing,
  onlySyntaxHighlighting,
}: ViewProps) => {
  return (
    <StyledWrapper>
      <LiveProvider
        scope={scope}
        noInline={true}
        code={stripIndent(code)}
        disabled={disableEditing}
        language="typescript"
        transformCode={snippet => {
          const transpiled = transpile(snippet, {
            noImplicitUseStrict: true,
            target: ScriptTarget.ES2015,
            jsx: JsxEmit.React,
            noEmitOnError: false,
          });
          return transpiled;
        }}
      >
        {!onlySyntaxHighlighting && (
          <>
            <h4>Preview</h4>
            <LivePreview />
            <LiveError />
            <h4>Code</h4>
          </>
        )}
        <CodeWrapper>
          <LiveEditor />
        </CodeWrapper>
      </LiveProvider>
    </StyledWrapper>
  );
};

export default CodePreview;
