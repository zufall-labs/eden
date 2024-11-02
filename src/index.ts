import { Command } from 'commander';
import { initCommand } from './commands/init';
import { createLogger } from './utils/logger';

const logger = createLogger();

const program = new Command()
    .name('eden')
    .description('Modern project scaffolding tool')
    .version('0.1.0');

program
    .command('init')
    .description('Initialize a new project')
    .option('-l, --language <language>', 'Target language')
    .option('-t, --type <type>', 'Project type')
    .action(async (options) => {
        try {
            await initCommand(options);
        } catch (error) {
            logger.error('Failed to initialize project:', error);
            process.exit(1);
        }
    });

program.parse();