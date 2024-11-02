import { select, input } from '@inquirer/prompts';
import path from 'path';
import { fileURLToPath } from 'url';
import { TemplateManager } from '../templates/manager';
import { getToolchain } from '../toolchains';
import { createLogger } from '../utils/logger';
import { TemplateConfig } from '../types';
import chalk from 'chalk';

const logger = createLogger();

// Get the directory where our package is installed
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Remove one level of ".." since we're already in the right directory
const pkgRoot = path.resolve(__dirname, '..');

interface InitOptions {
    language?: string;
    type?: string;
}

export async function initCommand(options: InitOptions): Promise<void> {
    const templatesPath = path.join(pkgRoot, 'templates');
    const templateManager = new TemplateManager(templatesPath);

    try {
        // Get available templates
        const templates = await templateManager.listAvailableTemplates();

        // If language not provided, prompt for it
        const language = options.language || await promptLanguage(templates);

        // Get available types for selected language
        const languageTemplates = templates.find(t => t.language === language);
        if (!languageTemplates) {
            throw new Error(`No templates available for language: ${language}`);
        }

        // If type not provided, prompt for it
        const type = options.type || await promptType(languageTemplates.types);

        // Load template config
        logger.info('Loading template configuration...');
        const config = await templateManager.getTemplateConfig(language, type);

        // Prompt for variables
        const variables = await promptVariables(config);

        // Create project
        logger.info('Creating project...');
        const projectPath = path.join(process.cwd(), variables.project_name);

        // Process template files
        const templatePath = templateManager.getTemplatePath(language, type);
        await templateManager.processTemplate(templatePath, projectPath, variables);

        // Initialize toolchain
        const toolchain = getToolchain(language);
        if (!toolchain) {
            throw new Error(`No toolchain available for language: ${language}`);
        }

        // Validate environment
        logger.info('Validating environment...');
        const isValid = await toolchain.validateEnvironment();
        if (!isValid) {
            throw new Error(`Environment validation failed for ${language}`);
        }

        // Run toolchain steps
        logger.info('Initializing project...');
        await toolchain.initialize(projectPath, variables);

        logger.info('Installing dependencies...');
        await toolchain.installDependencies(projectPath);

        logger.info('Setting up tests...');
        await toolchain.setupTests(projectPath);

        logger.success('Project created successfully!');

        // Print next steps
        logger.info('\nNext steps:');
        logger.info(chalk.cyan(`  cd ${variables.project_name}`));
        if (language === 'go') {
            logger.info(chalk.cyan('  go mod tidy'));
            logger.info(chalk.cyan('  go run main.go'));
        }
    } catch (error) {
        logger.error('Failed to initialize project:', error);
        process.exit(1);
    }
}

async function promptLanguage(templates: Array<{ language: string; types: string[] }>): Promise<string> {
    return select({
        message: 'Select a language:',
        choices: templates.map(t => ({
            value: t.language,
            label: t.language
        }))
    });
}

async function promptType(types: string[]): Promise<string> {
    return select({
        message: 'Select a project type:',
        choices: types.map(type => ({
            value: type,
            label: type
        }))
    });
}

async function promptVariables(config: TemplateConfig): Promise<Record<string, string>> {
    const variables: Record<string, string> = {};

    for (const variable of config.variables) {
        const value = await input({
            message: variable.prompt,
            default: variable.default,
            validate: variable.validate ?
                (input: string) => {
                    if (typeof variable.validate === 'string') {
                        // If validate is a regex string
                        const regex = new RegExp(variable.validate);
                        return regex.test(input) || `Input must match pattern: ${variable.validate}`;
                    }
                    // If validate is a function (which it shouldn't be in YAML)
                    return true;
                } : undefined
        });
        variables[variable.name] = value;
    }

    return variables;
}