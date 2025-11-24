def procesar_cadena(s):
    # Invertir la cadena
    cadena_invertida = s[::-1]

    # Contar vocales en la cadena invertida
    vocales = "aeiouAEIOU"
    conteo_vocales = sum(1 for c in cadena_invertida if c in vocales)

    return (cadena_invertida, conteo_vocales)
