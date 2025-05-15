'use strict';

/**
 * company-announcement service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::company-announcement.company-announcement');
