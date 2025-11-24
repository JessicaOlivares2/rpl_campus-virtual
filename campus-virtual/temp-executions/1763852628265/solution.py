def procesar_cadena(s):
    invertida = s[::-1]
    vocales = sum(1 for c in invertida if c.lower() in "aeiou")
    return invertida, vocales
