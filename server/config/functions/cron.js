'use strict';

const ms = require('ms');

module.exports = {
  '*/1 * * * *': async () => {
    const now = new Date();
    const intervals = [ // minutele înainte de eveniment
      { label: '24h', ms: 24 * 60 * 60 * 1000 },
      { label: '1h', ms: 60 * 60 * 1000 },
      { label: '30min', ms: 30 * 60 * 1000 },
      { label: '5min', ms: 5 * 60 * 1000 }
    ];

    const events = await strapi.entityService.findMany('api::calendar-event.calendar-event', {
      populate: ['participants'],
    });

    for (const event of events) {
      for (const interval of intervals) {
        const triggerTime = new Date(new Date(event.startTime).getTime() - interval.ms);
        const diff = Math.abs(now - triggerTime);

        if (diff < 60000) { // toleranță de 1 minut
          for (const p of event.participants) {
            await strapi.entityService.create('api::notification.notification', {
              data: {
                title: `🔔 Upcoming Event (${interval.label} left)`,
                message: `Your event "${event.title}" starts soon.`,
                type: 'event_reminder',
                isRead: false,
                participant: p.id,
                calendarEvent: event.id,
              }
            });
          }
        }
      }
    }
  }
};
