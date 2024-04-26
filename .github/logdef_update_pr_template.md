> [!CAUTION]
> ***NOTE TO REVIEWERS:***
> **Due to GitHub limitations, you ***must*** close & re-open this PR before merging to ensure pre-merge workflows (e.g. linters) are correctly triggered.**

This PR was auto-generated based on a recent repo commit to either `resources/netlog_defs.ts` or to a file in `ui/raidboss/data`.

It updates the analysis filter criteria to ensure all log line types currently being used by raidboss triggers/timelines are included in the log splitter's analysis filter (unless actively suppressed).

This update was triggered after finding the below uses of certain log line types. Please carefully review these uses to determine if including all log lines of these types in the analysis filter is appropriate.

You can instead change the `include` property to `'filter'` (and add `filters:`), or to `'never'` to suppress the log line type from the filter. Changes can be pushed to the PR branch before merging this PR. 


{{ .changelist }}


> [!CAUTION]
> ***REMINDER:***
> Please don't forget to close & re-open this PR before merging to ensure pre-merge workflows are correctly triggered!
