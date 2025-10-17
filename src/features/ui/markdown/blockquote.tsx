"use client";
import { cn } from "@/ui/lib";
import { CheckIcon, ClipboardIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../button";

interface BlockquoteProps {
  children: React.ReactNode;
  className?: string;
}

export const Blockquote = ({ children, className }: BlockquoteProps) => {
  const [isIconChecked, setIsIconChecked] = useState(false);

  const extractTextContent = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return node.toString();
    if (!node) return '';
    
    if (Array.isArray(node)) {
      return node.map(extractTextContent).join('');
    }
    
    if (typeof node === 'object' && 'props' in node) {
      return extractTextContent(node.props.children);
    }
    
    return '';
  };

  const handleCopy = () => {
    const textContent = extractTextContent(children);
    if (textContent.trim()) {
      navigator.clipboard.writeText(textContent.trim());
      setIsIconChecked(true);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsIconChecked(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isIconChecked]);

  return (
    <blockquote className={cn("relative group border-l-4 border-muted-foreground/30 pl-4 my-4 italic text-muted-foreground", className)}>
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          variant="ghost"
          size="sm"
          title="Copy quote"
          onClick={handleCopy}
          className="h-6 w-6 p-1"
        >
          {isIconChecked ? (
            <CheckIcon size={12} />
          ) : (
            <ClipboardIcon size={12} />
          )}
        </Button>
      </div>
      {children}
    </blockquote>
  );
};

export const blockquote = {
  render: "Blockquote",
};