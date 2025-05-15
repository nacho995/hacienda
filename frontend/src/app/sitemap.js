export default async function sitemap() {
  const baseUrl = 'https://www.hdasancarlosborromeo.com';
  
  // Rutas estáticas principales
  const staticPages = [
    '',
    '/eventos',
    '/habitaciones',
    '/servicios',
    '/contact',
    '/aviso-legal',
    '/privacidad',
    '/terminos',
    '/reservar',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Rutas de páginas de eventos (ejemplo)
  // En un escenario real, estas serían obtenidas de la API o base de datos
  const eventPages = [
    { id: 'bodas', titulo: 'Bodas' },
    { id: 'corporativo', titulo: 'Eventos Corporativos' },
    { id: 'social', titulo: 'Eventos Sociales' },
  ].map(event => ({
    url: `${baseUrl}/eventos/${event.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Combinar todas las rutas
  return [...staticPages, ...eventPages];
}
