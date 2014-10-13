# gitlab-survivor

## Overview

This dasboard is based on [GithubSurvivor by 99designs](https://github.com/99designs/githubsurvivor) (at least the UI design and the dashboard idea). The difference is that, this app is not an website but an **Android App**.

Why it is for? You do not want to always have a lot of tabs open and observe if there are any merge requests in your project or the build is currently failing. This dashboard will solve your problems! One place to join them all!

Why this approach instead of an app? You can run this on a device like hackberry connected with a monitor, without any server for hosting the backend, only the tools you use itself. The second difference are the backends which this dashboard integrates. For now it uses **Youtrack** and **Gitlab**. Additionally it is possible to integrate as an issues backend **Redmine** with Backlogs extension installed. 

Also there are some differences how the calculations are made, for e.g. Hall of Fame/Shame.

### Hall of Fame

Hall of Fame/Shame is currently calculated by the amount of issues resolved in current sprint. It does not matter if they're bugs, tasks, etc.

### Bugs

Bugs are also calculated by default using **Youtrack**. As a first graph you'll have number of bugs openned/closed in a current sprint only. The second graph will show summarized bugs for last X days set in settings.js file.

### Merge Requests

It shows number of merge requests open. Currently implemented to support **Gitlab** as a backend. Feel free to implement additional backends if you would like.

### Build status

If your build will fail you'll fail the game, so watch out. Build status currently implemented using **Jenkins** as a backend.
