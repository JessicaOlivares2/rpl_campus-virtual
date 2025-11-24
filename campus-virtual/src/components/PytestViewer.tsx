'use client';
import { useState } from "react";

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  raw?: string;
}

interface Props {
  results: TestResult[];
}

export default function PytestViewer({ results }: Props) {
  // Filtramos solo los fallidos
  const failedTests = results.filter(r => !r.passed);

  if (failedTests.length === 0) {
    return (
      <p className="text-green-700 font-semibold p-4 bg-green-50 border border-green-200 rounded">
        ✅ Todos los tests pasaron
      </p>
    );
  }

  return (
    <div className="p-4 bg-red-50 border border-red-400 rounded shadow-md">
      <h2 className="text-red-700 font-bold text-lg mb-4">
        ❌ Tests fallidos ({failedTests.length})
      </h2>

      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
        {failedTests.map((test, idx) => (
          <TestCard key={idx} test={test} index={idx} />
        ))}
      </div>
    </div>
  );
}

function TestCard({ test, index }: { test: TestResult; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-red-400 bg-red-100 rounded p-3">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-red-700">
          ❌ Test {index + 1}: {test.name}
        </span>
        {test.raw && (
          <button
            onClick={() => setOpen(!open)}
            className="text-sm text-blue-600 underline"
          >
            {open ? "Ocultar detalles" : "Ver detalles"}
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-red-800 whitespace-pre-wrap">
        {test.message}
      </p>
      {open && test.raw && (
        <pre className="mt-2 p-2 bg-black text-white text-xs rounded overflow-x-auto max-h-48">
          {test.raw}
        </pre>
      )}
    </div>
  );
}
