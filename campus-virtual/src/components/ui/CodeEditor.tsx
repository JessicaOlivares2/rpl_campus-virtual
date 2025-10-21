'use client';

import React, { useRef } from 'react';
import Editor, { type EditorProps } from '@monaco-editor/react';
import dynamic from 'next/dynamic';

// Interfaz para el componente (puedes añadir más props si las necesitas)
interface CodeEditorProps extends EditorProps {
    initialCode: string;
    onCodeChange: (code: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
    initialCode, 
    onCodeChange, 
    ...props 
}) => {
    const editorRef = useRef(null);
    
    // Función que se ejecuta cuando el código cambia en el editor
    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            onCodeChange(value);
        }
    };

    return (
        <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden h-96">
            <Editor
                height="100%"
                defaultLanguage="python" // Establece el lenguaje por defecto a Python
                defaultValue={initialCode}
                onChange={handleEditorChange}
                options={{
                    minimap: { enabled: false }, // Opcional: desactiva el minimapa
                    lineNumbers: 'on',         // Numeración de líneas
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    // Puedes añadir más opciones de Monaco aquí
                }}
                onMount={(editor) => {
                    editorRef.current = editor;
                }}
                {...props}
            />
        </div>
    );
};

// Carga dinámica para desactivar SSR
// Puedes usar un componente de fallback simple mientras carga
export const DynamicCodeEditor = dynamic(() => Promise.resolve(CodeEditor), {
    ssr: false,
    loading: () => <div className="h-96 w-full flex items-center justify-center bg-gray-50">Cargando editor...</div>
});