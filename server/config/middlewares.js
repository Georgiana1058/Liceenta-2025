module.exports = [
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      jsonLimit: '10mb',
      formLimit: '10mb',
      enableRawBody: true,    // ← asigură-te că e aici
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
