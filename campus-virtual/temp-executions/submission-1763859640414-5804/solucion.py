def procesar_cadena(cadena):
    invertida = cadena[::-1]
    mayusculas = sum(1 for c in cadena if c.isupper())
    return invertida, mayusculas