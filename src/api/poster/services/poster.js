'use strict';

/**
 * poster service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::poster.poster');
