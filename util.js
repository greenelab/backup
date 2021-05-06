const chalk = require("chalk");

// loggers
const log = (message = "") => console.log(message);
const success = (message = "") => console.log(chalk.green(message));
const info = (message = "") => console.log(chalk.blue(message));
const warning = (message = "") => console.log(chalk.yellow(message));
const error = (message = "") => console.log(chalk.red(message));

// util sleep func
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { log, success, info, warning, error, sleep };
