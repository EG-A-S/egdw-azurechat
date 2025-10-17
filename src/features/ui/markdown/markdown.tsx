import Markdoc from "@markdoc/markdoc";
import React, { FC } from "react";
import { citationConfig, markdownComponents } from "./config";
import { MarkdownProvider } from "./markdown-context";

interface Props {
  content: string;
  onCitationClick: (
    previousState: any,
    formData: FormData
  ) => Promise<JSX.Element>;
}

export const Markdown: FC<Props> = (props) => {
  const ast = Markdoc.parse(props.content);

  const content = Markdoc.transform(ast, {
    ...citationConfig,
  });

  const WithContext = () => (
    <MarkdownProvider onCitationClick={props.onCitationClick}>
      {Markdoc.renderers.react(content, React, {
        components: markdownComponents,
      })}
    </MarkdownProvider>
  );

  return <WithContext />;
};
