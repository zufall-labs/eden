// src/toolchains/gleam.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { Toolchain } from '../types';
import { createLogger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);
const logger = createLogger();

export class GleamToolchain implements Toolchain {
    name = 'gleam';

    async validateEnvironment(): Promise<boolean> {
        try {
            // Check for Gleam
            const { stdout: gleamVersion } = await execAsync('gleam --version');
            logger.info('Found Gleam:', gleamVersion.trim());
            return true;
        } catch {
            logger.error('Gleam is not installed. Visit https://gleam.run to install.', '');
            return false;
        }
    }

    async initialize(projectPath: string, options: Record<string, string>): Promise<void> {
        // Create standard Gleam project structure
        const srcPath = path.join(projectPath, 'src');
        const testPath = path.join(projectPath, 'test');

        await fs.mkdir(srcPath, { recursive: true });
        await fs.mkdir(testPath, { recursive: true });
    }

    async installDependencies(projectPath: string): Promise<void> {
        try {
            logger.info('Installing dependencies...');
            await execAsync('gleam deps download', { cwd: projectPath });
            await execAsync('gleam build', { cwd: projectPath });
        } catch (error) {
            throw new Error(`Failed to install dependencies: ${error}`);
        }
    }

    async setupTests(projectPath: string): Promise<void> {
        // Test structure is created during initialize
        logger.info('Test environment ready. Run gleam test to execute tests.');
    }
}