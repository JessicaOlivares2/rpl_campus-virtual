import unittest

# Nota importante: En un entorno RPL (como el que simula tu campus virtual), 
# la función 'sumar' del alumno se carga automáticamente en el scope de este test.

class TestSumaSimple(unittest.TestCase):
    """
    Casos de prueba para la función sumar(a, b).
    Asegúrate de que la función 'sumar' está definida por el alumno.
    """

    def test_01_suma_de_enteros_positivos(self):
        """Prueba básica: 5 + 3 = 8"""
        # Debe fallar si la implementación del alumno es incorrecta
        self.assertEqual(sumar(5, 3), 8, "Error en suma simple de positivos.")

    def test_02_suma_con_cero(self):
        """Prueba con cero: 10 + 0 = 10"""
        self.assertEqual(sumar(10, 0), 10, "Error al sumar con cero.")
        
    def test_03_suma_de_enteros_negativos(self):
        """Prueba con negativos: -5 + (-3) = -8"""
        self.assertEqual(sumar(-5, -3), -8, "Error en suma de negativos.")

    def test_04_suma_de_positivo_y_negativo(self):
        """Prueba la resta implícita: 7 + (-2) = 5"""
        self.assertEqual(sumar(7, -2), 5, "Error en suma de positivo y negativo.")
        
    def test_05_suma_de_flotantes(self):
        """Prueba con números decimales: 1.5 + 2.5 = 4.0"""
        # Usar assertAlmostEqual para comparar flotantes
        self.assertAlmostEqual(sumar(1.5, 2.5), 4.0, places=5, 
                               "Error en la suma de flotantes.")
        
# Bloque de ejecución estándar de unittest
if __name__ == '__main__':
    # Esto es solo para ejecución local, el motor RPL lo ignora.
    # En un entorno real, si tu código necesita importar la función, 
    # la línea 'from solution import sumar' sería necesaria.
    unittest.main()
