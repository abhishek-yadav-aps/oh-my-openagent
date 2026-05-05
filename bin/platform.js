// bin/platform.js
// Shared platform detection module - used by wrapper and postinstall

/**
 * Get the platform-specific package name
 * @param {{ platform: string, arch: string, libcFamily?: string | null }} options
 * @returns {string} Package name like "credit-agents-darwin-arm64"
 * @throws {Error} If libc cannot be detected on Linux
 */
export function getPlatformPackage({ platform, arch, libcFamily }) {
  let suffix = "";
  if (platform === "linux") {
    if (libcFamily === null || libcFamily === undefined) {
      throw new Error(
        "Could not detect libc on Linux. " +
        "Please ensure detect-libc is installed or report this issue."
      );
    }
    if (libcFamily === "musl") {
      suffix = "-musl";
    }
  }

  // Map platform names: win32 -> windows (for package name)
  const os = platform === "win32" ? "windows" : platform;
  return `credit-agents-${os}-${arch}${suffix}`;
}

/** @param {{ platform: string, arch: string, libcFamily?: string | null, preferBaseline?: boolean }} options */
export function getPlatformPackageCandidates({ platform, arch, libcFamily, preferBaseline = false }) {
  const primaryPackage = getPlatformPackage({ platform, arch, libcFamily });
  const baselinePackage = getBaselinePlatformPackage({ platform, arch, libcFamily });

  if (!baselinePackage) {
    return [primaryPackage];
  }

  return preferBaseline ? [baselinePackage, primaryPackage] : [primaryPackage, baselinePackage];
}

/** @param {{ platform: string, arch: string, libcFamily?: string | null }} options */
function getBaselinePlatformPackage({ platform, arch, libcFamily }) {
  if (arch !== "x64") {
    return null;
  }

  if (platform === "darwin") {
    return "credit-agents-darwin-x64-baseline";
  }

  if (platform === "win32") {
    return "credit-agents-windows-x64-baseline";
  }

  if (platform === "linux") {
    if (libcFamily === null || libcFamily === undefined) {
      throw new Error(
        "Could not detect libc on Linux. " +
        "Please ensure detect-libc is installed or report this issue."
      );
    }

    if (libcFamily === "musl") {
      return "credit-agents-linux-x64-musl-baseline";
    }

    return "credit-agents-linux-x64-baseline";
  }

  return null;
}

/**
 * Get the path to the binary within a platform package
 * @param {string} pkg Package name
 * @param {string} platform Process platform
 * @returns {string} Relative path like "credit-agents-darwin-arm64/bin/credit-agents"
 */
export function getBinaryPath(pkg, platform) {
  const ext = platform === "win32" ? ".exe" : "";
  return `${pkg}/bin/credit-agents${ext}`;
}
