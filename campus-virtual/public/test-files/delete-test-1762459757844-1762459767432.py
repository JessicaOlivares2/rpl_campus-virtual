import unittest

class TestSumaFuncion(unittest.TestCase):

    def test_suma_positivos(self):
        """Verifica que la función sumar funciona con números positivos."""
        # Suponiendo que la función del alumno es 'sumar'
        # Nota: La función 'sumar' DEBE ser definida por el alumno.
        
        # Simulamos la existencia de la función del alumno para el test:
        def sumar(a, b):
            # Esta es la solución correcta que el alumno debería enviar
            return a + b 
            
        self.assertEqual(sumar(5, 3), 8, "Debería ser 8")
        self.assertEqual(sumar(1, 1), 2, "Debería ser 2")

    def test_suma_negativos(self):
        """Verifica la suma con números negativos."""
        def sumar(a, b):
            return a + b 
            
        self.assertEqual(sumar(-1, -1), -2, "Debería ser -2")
        self.assertEqual(sumar(10, -5), 5, "Debería ser 5")

if __name__ == '__main__':
    unittest.main()