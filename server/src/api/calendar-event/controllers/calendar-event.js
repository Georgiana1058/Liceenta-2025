// src/api/calendar-event/controllers/calendar-event.js
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::calendar-event.calendar-event', ({ strapi }) => ({
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    try {
      const entity = await strapi.entityService.update('api::calendar-event.calendar-event', id, {
        data,
        populate: ['cv', 'participants', 'organizer'],
      });

      return { data: entity };
    } catch (error) {
      console.error("❌ Update failed:", error);
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
    console.log(`🔴 Deleting event with ID: ${id}`);
    const entity = await strapi.entityService.delete('api::calendar-event.calendar-event', id);
    return { data: entity };
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    // Verificare: id valid numeric
    if (isNaN(id)) {
      return ctx.badRequest('Invalid ID format');
    }

    try {
      const entity = await strapi.entityService.findOne(
        'api::calendar-event.calendar-event',
        id,
        {
          populate: ['participants', 'cv', 'organizer'], // 🔁 populate relațiile aici
        }
      );

      if (!entity) {
        return ctx.notFound('Calendar event not found');
      }

      return { data: entity };
    } catch (error) {
      console.error('❌ Error in findOne override:', error);
      return ctx.internalServerError('Something went wrong');
    }
  },

}));
