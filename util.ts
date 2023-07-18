import { blue, gray, green, red, yellow } from "chalk";

/** loggers */
const log = (message = "") => console.log(gray(message));
const success = (message = "") => console.log(green(message));
const info = (message = "") => console.log(blue(message));
const warning = (message = "") => console.log(yellow(message));
const error = (message = "") => console.log(red(message));

/** util sleep func */
const sleep = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

export { log, success, info, warning, error, sleep };
