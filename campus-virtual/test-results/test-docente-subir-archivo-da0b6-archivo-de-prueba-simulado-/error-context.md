# Page snapshot

```yaml
- generic [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8] [cursor=pointer]
  - alert [ref=e11]
  - generic [ref=e12]:
    - banner [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e15]: rpl.etec
        - navigation [ref=e16]:
          - link "Mis cursos" [ref=e17] [cursor=pointer]:
            - /url: /dashboard
          - button "Cerrar sesión" [ref=e19]
    - main [ref=e20]:
      - generic [ref=e21]:
        - generic [ref=e22]:
          - heading "Crear Ejercicio para \"unidad 2 prueba\"" [level=1] [ref=e23]
          - paragraph [ref=e24]: "Curso: Bases de Datos"
        - generic [ref=e26]:
          - generic [ref=e27]:
            - generic [ref=e28]: Título
            - textbox "Título" [ref=e29]: prueba-archivo-1760021291615
          - generic [ref=e30]:
            - generic [ref=e31]: Descripción (Opcional)
            - textbox "Descripción (Opcional)" [active] [ref=e32]: ejercicio con archivo adjunto
          - generic [ref=e33]:
            - generic [ref=e34]: Tipo de Ejercicio
            - combobox "Tipo de Ejercicio" [ref=e35]:
              - option "Lección" [selected]
              - option "Examen"
              - option "Proyecto"
          - generic [ref=e36]:
            - link "Cancelar" [ref=e37] [cursor=pointer]:
              - /url: /dashboard/3/bases-de-datos
            - button "Crear Ejercicio" [ref=e38]
```