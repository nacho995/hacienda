# Hacienda San Carlos Borromeo - Sitio Web

Este es el sitio web oficial de Hacienda San Carlos Borromeo, un hermoso espacio para eventos y bodas en San Miguel de Allende.

## Tecnologías Utilizadas

- Next.js 14
- React 18
- Tailwind CSS
- React Icons

## Requisitos Previos

- Node.js 18.17 o superior
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/hacienda-san-carlos.git
cd hacienda-san-carlos
```

2. Instalar dependencias:
```bash
npm install
# o
yarn install
```

3. Crear un archivo `.env.local` en la raíz del proyecto y agregar las variables de entorno necesarias:
```env
NEXT_PUBLIC_API_URL=tu_url_api
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
```

5. Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── globals.css
│   └── components/
│       ├── layout/
│       │   ├── Navbar.jsx
│       │   └── Footer.jsx
│       └── sections/
│           ├── HeroSection.jsx
│           ├── IntroSection.jsx
│           ├── DecorativeSection.jsx
│           ├── EventsSection.jsx
│           ├── GallerySection.jsx
│           └── LodgingSection.jsx
├── public/
│   └── images/
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Características

- Diseño responsivo
- Animaciones suaves
- Galería de imágenes con lightbox
- Formulario de contacto
- Sección de testimonios
- Información sobre eventos y habitaciones
- Integración con redes sociales

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run start`: Inicia el servidor de producción
- `npm run lint`: Ejecuta el linter

## Contribución

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

Tu Nombre - [@tutwitter](https://twitter.com/tutwitter) - email@ejemplo.com

Link del Proyecto: [https://github.com/tu-usuario/hacienda-san-carlos](https://github.com/tu-usuario/hacienda-san-carlos) 