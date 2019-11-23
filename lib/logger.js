const chalk = require("chalk");
exports.info = info => {
  return console.log(chalk.blueBright(`INFO:\n${info}`));
};
