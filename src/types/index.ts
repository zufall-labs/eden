export interface TemplateVariable {
    name: string;
    prompt: string;
    default?: string;
    validate?: (input: string) => boolean | string;
}

export interface TemplateConfig {
    name: string;
    description: string;
    variables: TemplateVariable[];
    dependencies: string[];
    hooks: {
        pre_create?: string[];
        post_create?: string[];
    };
}

export interface Toolchain {
    name: string;
    initialize(projectPath: string, options: Record<string, string>): Promise<void>;
    installDependencies(projectPath: string): Promise<void>;
    setupTests(projectPath: string): Promise<void>;
    validateEnvironment(): Promise<boolean>;
}

// Template provider interface for potential future extension
export interface TemplateProvider {
    getTemplateConfig(language: string, type: string): Promise<TemplateConfig>;
    getTemplatePath(language: string, type: string): string;
    listAvailableTemplates(): Promise<Array<{ language: string; types: string[] }>>;
}