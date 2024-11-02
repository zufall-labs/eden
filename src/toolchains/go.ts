import { exec } from 'child_process';
import { promisify } from 'util';
import { Toolchain } from '../types';
import { createLogger } from '../utils/logger';

const execAsync = promisify(exec);
const logger = createLogger();

export class GoToolchain implements Toolchain {
    name = 'go';

    async validateEnvironment(): Promise<boolean> {
        try {
            await execAsync('go version');
            return true;
        } catch {
            logger.error('Go is not installed or not in PATH', '');
            return false;
        }
    }

    async initialize(projectPath: string, options: Record<string, string>): Promise<void> {
        const modulePath = options.module_path || options.project_name;
        await execAsync(`go mod init ${modulePath}`, { cwd: projectPath });
    }

    async installDependencies(projectPath: string): Promise<void> {
        await execAsync('go mod tidy', { cwd: projectPath });
    }

    async setupTests(projectPath: string): Promise<void> {
        // Basic test setup - will be populated by template
        await execAsync('mkdir -p internal', { cwd: projectPath });
    }
}