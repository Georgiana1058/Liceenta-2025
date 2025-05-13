'use strict';

module.exports = {
  async handle(ctx) {
    const { type, data } = ctx.request.body;

    let userObj;

    // Caz 1: sesiune creată (autentificare completă)
    if (type === 'session.created' && data?.user) {
      userObj = {
        id: data.user.id,
        email_addresses: [{ email_address: data.user.primary_email_address }],
        public_metadata: data.user.public_metadata || {},
      };
    }
    // Caz 2: utilizator nou creat, dar fără autentificare completă
    else if (type === 'user.created') {
      userObj = {
        id: data.id,
        email_addresses: [{ email_address: data.email_addresses?.[0]?.email_address }],
        public_metadata: data.public_metadata || {},
      };
    }
    else {
      return ctx.send({ status: 'ignored' });
    }

    const clerkId = userObj.id;
    const email = userObj.email_addresses?.[0]?.email_address;
    const roleName = userObj.public_metadata?.role || 'user';

    if (!clerkId || !email) {
      return ctx.badRequest('Missing clerkUserId or email');
    }

    const roleEntry = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { name: roleName } });

    if (!roleEntry) {
      return ctx.notFound(`Role '${roleName}' not found`);
    }

    let existing = await strapi
      .query('plugin::users-permissions.user')
      .findOne({ where: { clerkUserId: clerkId } });

    if (!existing) {
      existing = await strapi
        .query('plugin::users-permissions.user')
        .findOne({ where: { email } });

      if (existing && !existing.clerkUserId) {
        await strapi.entityService.update(
          'plugin::users-permissions.user',
          existing.id,
          {
            data: { clerkUserId: clerkId },
          }
        );
      }
    }

    let userEntry;
    if (existing) {
      userEntry = await strapi.entityService.update(
        'plugin::users-permissions.user',
        existing.id,
        {
          data: {
            email,
            username: email,
            clerkUserId: clerkId,
            role: roleEntry.id,
          },
        }
      );
    } else {
      userEntry = await strapi.entityService.create(
        'plugin::users-permissions.user',
        {
          data: {
            username: email,
            email,
            clerkUserId: clerkId,
            role: roleEntry.id,
            confirmed: true,
          },
        }
      );
    }

    ctx.send({ user: userEntry });
  },
};
