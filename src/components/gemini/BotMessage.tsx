
import React from 'react';
import { User, ShieldCheck } from 'lucide-react';

interface BotMessageProps {
  text: string;
}

export const BotMessage: React.FC<BotMessageProps> = ({ text }) => {
  return (
    <div className="flex items-start space-x-2 mb-4 animate-in fade-in slide-in-from-left duration-300">
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
        <ShieldCheck className="w-5 h-5 text-white" />
      </div>
      <div className="max-w-[80%] bg-botMsg rounded-2xl rounded-tl-none p-3 shadow-sm">
        <p className="text-secondary text-sm md:text-base leading-relaxed">{text}</p>
      </div>
    </div>
  );
};

export const UserMessage: React.FC<BotMessageProps> = ({ text }) => {
  return (
    <div className="flex items-start justify-end space-x-2 mb-4 animate-in fade-in slide-in-from-right duration-300">
      <div className="max-w-[80%] bg-primary rounded-2xl rounded-tr-none p-3 shadow-md">
        <p className="text-white text-sm md:text-base leading-relaxed">{text}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
        <User className="w-5 h-5 text-primary" />
      </div>
    </div>
  );
};
