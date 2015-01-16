# Redmine-reports
Redmine time logging application built with [Node.js](http://nodejs.org/)
##Installation
git clone git://github.com/webbylab/redmine-reports.git !!!!!!!!!!!!!!!!!

npm install

cp etc/config.json.sample etc/config.json
after copy set next field:

    1. Redmine:
        host   (example: job.redmine.com)
        apiKey (user apiKey from redmine with all permission)
    2. Mail:
        from (example redmine-reports@job.com)
    3. emailReport:
        destinationEmails (array with recipient emails, example: [worker1@mail.com, worker2@mail.com])
    4. appUrl: (example http://localhost:8080/api/v1)
    5. minLogTime: (example 40 hours at last week for eight-hour shift)

cp etc/users.htpasswd.sample etc/users.htpasswd
after copy write login and password for users, for example

    user1:password
    user2:password

For  sync  from redmine use sync_time_entries.js script with one of the modes, for example:
```bash
node bin/sync_time_entries.js --fullsync clear database and sync all time entries, projects and users.

node bin/sync_time_entries.js --sync sync only new time entries, projects and users.
```

For send email with report use send_report_to_email.js script, example:

```bash
node bin/send_report_to_email.js --send
```

