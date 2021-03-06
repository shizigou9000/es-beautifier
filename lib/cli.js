#!/usr/bin/env node

const program = require('commander');
const { CLIEngine } = require('eslint');
const { version } = require('../package.json');
const esBeautifier = require('./main.js');

program
  .version(version)
  .usage('[options] [<file ...>]')
  .option('-c, --config [name]', 'specify config name [standard]', 'standard')
  .option('-u, --use-eslintrc', 'use eslintrc files')
  .parse(process.argv);

const config = esBeautifier.configs[program.config];
if (!config) {
  console.error('no such config');
  process.exit(1);
}

config.fix = true;
config.useEslintrc = !!program.useEslintrc;
const cli = new CLIEngine(config);
cli.addPlugin('es-beautifier', esBeautifier);

if (program.args.length) {
  const report = cli.executeOnFiles(program.args);
  CLIEngine.outputFixes(report);
} else {
  process.stdin.setEncoding('utf8');
  const chunks = [];
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk) chunks.push(chunk);
  });
  process.stdin.on('end', () => {
    const text = chunks.join('');
    const report = cli.executeOnText(text);
    const output = report.results[0].output || text;
    process.stdout.write(output, 'utf8');
  });
}
