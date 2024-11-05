<div align="center">
    <img src="https://raw.githubusercontent.com/zufall-labs/.github/main/profile/zufall-banner.png" alt="Helica" width="600" />
</div>

<h1 align="center">Eden</h1>

<div align="center">🍀 Eden is an extensible project scaffolding CLI used for bootstrapping projects at Zufall Labs. Eden is supposed to be used with <a href="https://github.com/zufall-labs/nullpunkt">Nullpunkt</a>, a project starter template enforcing QA policies.</div>

<br />

<div align="center">
    <a href="https://github.com/prettier/prettier">
        <img src="https://img.shields.io/badge/code_style-prettier-5ed9c7.svg?style=for-the-badge" alt="AGPL-3.0 License">
    </a>
    <a href="https://www.npmjs.com/package/eden">
        <img src="https://img.shields.io/npm/v/eden?style=for-the-badge&label=NPM&color=5ed9c7" alt="AGPL-3.0 License">
    </a>
    <a href="https://github.com/zufall-labs/eden/blob/main/LICENSE">
        <img src="https://img.shields.io/badge/license-AGPL--3.0-5ed9c7?style=for-the-badge" alt="AGPL-3.0 License">
    </a>
</div>

## Installation

```bash
# Using npx (no installation required)
npx eden init my-project

# Or install globally
npm install -g eden
eden init my-project
```

## Usage

```bash
# Create a new project
eden init [output]

# Create in current directory
eden init .

# Create with specific language and type
eden init my-project -l go -t fiber-api
eden init my-project -l java -t quarkus-api

# Show help
eden --help
```

## Available Templates

### Gleam
- `Wisp`: REST API using Wisp framework

### Go
- `Fiber`: REST API using Fiber framework
- `Cobra`: Command-line application using Cobra

### Java
- `Quarkus`: REST API using Quarkus framework

## Contributing

### Adding a New Template

1. Create a language directory in `templates/` if it doesn't exist:
```
templates/
└── your-language/
    └── language.yaml    # Language metadata
```

2. Add language metadata in `language.yaml`:
```yaml
name: "Your Language"
description: "Brief description of the language"
```

3. Create a directory for your template type:
```
templates/
└── your-language/
    ├── language.yaml
    └── your-template/
        ├── template.yaml    # Template metadata
        └── files/          # Template files
```

4. Configure `template.yaml`:
```yaml
name: "Your Template Name"
description: "What this template creates"
variables:
  - name: "project_name"    # Required
    prompt: "Project name"
    validate: "^[a-z][a-z0-9-]*$"
  - name: "some_variable"
    prompt: "Prompt for the variable"
    default: "default value"
dependencies:
  - "dependency1"
  - "dependency2"
hooks:
  pre_create:
    - "command to run before creation"
  post_create:
    - "command to run after creation"
```

5. Add your template files in the `files/` directory:
```
templates/
└── your-language/
    └── your-template/
        ├── template.yaml
        └── files/
            ├── src/
            ├── config/
            ├── README.md
            └── ...
```

### Template Variables

- Use `{{variable_name}}` in your template files for variable substitution
- Common variables:
  - `{{project_name}}`: Name of the project
  - `{{package_name}}`: Package/module name (language-specific)
  - Custom variables as defined in your `template.yaml`

### Directory Structure Best Practices

```
templates/
├── go/
│   ├── language.yaml
│   ├── fiber-api/
│   │   ├── template.yaml
│   │   └── files/
│   └── cli/
│       ├── template.yaml
│       └── files/
├── java/
│   ├── language.yaml
│   └── quarkus-api/
│       ├── template.yaml
│       └── files/
└── your-language/
    ├── language.yaml
    └── your-template/
        ├── template.yaml
        └── files/
```

### Implementing a Language Toolchain

Create a new toolchain file in `src/toolchains/your-language.ts`:

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
import { Toolchain } from '../types';
import { createLogger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);
const logger = createLogger();

export class YourLanguageToolchain implements Toolchain {
  name = 'your-language';

  async validateEnvironment(): Promise {
    try {
      // Check for required tools
      const { stdout } = await execAsync('your-language --version');
      logger.info('Found Your Language:', stdout.trim());
      
      // Check for additional tools if needed
      // e.g., package managers, build tools, etc.
      
      return true;
    } catch (error) {
      logger.error('Your Language is not installed or not in PATH', '');
      return false;
    }
  }

  async initialize(projectPath: string, options: Record): Promise {
    // Set up project structure
    // Initialize package manager
    // Configure build tools
    // Example:
    try {
      // Create necessary directories
      await fs.mkdir(path.join(projectPath, 'src'), { recursive: true });
      
      // Initialize package manager
      await execAsync('your-package-manager init', { cwd: projectPath });
      
      // Any language-specific initialization
    } catch (error) {
      throw new Error(`Failed to initialize project: ${error}`);
    }
  }

  async installDependencies(projectPath: string): Promise {
    try {
      // Install dependencies using your package manager
      // Example:
      logger.info('Installing dependencies...');
      await execAsync('your-package-manager install', { cwd: projectPath });
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error}`);
    }
  }

  async setupTests(projectPath: string): Promise {
    try {
      // Set up test framework
      // Create test directories
      // Initialize test configuration
      await fs.mkdir(path.join(projectPath, 'tests'), { recursive: true });
    } catch (error) {
      throw new Error(`Failed to setup tests: ${error}`);
    }
  }
}
```

### Register the Toolchain

Update `src/toolchains/index.ts` to include your new toolchain:

```typescript
import { GoToolchain } from './go';
import { JavaToolchain } from './java';
import { YourLanguageToolchain } from './your-language';
import { Toolchain } from '../types';

const toolchains: Record = {
  go: new GoToolchain(),
  java: new JavaToolchain(),
  'your-language': new YourLanguageToolchain(),
};

export function getToolchain(language: string): Toolchain | undefined {
  return toolchains[language];
}
```

### Toolchain Implementation Guidelines

Your toolchain should handle:

1. **Environment Validation**
   - Check for language runtime
   - Verify required tools and versions
   - Provide clear error messages for missing dependencies

2. **Project Initialization**
   - Create necessary directory structure
   - Initialize package manager/build tools
   - Set up configuration files
   - Handle platform-specific requirements

3. **Dependency Management**
   - Install required packages
   - Update lockfiles
   - Handle different dependency types (dev, prod, etc.)

4. **Test Setup**
   - Configure test framework
   - Create test directories
   - Set up test configuration files

5. **Error Handling**
   - Provide descriptive error messages
   - Clean up on failure
   - Log appropriate debug information

### Testing Your Template

1. Clone the repository
2. Link the CLI locally:
```bash
npm install
npm link
```

3. Test your template:
```bash
eden init test-project -l your-language -t your-template
```

4. Verify the generated project:
- Check file structure
- Ensure all variables are properly substituted
- Test build/run commands
- Validate any hooks run correctly

### Pull Request Guidelines

1. Create a feature branch
2. Add your template following the structure above
3. Update this README with your template under "Available Templates"
4. Create a pull request with:
   - Description of the template
   - Example usage
   - Any special requirements or dependencies
   - Screenshots/examples if applicable



## Requirements

- Node.js >= 18
- Language-specific requirements:
  - Gleam: Gleam 1.1.0 or later
  - Go: Go 1.21 or later
  - Java: Java 17 or later and Gradle 8.5 or later
