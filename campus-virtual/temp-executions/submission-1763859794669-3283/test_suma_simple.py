# ⭐ Metadata de Solución Base para String Matching
# SOLUTION: def sumar(a, b): return a + b
# FAILURE_MESSAGE: ¡Fallo de Lógica! La función 'sumar' no devuelve la suma correctamente. Asegúrate de usar la operación de adición (+).

# ⭐ Detección de Errores Comunes (Tests Detallados - Prioridad Alta)

# 1. Error de Estilo: Uso de print
# FAILURE_DETECT_IF_CONTAINS_PRINT: print
# FAILURE_MESSAGE_PRINT: Error de Estilo: No debes usar la función 'print()' en tu solución, la función debe devolver un valor usando 'return'.

# 2. Error de Operación: Multiplicación en lugar de Suma
# FAILURE_DETECT_IF_CONTAINS_RETURN_A_MUL_B: return a * b
# FAILURE_MESSAGE_RETURN_A_MUL_B: Error de Operación: Se detectó que estás multiplicando 'a' y 'b' (*). Debes sumarlos.

# 3. Error de Estructura: Uso Innecesario de Condicionales (Asume que es una operación simple)
# FAILURE_DETECT_IF_CONTAINS_IF: if
# FAILURE_MESSAGE_IF: Advertencia: Esta asignación solo requiere una línea de código. Evita el uso de estructuras condicionales 'if/else' o 'elif'.

# 4. Error de Estructura: Intento de Recursión (No permitida para esta asignación simple)
# FAILURE_DETECT_IF_CONTAINS_SUMAR_RECURSION: sumar(
# FAILURE_MESSAGE_SUMAR_RECURSION: Error de Recursión: No se permite la llamada recursiva a la función 'sumar' para esta asignación. Usa una solución directa.

# 5. Error de Estructura: Función Vacía o Incompleta (Usando 'pass' sin otra lógica)
# FAILURE_DETECT_IF_CONTAINS_PASS: pass
# FAILURE_MESSAGE_PASS: Código Incompleto: El código contiene la palabra clave 'pass'. La función no está implementada.

# ----------------------------------------------------------------------
# Código Python de Referencia (NO EJECUTADO, solo para información del docente)
# ----------------------------------------------------------------------

import unittest

class TestSumaFuncion(unittest.TestCase):

    def test_suma_positivos(self):
        self.assertEqual(sumar(5, 3), 8, "Debería ser 8")
        self.assertEqual(sumar(1, 1), 2, "Debería ser 2")

    def test_suma_negativos(self):
        self.assertEqual(sumar(-1, -1), -2, "Debería ser -2")
        self.assertEqual(sumar(10, -5), 5, "Debería ser 5")

if __name__ == '__main__':
    unittest.main()