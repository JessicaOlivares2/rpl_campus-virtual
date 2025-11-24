def procesar_cadena(s):
    cadena_invertida = s[::-1]
    conteo_vocales = 0
    vocales = "aeiouAEIOU"
    for caracter in cadena_invertida:
        if caracter in vocales:
            conteo_vocales += 1
    return (cadena_invertida, conteo_vocales)
