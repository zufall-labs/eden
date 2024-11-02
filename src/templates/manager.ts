// src/templates/manager.ts
import fs from 'fs/promises';
import path from 'path';
import { parse as parseYaml } from 'yaml';
import mustache from 'mustache';
import { TemplateConfig, TemplateProvider } from '../types';

mustache.escape = (text) => text;

export class TemplateManager implements TemplateProvider {
    constructor(private readonly templatesPath: string) { }

    async getTemplateConfig(language: string, type: string): Promise<TemplateConfig> {
        const templatePath = path.join(this.templatesPath, language, type);
        const configPath = path.join(templatePath, 'template.yaml');

        try {
            const configContent = await fs.readFile(configPath, 'utf-8');
            return parseYaml(configContent) as TemplateConfig;
        } catch (error) {
            throw new Error(`Failed to load template config for ${language}/${type}: ${error}`);
        }
    }

    getTemplatePath(language: string, type: string): string {
        return path.join(this.templatesPath, language, type, 'files');
    }

    async listAvailableTemplates(): Promise<Array<{ language: string; types: string[] }>> {
        const languages = await fs.readdir(this.templatesPath);

        const templates = await Promise.all(
            languages.map(async (language) => {
                const languagePath = path.join(this.templatesPath, language);
                const stats = await fs.stat(languagePath);

                if (!stats.isDirectory()) return null;

                const types = await fs.readdir(languagePath);
                const validTypes = await Promise.all(
                    types.map(async (type) => {
                        const configPath = path.join(languagePath, type, 'template.yaml');
                        try {
                            await fs.access(configPath);
                            return type;
                        } catch {
                            return null;
                        }
                    })
                );

                return {
                    language,
                    types: validTypes.filter((type): type is string => type !== null),
                };
            })
        );

        return templates.filter((t): t is { language: string; types: string[] } => t !== null);
    }

    async processTemplate(
        sourcePath: string,
        targetPath: string,
        variables: Record<string, string>
    ): Promise<void> {
        await fs.mkdir(targetPath, { recursive: true });
        const entries = await fs.readdir(sourcePath, { withFileTypes: true });

        for (const entry of entries) {
            const sourceFilePath = path.join(sourcePath, entry.name);
            // Process filename for potential variables
            const targetFileName = mustache.render(entry.name, variables);
            const targetFilePath = path.join(targetPath, targetFileName);

            if (entry.isDirectory()) {
                await this.processTemplate(sourceFilePath, targetFilePath, variables);
            } else {
                let content = await fs.readFile(sourceFilePath, 'utf-8');
                // Fix for Go imports: convert {{.module_path}} to {{module_path}}
                content = content.replace(/\{\{\s*\.module_path\s*\}\}/g, '{{module_path}}');
                const processedContent = mustache.render(content, variables);
                await fs.writeFile(targetFilePath, processedContent);
            }
        }
    }
}