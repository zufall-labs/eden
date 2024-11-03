import { Toolchain } from '../types';
import { GoToolchain } from './go';
import { JavaToolchain } from './java';
import { GleamToolchain } from './gleam';

const toolchains: Record<string, Toolchain> = {
    go: new GoToolchain(),
    java: new JavaToolchain(),
    gleam: new GleamToolchain(),
};

export function getToolchain(language: string): Toolchain | undefined {
    return toolchains[language];
}