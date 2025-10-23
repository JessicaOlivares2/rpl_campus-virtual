import unittest

# 🚨 Nota: Esta línea es crucial en la mayoría de los motores de prueba 
# para importar la función del archivo enviado por el alumno. 
# En tu sistema, la función 'sumar' se inyecta en el scope del test.

class TestSumaSimple(unittest.TestCase):
    """
    Casos de prueba para la función sumar(a, b).
    """

    def test_01_suma_de_enteros_positivos(self):
        """Prueba básica: 5 + 3 = 8"""
        # Se asume que la función 'sumar' está definida en el código del alumno
        self.assertEqual(sumar(5, 3), 8)

    def test_02_suma_con_cero(self):
        """Prueba con cero: 10 + 0 = 10"""
        self.assertEqual(sumar(10, 0), 10)
        
    def test_03_suma_de_negativos(self):
        """Prueba con negativos: -5 + (-3) = -8"""
        self.assertEqual(sumar(-5, -3), -8)

    def test_04_suma_de_flotantes(self):
        """Prueba con números decimales: 1.5 + 2.5 = 4.0"""
        self.assertAlmostEqual(sumar(1.5, 2.5), 4.0, places=5)
        
# Bloque de ejecución estándar de unittest
if __name__ == '__main__':
    unittest.main()
