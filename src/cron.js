#!/usr/bin/env node

var crontab = require('node-cron');
var task = crontab.schedule('* * * * * *', () =>  {
  console.log('what?');
});

// console.log(task.task.toString());
// if ( cron ) {
task.start();
