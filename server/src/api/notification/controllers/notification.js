// src/api/notification/controllers/notification.js
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::notification.notification', ({ strapi }) => ({

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    try {
      const entity = await strapi.entityService.update('api::notification.notification', id, {
        data,
        populate: ['participant', 'organizer', 'cv', 'user_resume'],
      });

      return { data: entity };
    } catch (error) {
      console.error("❌ Notification update failed:", error);
      ctx.response.status = 400;
      return {
        error: {
          message: "Update failed",
          details: error.message || error,
        },
      };
    }
  },

  async delete(ctx) {
    const { id } = ctx.params;
    console.log(`🔴 Deleting notification with ID: ${id}`);
    try {
      const entity = await strapi.entityService.delete('api::notification.notification', id);
      return { data: entity };
    } catch (error) {
      console.error("❌ Notification delete failed:", error);
      return ctx.internalServerError("Delete failed");
    }
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    if (isNaN(id)) {
      return ctx.badRequest('Invalid ID format');
    }

    try {
      const entity = await strapi.entityService.findOne(
        'api::notification.notification',
        id,
        {
          populate: ['participant', 'organizer', 'cv', 'user_resume'],
        }
      );

      if (!entity) {
        return ctx.notFound('Notification not found');
      }

      return { data: entity };
    } catch (error) {
      console.error('❌ Error in findOne notification override:', error);
      return ctx.internalServerError('Something went wrong');
    }
  },

}));
