"use client";
import React from "react";
import { cn } from "@/ui/lib";
import { CopyButton } from "../copy-button";

const extractTextContent = (node: React.ReactNode): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return node.toString();
  if (!node) return '';
  
  if (Array.isArray(node)) {
    return node.map(extractTextContent).join('');
  }
  
  if (React.isValidElement(node)) {
    return extractTextContent(node.props.children);
  }
  
  return '';
};

interface BlockquoteProps {
  children: React.ReactNode;
  className?: string;
}

export const Blockquote = ({ children, className }: BlockquoteProps) => {
  const textContent = extractTextContent(children);

  return (
    <blockquote className={cn("relative group border-l-4 border-muted-foreground/30 pl-4 my-4 italic text-muted-foreground", className)}>
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <CopyButton
          content={textContent}
          title="Copy quote"
          className="h-6 w-6 p-1"
          iconSize={12}
        />
      </div>
      {children}
    </blockquote>
  );
};

export const blockquote = {
  render: "Blockquote",
};