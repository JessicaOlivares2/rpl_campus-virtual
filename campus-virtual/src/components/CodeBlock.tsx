import React from 'react';

// Define las propiedades que recibirá el componente desde el MDX.
interface CodeBlockProps {
  children: string; // El contenido del código
  language: string; 
  title: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, title, language }) => {
  // NOTA: Para producción, se recomienda usar una librería de sintaxis como react-syntax-highlighter.
  // Aquí usamos estilos Tailwind simples para mantenerlo funcional.
  return (
    <div className="my-6 p-4 rounded-lg bg-gray-900 text-white shadow-xl">
      <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-1">
        <span className="font-semibold text-sm text-gray-400">
          {title} 
        </span>
        <span className="text-xs text-blue-400 uppercase">
          {language}
        </span>
      </div>
      <pre className="text-sm overflow-x-auto">
        <code className={`language-${language}`}>
          {children}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
