# AO3_Analytic_Tool
A local web scaper that tracks the history of a given AO3 work through link. It creates snapshots on a daily basis and generates analytics and graphs from the AO3 page data. The user will be able to sort data by date and opt in for emails that sends reports.

## Functionality/skills so far
- Use a server to open a broswer with ao3
- Scrap info from dom and turn them into snapshots
- Store snapshots into IndexedDb
- Basic chart.js graph
- Clean human readable dates
- Display current name, kudos, hits, and calculated engagement
- Display works in graph format that can switch
- If a day or days are missed, the graph uses gray dashed line to show missing data
- Chapters are indicated by vertical line


## Todo list/functional
- Calculate analytic
- Add documentation
- Allow sorting of update by metrics like date (and maybe daily kudo count, etc)
- Turn into extension
- Email report of tracked work with user specified frequency
- Remove a work
- Import a work's data

## Possible edge cases
- Consider edge case when work name changes
- What if a day gets counted twice?
