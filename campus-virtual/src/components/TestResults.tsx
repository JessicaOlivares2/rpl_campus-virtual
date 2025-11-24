import { useState } from "react";

export default function TestResults({ results }) {
  return (
    <div className="flex flex-col gap-4">
      {results.map((r, i) => (
        <TestResult key={i} index={i} result={r} />
      ))}
    </div>
  );
}

function TestResult({ index, result }) {
  const [showDetails, setShowDetails] = useState(false);

  // Consideramos "success" o "passed" como tests que pasaron
  const passed = result.type === "success" || result.passed;

  return (
    <div
      className={`border rounded-lg p-4 ${
        passed ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
      }`}
    >
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg">
          {passed ? "✔️" : "❌"} Test {index + 1}
        </h2>

        <button
          className="text-sm underline"
          onClick={() => setShowDetails((x) => !x)}
        >
          {showDetails ? "Ocultar detalles" : "Ver detalles"}
        </button>
      </div>

      {/* Mensaje corto resumido */}
      <p className="mt-2">{passed ? "✅ Test pasado" : "❌ Test fallido"}</p>

      {/* Detalle completo de pytest */}
      {showDetails && result.raw && (
        <pre className="mt-3 text-sm bg-white border rounded p-3 overflow-x-auto">
          {result.raw}
        </pre>
      )}
    </div>
  );
}
