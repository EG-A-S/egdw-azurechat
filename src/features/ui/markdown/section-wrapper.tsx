"use client";
import { cn } from "@/ui/lib";
import { CheckIcon, ClipboardIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../button";

interface SectionWrapperProps {
  children: React.ReactNode;
  sectionContent: string;
  className?: string;
}

export const SectionWrapper = ({ children, sectionContent, className }: SectionWrapperProps) => {
  const [isIconChecked, setIsIconChecked] = useState(false);

  const handleCopy = () => {
    if (sectionContent.trim()) {
      navigator.clipboard.writeText(sectionContent.trim());
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
    <div className={cn("relative group border-l-2 border-transparent hover:border-l-muted-foreground/30 pl-4 my-4", className)}>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          variant="ghost"
          size="sm"
          title="Copy section"
          onClick={handleCopy}
          className="h-8 w-8 p-1"
        >
          {isIconChecked ? (
            <CheckIcon size={14} />
          ) : (
            <ClipboardIcon size={14} />
          )}
        </Button>
      </div>
      {children}
    </div>
  );
};