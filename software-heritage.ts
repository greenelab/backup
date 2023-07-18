import { basename } from "path";
import { exit } from "process";
import { softwareHeritageToken } from "./env";
import { error, info, log, sleep, success, warning } from "./util";

/** archive repos at software heritage */
const archiveRepos = async (urls: string[]) => {
  info(`Archiving repos at SoftwareHeritage.org`);

  /** archive repos one at a time */
  for (const [index, url] of Object.entries(urls)) {
    const name = basename(url);
    info(`Archiving repo ${name}, ${Number(index) + 1} of ${urls.length}`);
    await archiveRepo(url);
  }
};

/** standard headers */
const headers = new Headers();
if (softwareHeritageToken)
  headers.set("Authorization", `Bearer ${softwareHeritageToken}`);

/** submit a repo url to be archived at software heritage */
const archiveRepo = async (repo: string) => {
  /** retries, with hard limit */
  for (let retry = 0; retry < 5; retry++) {
    if (retry) log(`Retry ${retry}`);

    try {
      {
        /** submit to api to be archived */
        const url = `https://archive.softwareheritage.org/api/1/origin/save/git/url/${repo}/`;
        const options = { method: "POST", headers };
        const response = await (await fetch(url, options)).json();

        /** handle rate limit exception as warning */
        if (response.exception === "Throttled") {
          warning(response.reason);

          /** expected format: "Request was throttled. Expected available in 120 seconds." */
          let wait = Number(response.reason.match(/(\d+) seconds/)?.[1]) || 60;

          /** add a bit of extra wait time to account for estimate and sleep timer inaccuracy */
          wait += 10;
          wait *= 1.05;

          log(
            "Trying again in " +
              (wait >= 60
                ? `~${Math.round(wait / 60)} min(s)`
                : `${wait} seconds(s)`),
          );

          await sleep(wait * 1000);
          continue;
        } else if (response.exception) {
          /** for all other exceptions, throw critical error  */
          throw Error(`${response.exception}: ${response.reason}`);
        }

        /** if accepted, finish */
        if (response.save_request_status === "accepted") {
          success("Successfully submitted for archiving");
          return;
        }

        /** catch all other errors */
        throw Error(JSON.stringify(response, null, 2));
      }
    } catch (message) {
      /** catch critical errors and exit */
      error(message);
      exit(1);
    }
  }
};

export { archiveRepos };
