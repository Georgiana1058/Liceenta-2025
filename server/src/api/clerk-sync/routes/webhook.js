module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/clerk-sync/webhook',
      handler: 'webhook.handle',
      config: {
        auth: false,          // ← obligatoriu
      },
    },
  ],
};
