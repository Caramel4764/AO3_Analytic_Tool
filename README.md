# AO3_Analytic_Tool
A local web scaper that tracks the history of a given AO3 work through link. It creates snapshots on a daily basis and generates analytics and graphs from the AO3 page data. The user will be able to sort data by date and opt in for emails that sends reports.

## Functionality/skills so far
- Use a server to open a broswer with ao3
- Scrap info from dom and turn them into snapshots
- Store snapshots into IndexedDb
- Basic chart.js graph
- Clean human readable dates
- Display current name, kudos, hits, and calculated engagement

## Todo list/functional
- Calculate analytic
- Add documentation
- Indicate chapter updates
- Allow sorting of update by metrics like date (and maybe daily kudo count, etc)
- Create graph graphics
- Turn into extension
- Email report of tracked work with user specified frequency
- Remove a work
- Import a work's data

## Possible edge cases
- Consider edge case when work name changes
- What if a day was missed. What if multiple days?
- What if a day gets counted twice?
