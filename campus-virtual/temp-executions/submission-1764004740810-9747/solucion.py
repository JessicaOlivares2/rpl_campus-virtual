# Código incorrecto para el mismo ejercicio
def procesar_cadena(s):
    # ERROR: No se invierte la cadena
    cadena_invertida = s  

    # ERROR: Conteo de vocales mal implementado (solo minúsculas)
    vocales = "aeiou"
    conteo_vocales = sum(1 for c in cadena_invertida if c in vocales)

    return (cadena_invertida, conteo_vocales)

