

import unittest
from main_solution import es_primo 

class TestEsPrimo(unittest.TestCase):

    def test_numeros_primos(self):
        # Pruebas con números que SÍ son primos
        self.assertTrue(es_primo(2), "El número 2 debe ser considerado primo.")
        self.assertTrue(es_primo(3), "El número 3 debe ser considerado primo.")
        self.assertTrue(es_primo(5), "El número 5 debe ser considerado primo.")
        self.assertTrue(es_primo(17), "El número 17 debe ser considerado primo.")
        self.assertTrue(es_primo(29), "El número 29 debe ser considerado primo.")

    def test_numeros_no_primos(self):
        # Pruebas con números que NO son primos
        self.assertFalse(es_primo(1), "El número 1 NO es primo por definición.")
        self.assertFalse(es_primo(4), "El número 4 (2x2) NO es primo.")
        self.assertFalse(es_primo(9), "El número 9 (3x3) NO es primo.")
        self.assertFalse(es_primo(15), "El número 15 (3x5) NO es primo.")
        self.assertFalse(es_primo(100), "El número 100 NO es primo.")

    def test_casos_limite(self):
        # Pruebas con números negativos y cero (si la implementación lo permite)
        self.assertFalse(es_primo(0), "El cero no es primo.")
        self.assertFalse(es_primo(-5), "Los números negativos no son primos.")

if __name__ == '__main__':
    unittest.main()