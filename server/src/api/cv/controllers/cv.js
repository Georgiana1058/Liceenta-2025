'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::cv.cv', ({ strapi }) => ({

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
  
    try {
      // LOG la intrare
      console.log("📥 Incoming update payload:", data);
  
      // Actualizăm relația companyStatus cu doar ID-urile
      const entity = await strapi.entityService.update('api::cv.cv', id, {
        data: {
          ...data,
          companyStatus: data.companyStatus || [] // <- important: forțăm relația
        },
      });
  
      // Refacem populate după update
      const fullData = await strapi.entityService.findOne('api::cv.cv', id, {
        populate: ['user', 'calendar_events', 'notifications', 'companyStatus'],
      });
  
      return { data: fullData };
    } catch (error) {
      console.error("❌ CV update failed:", error);
      ctx.response.status = 400;
      return {
        error: {
          message: "Update failed",
          details: error.message || error,
        },
      };
    }
  }
,  

  async create(ctx) {
    const { data } = ctx.request.body;
  
    try {
      const entity = await strapi.entityService.create('api::cv.cv', {
        data, // soucerResume is now a string
      });
  
      const populated = await strapi.entityService.findOne('api::cv.cv', entity.id, {
        populate: ['user', 'calendar_events', 'notifications','companyStatus'], // ❌ removed soucerResume
      });
  
      return { data: populated };
    } catch (error) {
      console.error("❌ CV create failed:", error);
      ctx.response.status = 400;
      return {
        error: {
          message: "Create failed",
          details: error.message || error,
        },
      };
    }
  },

  async delete(ctx) {
    const { id } = ctx.params;
    console.log(`🔴 Deleting CV with ID: ${id}`);
    try {
      const entity = await strapi.entityService.delete('api::cv.cv', id);
      return { data: entity };
    } catch (error) {
      console.error("❌ CV delete failed:", error);
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
        'api::cv.cv',
        id,
        {
          populate: ['user', 'calendar_events', 'notifications','companyStatus'], // ❌ removed soucerResume
        }
      );

      if (!entity) {
        return ctx.notFound('CV not found');
      }

      return { data: entity };
    } catch (error) {
      console.error('❌ Error in findOne CV override:', error);
      return ctx.internalServerError('Something went wrong');
    }
  },

}));
