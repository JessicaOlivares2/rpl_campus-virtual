import unittest

# Función de ejemplo que el estudiante debería implementar
def sumar(a, b):
    # La solución correcta sería: return a + b
    # El servidor espera que esta función exista
    return a + b  # Valor base para que el test unitario tenga un punto de partida

# Clase de prueba que el servidor usará para validar
class TestSumaSimple(unittest.TestCase):
    
    # Test 1: Prueba de números positivos
    def test_suma_positivos(self):
        resultado = sumar(5, 3)
        self.assertEqual(resultado, 8, "Debería sumar dos números positivos correctamente")

    # Test 2: Prueba de suma con cero
    def test_suma_con_cero(self):
        resultado = sumar(10, 0)
        self.assertEqual(resultado, 10, "Debería sumar un número con cero")

    # Test 3: Prueba de números negativos
    def test_suma_negativos(self):
        resultado = sumar(-5, -2)
        self.assertEqual(resultado, -7, "Debería sumar dos números negativos correctamente")

# Si se ejecuta este archivo directamente, correrá las pruebas
if __name__ == '__main__':
    unittest.main()
