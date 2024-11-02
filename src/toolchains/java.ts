// src/toolchains/java.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { Toolchain } from '../types';
import { createLogger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);
const logger = createLogger();

export class JavaToolchain implements Toolchain {
    name = 'java';

    async validateEnvironment(): Promise<boolean> {
        try {
            // Check for Java installation
            const { stderr: javaVersion } = await execAsync('java -version');
            logger.info('Found Java:', javaVersion.split('\n')[0]);

            // Check for Gradle installation
            const { stdout: gradleVersion } = await execAsync('gradle --version');
            const gradleVersionLine = gradleVersion.split('\n').find(line => line.includes('Gradle'));
            if (gradleVersionLine) {
                logger.info('Found Gradle:', gradleVersionLine.trim());
            }

            return true;
        } catch (error) {
            if (error instanceof Error) {
                const message = error.message.toLowerCase();
                if (message.includes('java')) {
                    logger.error('Java is not installed or not in PATH', '');
                } else if (message.includes('gradle')) {
                    logger.error('Gradle is not installed or not in PATH', '');
                }
            }
            return false;
        }
    }

    async initialize(projectPath: string, options: Record<string, string>): Promise<void> {
        const packagePath = options.package_name.replace(/\./g, '/');

        // Create package directory structure
        const srcPath = path.join(projectPath, 'src', 'main', 'java', packagePath);
        const testPath = path.join(projectPath, 'src', 'test', 'java', packagePath);

        await fs.mkdir(srcPath, { recursive: true });
        await fs.mkdir(testPath, { recursive: true });

        // Move Java files from root src/main/java to correct package directory
        try {
            const mainJavaDir = path.join(projectPath, 'src', 'main', 'java');
            const files = await fs.readdir(mainJavaDir);

            for (const file of files) {
                if (file.endsWith('.java')) {
                    const oldPath = path.join(mainJavaDir, file);
                    const newPath = path.join(srcPath, file);
                    await fs.rename(oldPath, newPath);
                }
            }
        } catch (error) {
            logger.error('Error moving Java files to package directory:', error);
        }

        // Download Gradle wrapper if Gradle is not installed
        try {
            await execAsync('gradle --version');
            logger.info('Using system Gradle installation');
        } catch {
            logger.info('Gradle not found, downloading wrapper...');
            await this.downloadGradleWrapper(projectPath);
        }
    }

    private async downloadGradleWrapper(projectPath: string): Promise<void> {
        const gradleVersion = '8.5';  // Latest stable version
        try {
            // Try to use system Gradle to create wrapper
            await execAsync(
                `gradle wrapper --gradle-version ${gradleVersion} --distribution-type bin`,
                { cwd: projectPath }
            );
            await fs.chmod(path.join(projectPath, 'gradlew'), 0o755);
        } catch (error) {
            logger.warn('Could not download Gradle wrapper automatically.');
            // Create placeholder gradle wrapper script
            const gradlewContent = `#!/bin/sh
echo "Please install Gradle ${gradleVersion} or run 'gradle wrapper' to download the wrapper."
exit 1`;
            await fs.writeFile(path.join(projectPath, 'gradlew'), gradlewContent);
            await fs.chmod(path.join(projectPath, 'gradlew'), 0o755);
        }
    }

    async installDependencies(projectPath: string): Promise<void> {
        try {
            logger.info('Building project and downloading dependencies...');
            // Try using system Gradle first, fall back to wrapper
            try {
                await execAsync('gradle build -x test', { cwd: projectPath });
            } catch {
                await execAsync('./gradlew build -x test', { cwd: projectPath });
            }
        } catch (error) {
            throw new Error(`Failed to build project: ${error}`);
        }
    }

    async setupTests(projectPath: string): Promise<void> {
        logger.info('Test environment ready. Run ./gradlew test to execute tests.');
    }
}