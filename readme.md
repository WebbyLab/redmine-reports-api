# Redmine-reports
Redmine time logging application built with [Node.js](http://nodejs.org/)
##Installation
git clone git://github.com/webbylab/redmine-reports.git !!!!!!!!!!!!!!!!!

npm install

cp etc/config.json.sample etc/config.json
after copy set next field:

    1. host   (example: job.redmine.com)
    2. apiKey (user apiKey from redmine with all permission)
    3. from (example redmine-reports@job.com)
    4. destinationEmails (array with recipient emails, example: [worker1@mail.com, worker2@mail.com])
    5. appUrl: (example http://localhost:8080/api/v1)
    6. minLogTime: (example 40 hours at last week for eight-hour shift)

cp etc/users.htpasswd.sample etc/users.htpasswd
after copy write login and password for users, for example

    user1:password
    user2:password

##Uses
For  sync  from redmine use sync_time_entries.js script with one of the modes, for example:
```bash
node bin/sync_time_entries.js --fullsync
```
Clear database and sync all time entries, projects and users.
```bash
node bin/sync_time_entries.js --sync
```
Sync only new time entries, projects and users.

For send email with report use send_report_to_email.js script, example:

```bash
node bin/send_report_to_email.js --send
```

You can set your crontab for use scripts automatically.

For start application write:
```bash
npm start
```

##API

###Projects list

####Request

```js
GET /api/v1/projects
```

####Response

```js
{
    "status": 1,

    projects: [
        {
            id: 12,
            name: 'Some project'
        },
        {
            id: 2,
            name: 'Some project'
        }
    ]
}
```

###Users list
####Request
```js
GET /api/v1/users
```
Supported parameters:

1. "users"  - comma separated list of ids of users  (default - all users)

```js
GET /api/v1/users?users=12,2
```

####Response
```js
{
    "status": 1,

    users: [
        {
            id: 12,
            name: 'John Smith'
        },
        {
            id: 2,
            name: 'Bogdan Shevchenko'
        }
    ]
}
```

###Time entries list
####Request


GET /api/v1/time_entries

Supported parameters:

1. "projects" - comma separated list of ids of projects  (default - all projects)
2. "users"  - comma separated list of ids of users  (default - all users)
3. "startDate" - ISO8601 date (example - "2014-10-24")
4. "endDate" - ISO8601 date (example - "2014-10-24")

Supported includes:

1. "user"

```js
GET /api/v1/time_entries?projects=1,3&users=1,2,3,4,5&startDate=2014-07-07&include=user
```

####Response

```js
{
    "status": 1,

    timeEntries: [
        {
            totalHours: 13.5,

            hoursByIssue: {
                1: 3,
                3: 10,
                8: 0.5
            },

            hoursByProject: {
                2: 13.5
            },

            hoursByActivity: {
                Fixing: 10,
                Development: 0.5,
                Design: 3
            },

            links: {
                user: 12,
                issues: [1, 3, 8],
                projects: [2]
            }
        },
        {
            totalHours: 14,

            hoursByIssue: {
                1: 2,
                3: 10,
                5: 2
            },

            hoursByProject: {
                1: 14
            },

            hoursByActivity: {
                Fixing: 10,
                Development: 5,
                Design: 3
            },

            links: {
                user: 2
                issues: [1, 3, 5],
                projects: [14]
            }
        }
    ],

    linked: {
        users: [
            {
                id: 12,
                name: 'Viktor Turskyi'
            },
            {
                id: 2,
                name: 'Anton Morozov'
            }
        ]
    }
}
```
