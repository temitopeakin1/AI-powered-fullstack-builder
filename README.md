# bila.dev Fork by TMC

# requirements
- node version 20+
- npm version 9+

# how to start
- npm install
- copy .env.example into .env.local
- npm run dev

# what if I have errors?
- delete node_modules
- delete package-lock.json
- npm install
- npm run dev

# I still have errors
- check project terminal
- check developer tools
- check for missing .env.local variables (compare with .env.example)
- ask team, or go to amazon, buy a color book and check in few days if it works

# how to contribute
- ALWAYS start working from the DEV branch
- each task should respect the next convention: `${taskType}/${taskId}_${description}, where taskType can be 'feature/bug/fix/etc', taskId is the task id from JIRA (e.g. AI-130); e.g. 'feature/AI-130_google_auth'
- after the task is ready, you should open a PR from your branch, to the DEV branch, and ask the team to review it

