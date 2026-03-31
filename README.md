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
- Calculate analytics like engagement and highest comments per day

## Todo list/functional
- Add documentation
- Allow sorting of update by metrics like date (and maybe daily kudo count, etc)
- Turn into extension
- (Modified) Email report of tracked work with user specified frequency. This is unfeasible without a server or using free tier from 3rd party. I think I will allow exporting html instead so users can save data when they want
- Remove a work
- Import a work's data
- Space stats as much as possible
- Need to figure out date again
- Clean out scraper...it's a mess

## Possible edge cases
- Consider edge case when work name changes
- What if a day gets counted twice?

## Smaller later things to add (so I don't forget)
- Comma in displayed stats
- Fix anonymous author stored wrong (I think spacing and \n?)