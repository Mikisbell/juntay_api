
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * CHECK DE INTEGRIDAD DEL SISTEMA
 * Verifica que el entorno de desarrollo sea seguro para trabajar.
 */

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

function log(msg: string, type: 'info' | 'error' | 'success' = 'info') {
    if (type === 'error') console.log(`${RED}❌ ${msg}${RESET}`);
    else if (type === 'success') console.log(`${GREEN}✅ ${msg}${RESET}`);
    else console.log(`ℹ️  ${msg}`);
}

function checkGitIdentity() {
    try {
        const name = execSync('git config user.name').toString().trim();
        const email = execSync('git config user.email').toString().trim();

        if (!name || !email) {
            log('Git User Identity no configurada.', 'error');
            log('Ejecuta: git config user.email "tu@inc.com" && git config user.name "Tu Nombre"', 'error');
            return false;
        }
        log(`Git Identity: ${name} <${email}>`, 'success');
        return true;
    } catch (e) {
        log('No se pudo verificar Git Identity.', 'error');
        return false;
    }
}

function checkNodeVersion() {
    const version = process.version;
    // Simple check v18+
    const major = parseInt(version.replace('v', '').split('.')[0]);
    if (major < 18) {
        log(`Node version ${version} es antigua (Requerido: v18+)`, 'error');
        return false;
    }
    log(`Node version: ${version}`, 'success');
    return true;
}

function checkEnvFile() {
    if (!fs.existsSync(path.join(process.cwd(), '.env'))) {
        log('Archivo .env no encontrado.', 'error');
        return false;
    }
    log('Archivo .env verificado', 'success');
    return true;
}

function checkDocker() {
    try {
        execSync('docker info', { stdio: 'ignore' });
        log('Docker está corriendo', 'success');
        return true;
    } catch (e) {
        log('Docker no está corriendo o no instalado.', 'error');
        return false;
    }
}

async function main() {
    console.log('🛡️  VERIFICANDO INTEGRIDAD DEL SISTEMA...\n');

    let allGood = true;

    if (!checkGitIdentity()) allGood = false;
    if (!checkNodeVersion()) allGood = false;
    if (!checkEnvFile()) allGood = false;
    if (!checkDocker()) allGood = false;

    console.log('\n----------------------------------------');
    if (allGood) {
        log('SISTEMA LISTO PARA DESARROLLAR', 'success');
        process.exit(0);
    } else {
        log('SE ENCONTRARON PROBLEMAS CRÍTICOS', 'error');
        process.exit(1);
    }
}

main();
