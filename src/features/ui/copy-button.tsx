"use client";
import { CheckIcon, ClipboardIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";

interface CopyButtonProps {
  content: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  title?: string;
  iconSize?: number;
}

export const CopyButton = ({ 
  content, 
  className = "h-6 w-6 p-1", 
  size = "sm",
  title = "Copy to clipboard",
  iconSize = 12
}: CopyButtonProps) => {
  const [isIconChecked, setIsIconChecked] = useState(false);

  const handleCopy = async () => {
    if (!content.trim()) return;
    
    try {
      await navigator.clipboard.writeText(content.trim());
      setIsIconChecked(true);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      try {
        const textArea = document.createElement('textarea');
        textArea.value = content.trim();
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setIsIconChecked(true);
      } catch (fallbackError) {
        console.error('Fallback copy method also failed:', fallbackError);
      }
    }
  };

  useEffect(() => {
    if (!isIconChecked) return;
    
    const timeout = setTimeout(() => {
      setIsIconChecked(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isIconChecked]);

  return (
    <Button
      variant="ghost"
      size={size}
      title={title}
      aria-label={title}
      onClick={handleCopy}
      className={className}
    >
      {isIconChecked ? (
        <CheckIcon size={iconSize} />
      ) : (
        <ClipboardIcon size={iconSize} />
      )}
    </Button>
  );
};