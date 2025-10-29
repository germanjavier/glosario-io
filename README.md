# Glosario Técnico Interactivo

Un glosario interactivo de términos técnicos con funcionalidad de búsqueda y reproducción de audio.

## Características

- Búsqueda en tiempo real
- Reproducción de audio de términos
- Interfaz responsiva
- Diseño moderno y accesible
- Paginación para mejor navegación

## Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Node.js (para el servidor de desarrollo)

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/germanjavier/glosario-io.git
   cd glosario-io
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```

4. Abre tu navegador y visita:
   ```
   http://localhost:3000
   ```

## Uso

- **Buscar términos**: Escribe en la barra de búsqueda
- **Reproducir audio**: Haz clic en el ícono de altavoz
- **Navegar**: Usa los botones de paginación

## Estructura del Proyecto

```text
glosario-io/
├── css/
│   └── styles.css       # Estilos CSS
├── js/
│   └── app.js          # Lógica de la aplicación
├── images/             # Imágenes e iconos
│   ├── glosari-logo.png
│   ├── icon-192x192.png
│   └── icon-512x512.png
├── glossary.json       # Términos del glosario
├── index.html          # Página principal
├── offline.html        # Página offline
├── manifest.json       # Configuración PWA
├── package.json        # Dependencias del proyecto
├── package-lock.json   # Versiones de dependencias
├── sw.js              # Service Worker
└── README.md          # Documentación del proyecto
```

## Contribución

¡Las contribuciones son bienvenidas! Si eres desarrollador y quieres ayudar a mejorar este glosario, sigue estos pasos:

1. Haz un fork del repositorio
2. Crea una rama para tu contribución: `git checkout -b mi-contribucion`
3. Añade los términos técnicos que conozcas en el archivo `glossary.json` siguiendo el formato existente:
   ```json
   {
     "term": "Término en inglés",
     "translation": "Traducción al español",
     "pronunciation": "Pronunciación fonética",
     "definition": "Definición detallada",
     "example": "Ejemplo de uso",
     "category": "Categoría del término"
   }
   ```
4. Asegúrate de que los términos estén ordenados alfabéticamente
5. Haz commit de tus cambios: `git commit -am 'Añadido término: [término]'`
6. Haz push a la rama: `git push origin mi-contribucion`
7. Abre un Pull Request

Por favor, asegúrate de que la información sea precisa y esté correctamente formateada.

## Agradecimientos

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más información.

## Autor

**Germán Javier**  
- GitHub: [@germanjavier](https://github.com/germanjavier)  

## Agradecimientos

- Iconos de [Iconify](https://iconify.design/)
- Fuentes del sistema para mejor rendimiento

---

Hecho con ❤️ por Germán Javier
