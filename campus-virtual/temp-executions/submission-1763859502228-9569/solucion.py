def procesar_cadena(cadena):
    invertida = cadena[::-1]
    mayusculas = sum(1 for c in cadena if c.isupper())
    vocales = sum(1 for c in cadena.lower() if c in "aeiou")
    return invertida, mayusculas, vocales
