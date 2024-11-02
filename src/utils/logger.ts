import chalk from 'chalk';

export function createLogger() {
    return {
        info: (message: string, ...args: unknown[]) => {
            console.info(message, ...args);
        },
        error: (message: string, error: unknown) => {
            console.error(chalk.red(message), error instanceof Error ? error.message : error);
        },
        success: (message: string) => {
            console.info(chalk.green('✓'), message);
        },
        warn: (message: string) => {
            console.warn(chalk.yellow('⚠'), message);
        }
    };
}