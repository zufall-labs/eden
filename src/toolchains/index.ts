import { GoToolchain } from './go';
import { Toolchain } from '../types';
import { JavaToolchain } from './java';

const toolchains: Record<string, Toolchain> = {
    go: new GoToolchain(),
    java: new JavaToolchain(),
};

export function getToolchain(language: string): Toolchain | undefined {
    return toolchains[language];
}