def procesar_cadena(s):
    cadena_invertida = s[::-1]
    vocales = "aeiouAEIOU"
    conteo_vocales = sum(1 for c in cadena_invertida if c in vocales)

    return (cadena_invertida, conteo_vocales)
