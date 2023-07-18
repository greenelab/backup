# GitHub Org Backup

This repo contains methods to look up all of a GitHub organization's repos and wikis, and then either **🗄️ archive** them by submitting them to [Software Heritage](https://softwareheritage.org/), or **⬇️ clone** them locally.

## Usage

### Run Locally

1. [Install Node](https://nodejs.org/en).
2. Clone this repo locally and `cd` into the directory.
3. Run `npm install` to install necessary Node packages.
4. Run `npm run archive` or `npm run clone` to **archive** or **clone**.

### Run on GitHub Actions

1. Fork this repository to your own organization.
2. The GitHub Actions configuration included in this repo will automatically [run the **archive** script periodically](/actions).

**Note**: GitHub eventually stops running periodic Actions if your repo hasn't had any activity in a few months.
To get around this, you can either make a commit to your repo every so often, or you can [manually trigger the run of the **archive** workflow](https://docs.github.com/en/actions/using-workflows/manually-running-a-workflow).

## Environment Variables

For these scripts to work properly, you need to provide some information and access keys as environment variables.

When running locally, put these variables in a `.env` file in the root of the repo:

```
GITHUB_ORGANIZATION=greenelab
GITHUB_TOKEN=XXXXXXXX
SOFTWARE_HERITAGE_TOKEN=XXXXXXXX
```

When running on GitHub actions:

1. [Create an environment](https://docs.github.com/en/actions/reference/environments#creating-an-environment) with the name `backup`.
2. [Create an environment secret](https://docs.github.com/en/actions/reference/environments#environment-secrets) for each variable you want to set.

#### `GITHUB_ORGANIZATION`

The GitHub organization you want to backup, e.g., "greenelab". 
When running on GitHub Actions, this can be omitted to automatically use the current org running the workflow.

#### `GITHUB_TOKEN`

A [GitHub authentication token](https://octokit.github.io/rest.js/v18#authentication), such as a [personal access token](https://github.com/settings/tokens/new).
When running on GitHub Actions, this can be omitted to automatically use the [GitHub Actions token](https://docs.github.com/en/actions/security-guides/automatic-token-authentication).

#### `SOFTWARE_HERITAGE_TOKEN`

A [Software Heritage authentication/API token](https://archive.softwareheritage.org/api/#authentication).
