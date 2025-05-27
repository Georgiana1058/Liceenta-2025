'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::company-announcement.company-announcement', ({ strapi }) => ({

  async create(ctx) {
    const { data } = ctx.request.body;

    try {
      const entity = await strapi.entityService.create('api::company-announcement.company-announcement', {
        data,
        populate: [ 'locations'],
      });

      return { data: entity };
    } catch (error) {
      console.error('❌ Company-announcement create failed:', error);
      ctx.response.status = 400;
      return {
        error: {
          message: 'Create failed',
          details: error.message || error,
        },
      };
    }
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
  
    try {
      await strapi.entityService.update('api::company-announcement.company-announcement', id, {
        data,
      });
  
      const entity = await strapi.entityService.findOne('api::company-announcement.company-announcement', id, {
        populate: ['locations'],
      });
  
      return { data: entity };
    } catch (error) {
      console.error('❌ Company-announcement update failed:', error);
      ctx.response.status = 400;
      return {
        error: {
          message: 'Update failed',
          details: error.message || error,
        },
      };
    }
  }
,  

  async delete(ctx) {
    const { id } = ctx.params;
    try {
      const entity = await strapi.entityService.delete('api::company-announcement.company-announcement', id);
      return { data: entity };
    } catch (error) {
      console.error('❌ Company-announcement delete failed:', error);
      return ctx.internalServerError('Delete failed');
    }
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    if (isNaN(id)) {
      return ctx.badRequest('Invalid ID format');
    }

    try {
      const entity = await strapi.entityService.findOne(
        'api::company-announcement.company-announcement',
        id,
        {
          populate: [ 'locations'],
        }
      );

      if (!entity) {
        return ctx.notFound('Company-announcement not found');
      }

      return { data: entity };
    } catch (error) {
      console.error('❌ Error in findOne company-announcement override:', error);
      return ctx.internalServerError('Something went wrong');
    }
  },

}));
