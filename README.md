Backup methods for the entire organization on GitHub.

### Archive

Looks up all the organization's repos and wikis, and submits them to [Software Heritage](https://softwareheritage.org/).

### Clone

Looks up all the organization's repos and wikis, and clones them locally.

### Run Locally

1. `yarn install`
2. `yarn archive` or `yarn clone`

### Run Automatically

The GitHub Actions configuration in this repo will automatically run the `archive` script periodically.

### Environment Variables


#### `GITHUB_ORGANIZATION`
E.g., "greenelab". 
Read from GitHub Actions automatically, or from `.env` if being run locally

#### `GITHUB_TOKEN`

A [GitHub authentication token](https://octokit.github.io/rest.js/v18#authentication), such as a [personal access token](https://github.com/settings/tokens/new).
Read from GitHub Actions automatically, or from `.env` if being run locally

#### `SOFTWARE_HERITAGE_TOKEN`

A [Software Heritage authentication token](https://archive.softwareheritage.org/api/#authentication).
Put in `.env` if running locally.
If running automatically through GitHub Actions, [create an environment](https://docs.github.com/en/actions/reference/environments#creating-an-environment) with the name `backup`, and [create an environment secret](https://docs.github.com/en/actions/reference/environments#environment-secrets) with the name `SOFTWARE_HERITAGE_TOKEN` and value of your token.
