# GitHub Backup

This repo contains scripts to look up all of a GitHub user's or organization's repos and wikis, and then either **🗄️ archive** them by submitting them to [Software Heritage](https://softwareheritage.org/), or **⬇️ clone** them locally.

## Better Alternative

**Before you use these scripts**, see if this **better alternative works** for you.
This has the following limitations:

- Only works for GitHub organizations, not users.
- Doesn't backup wikis.
- Only submits to Software Heritage.

Software Heritage [has an API endpoint](https://docs.softwareheritage.org/user/save_code_now/webhooks/index.html#github) that listens for a webhook event and automatically submits the associated repo to be archived.
GitHub also allows you to [configure webhooks at an organization level](https://docs.github.com/en/webhooks-and-events/webhooks/creating-webhooks), so that an event is fired any time there is a push (or other activity) in any of the org's repos.

Combining these two features, you can easily set up automatic archival for all of your org's repos:

1. Go to your GitHub organization's settings.
2. Look for the "webhooks" settings.
3. Add a new webhook.
   1. Set the "payload URL" to be [Software Heritage's API endpoint](https://docs.softwareheritage.org/user/save_code_now/webhooks/index.html#github).
   2. Set the "content type" to "application/json".
   3. Change what events trigger the webhook as needed.

This has several benefits over the scripts contained in this repo:

- Only runs when there are changes to a repo, not periodically.
- Only runs on the repo that has changed, instead of all of the repos in the org.
- Don't have to worry about GitHub Actions eventually stopping periodic runs in stale repos (see note below).
- Don't need a dedicated fork of this repo in your org, just need to configure a few org settings.

## Usage

### Run Locally

1. [Install Node](https://nodejs.org/en).
2. Clone this repo locally and `cd` into the directory.
3. Run `npm install` to install necessary packages.
4. Run `npm run archive` or `npm run clone` to **archive** or **clone**.

### Run on GitHub Actions

1. Fork this repository to your own user or organization.
2. In your forked repo's settings, [grant GitHub Actions workflows read and write permissions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#setting-the-permissions-of-the-github_token-for-your-repository).
3. The GitHub Actions workflow included in the repo will automatically [run the **archive** script periodically](../../actions).

**Note**: GitHub eventually stops running periodic (cron) workflows if your repo hasn't had any activity in a few months.
To get around this, you can either make a commit to your repo every so often, or you can [manually trigger the run of the **archive** workflow](https://docs.github.com/en/actions/using-workflows/manually-running-a-workflow).

## Environment Variables

For these scripts to work properly, you need to provide some information and access keys as environment variables.

When running locally, put these variables in a `.env` file in the root of the repo:

```
GITHUB_USER=greenelab
GITHUB_TOKEN=XXXXXXXX
SOFTWARE_HERITAGE_TOKEN=XXXXXXXX
```

When running on GitHub actions, [create a repository secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets) for each variable you want to set.

#### `GITHUB_USER`

The GitHub user or organization you want to backup, e.g., "greenelab".

When running on GitHub Actions, this can be omitted to automatically use the current user or organization running the workflow.

#### `GITHUB_TOKEN`

A [GitHub authentication token](https://octokit.github.io/rest.js/v18#authentication), such as a [personal access token](https://github.com/settings/tokens/new).

When running on GitHub Actions, this can be omitted to automatically use the [GitHub Actions token](https://docs.github.com/en/actions/security-guides/automatic-token-authentication).
This has the caveat of only having permissions to see _public repos_.
You could use a personal access token to allow the scripts to see private repos, but Software Heritage cannot archive private repos anyway.

#### `SOFTWARE_HERITAGE_TOKEN`

A [Software Heritage authentication/API token](https://archive.softwareheritage.org/oidc/profile/#tokens).
