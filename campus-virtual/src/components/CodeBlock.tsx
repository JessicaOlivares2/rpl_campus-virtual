import React from 'react';

// Define las propiedades que recibirá el componente desde el MDX.
interface CodeBlockProps {
  children: string; // El contenido del código
  language: string;
  title: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, title, language }) => {
  return (
    <div className="my-6 p-6 rounded-xl bg-gray-800 text-white shadow-lg border border-gray-700 overflow-x-auto">
      <div className="flex justify-between items-center mb-3 border-b border-gray-600 pb-2">
        <span className="font-semibold text-sm text-gray-400">
          {title}
        </span>
        <span className="text-xs text-blue-300 uppercase">
          {language}
        </span>
      </div>
      <pre className="whitespace-pre-wrap break-words text-sm">
        <code>
          {children}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
