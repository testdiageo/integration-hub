# Deployment Crash Fix - path.resolve() Undefined Error

## Problem
The application was crashing on Railway deployment with the following error:
```
TypeError [ERR_INVALID_ARG_TYPE]: The "paths[0]" argument must be of type string. Received undefined
    at Object.resolve (node:path:1097:7)
    at file:///app/dist/index.js:2452:18
```

## Root Cause
The issue was in `server/vite.ts` where `import.meta.dirname` was being used in `path.resolve()` calls:

```typescript
// Line 71 - serveStatic function
const distPath = path.resolve(import.meta.dirname, "public");

// Line 48-52 - setupVite function
const clientTemplate = path.resolve(
  import.meta.dirname,
  "..",
  "client",
  "index.html",
);
```

The `import.meta.dirname` property is a relatively new Node.js feature (v20.11.0+) and doesn't work reliably in transpiled/bundled production code. When the code was compiled and run on Railway, `import.meta.dirname` was `undefined`, causing the `path.resolve()` calls to fail.

## Solution
Replaced `import.meta.dirname` with the standard ESM pattern for getting the current directory:

```typescript
import { fileURLToPath } from "url";

// Get the directory name in ESM modules (works in both dev and production)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

This pattern:
- ✅ Works in both development and production environments
- ✅ Works with transpiled/bundled code
- ✅ Is the recommended approach for ESM modules
- ✅ Compatible with all Node.js versions that support ESM

## Changes Made
**File: `server/vite.ts`**

1. Added import for `fileURLToPath`:
   ```typescript
   import { fileURLToPath } from "url";
   ```

2. Added proper directory resolution at the top of the file:
   ```typescript
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.dirname(__filename);
   ```

3. Replaced both instances of `import.meta.dirname` with `__dirname`:
   - In `setupVite` function (line 54)
   - In `serveStatic` function (line 76)

## Testing
- ✅ Build completes successfully: `npm run build`
- ✅ Changes committed and pushed to `main-backup` branch
- ✅ Ready for Railway deployment

## Deployment
The fix has been pushed to the `main-backup` branch. Railway should automatically detect the changes and redeploy. The application should now start successfully without the path.resolve() error.

## Commit Details
- **Commit**: `45267ab`
- **Branch**: `main-backup`
- **Message**: "Fix production crash: Replace import.meta.dirname with proper ESM __dirname"
