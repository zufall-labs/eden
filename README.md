<div align="center">
    <img src="https://raw.githubusercontent.com/zufall-labs/.github/main/profile/zufall-banner.png" alt="Helica" width="600" />
</div>

<h1 align="center">Eden</h1>

<div align="center">🍀 Eden is an extensible project scaffolding CLI used for bootstrapping projects at Zufall Labs.</div>

<br />

<div align="center">
    <a href="https://github.com/zufall-labs/nullpunkt/blob/main/LICENSE">
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

### Go
- `fiber-api`: REST API using Fiber framework
- `cli`: Command-line application using Cobra

### Java
- `quarkus-api`: REST API using Quarkus framework

## Requirements

- Node.js >= 18
- Language-specific requirements:
  - Go: Go 1.21 or later
  - Java: Java 17 or later and Gradle 8.5 or later