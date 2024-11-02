import { Command } from 'commander';
import { initCommand } from './commands/init';
import { createLogger } from './utils/logger';

const logger = createLogger();

const program = new Command()
    .name('eden')
    .description('Modern project scaffolding tool')
    .version('0.1.0');

program
    .command('init [output]')
    .description('Initialize a new project in the specified directory or current directory with "."')
    .option('-l, --language <language>', 'Target language')
    .option('-t, --type <type>', 'Project type')
    .action(async (output, options) => {
        try {
            await initCommand({ ...options, output });
        } catch (error) {
            logger.error('Failed to initialize project:', error);
            process.exit(1);
        }
    });

program.parse();