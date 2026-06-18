# Angular Advanced Topics

## Questions Covered

1. What is Angular Universal, and how does it help with server-side rendering?
2. Explain the purpose of Angular CLI and the common commands used.
3. How do you set up internationalization (i18n) in Angular?
4. What is Webpack, and how does Angular use it?
5. What is Ivy in Angular, and what are its benefits?

## What is Angular Universal, and how does it help with server-side rendering?

**Angular Universal** renders Angular applications on the server rather than only in the browser — **Server-Side Rendering (SSR)**. It generates HTML on the server before sending it to the client, improving performance and SEO. It can also **pre-render** pages at build time into static HTML, useful for content that rarely changes.

**Benefits:**

- **Improved performance** — pre-rendered HTML gives a faster First Contentful Paint and a lower Time to Interactive, since the browser has less to do.
- **Better SEO** — search engines index fully rendered HTML more easily.
- **Improved accessibility** — a fully rendered page works better with screen readers and assistive tech.
- **Better on slow connections** — users on slow networks or weak devices still receive a complete page.

**How it works:** Angular Universal needs a Node.js server that executes the app and renders it to HTML. The server sends that HTML to the client for immediate display, then Angular **hydrates** it — bootstrapping on the client to take over the server-rendered markup and make it interactive.

**Setup:**

1. Add it with the CLI (sets up an Express server, files, and config):

```bash
ng add @nguniversal/express-engine
```

2. The CLI generates `server.ts` (Express SSR logic) and updates `angular.json`.
3. Build and serve both client and server bundles:

```bash
npm run build:ssr
npm run serve:ssr
```

4. Deploy the server-side code to a Node.js-capable host (Heroku, AWS, Azure, etc.).

**Example `server.ts`** wiring Express to Angular Universal:

```typescript
import 'zone.js/dist/zone-node';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
import { AppServerModule } from './src/main.server';

const app = express();
const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist/browser');
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main');

app.engine('html', ngExpressEngine({
  bootstrap: AppServerModule,
  providers: [provideModuleMap(LAZY_MODULE_MAP)],
}));
app.set('view engine', 'html');
app.set('views', DIST_FOLDER);
app.get('*.*', express.static(DIST_FOLDER, { maxAge: '1y' }));
app.get('*', (req, res) => {
  res.render('index', { req });
});
app.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});
```

In short, Angular Universal makes apps faster and more accessible while improving search indexing, especially for slow connections.

## Explain the purpose of Angular CLI and the common commands used.

The **Angular CLI** is a command-line tool that streamlines Angular development — project creation, code generation, building, testing, and deployment — with a standardized structure and consistent conventions. It also manages build and environment configuration.

**Common commands:**

- **`ng new <project-name>`** — create a new project. Options: `--routing`, `--style <css|scss|less|styl>`.
- **`ng serve`** — build and serve locally. Options: `--open`/`-o`, `--port <port>`.
- **`ng build`** — compile into an output directory (`dist/`). Options: `--prod`, `--output-path <path>`.
- **`ng generate <artifact> <name>`** — scaffold components, services, modules, etc. (e.g., `ng g c <name>`, `ng g s <name>`, `ng g m <name>`).
- **`ng test`** — run unit tests (Karma + Jasmine). Option: `--watch`.
- **`ng e2e`** — run end-to-end tests (Protractor). Option: `--protractor-config <file>`.
- **`ng add <package>`** — add/configure features or libraries (e.g., `ng add @angular/material`).
- **`ng lint`** — analyze code for errors and style issues.
- **`ng update`** — update CLI and Angular packages. Options: `--all`, `--force`.
- **`ng deploy`** — deploy to a hosting provider (needs target-specific setup).
- **`ng build --prod && ng run <project-name>:server`** — build for SSR with Angular Universal.

**Summary table:**

| Command | Purpose | Options |
|---------|---------|---------|
| `ng new <project-name>` | Create a project | `--routing`, `--style` |
| `ng serve` | Serve locally | `--open`, `--port` |
| `ng build` | Build the app | `--prod`, `--output-path` |
| `ng generate <artifact> <name>` | Generate artifacts | `c`, `s`, `m` |
| `ng test` | Run unit tests | `--watch` |
| `ng e2e` | Run e2e tests | `--protractor-config` |
| `ng add <package>` | Add features/libraries | |
| `ng lint` | Lint code | |
| `ng update` | Update CLI and packages | `--all`, `--force` |
| `ng deploy` | Deploy the app | |
| `ng build --prod && ng run <project-name>:server` | Build for SSR | |

The CLI simplifies development by automating routine tasks and ensuring consistency.

## How do you set up internationalization (i18n) in Angular?

Angular has built-in i18n support for translations and locale-specific formatting of dates, numbers, and currencies.

**1. Install/ensure the CLI:**

```bash
npm install -g @angular/cli
```

**2. Create or open a project** (`ng new my-angular-app`).

**3. Add i18n markers** to translatable text using the `i18n` directive (the `@@id` is an optional custom ID):

```html
<h1 i18n="@@homeTitle">Welcome to My App</h1>
<p i18n="@@homeIntro">This is a sample application to demonstrate internationalization.</p>
```

**4. Extract translation strings** into a `messages.xlf` file under `src/`:

```bash
ng extract-i18n
```

**5. Translate** by copying the file per locale (e.g., `messages.fr.xlf`, `messages.de.xlf`) and filling in `<target>` values:

```xml
<trans-unit id="homeTitle">
  <source>Welcome to My App</source>
  <target>Bienvenue sur Mon App</target>
</trans-unit>
<trans-unit id="homeIntro">
  <source>This is a sample application to demonstrate internationalization.</source>
  <target>Ceci est une application exemple pour démontrer l'internationalisation.</target>
</trans-unit>
```

**6. Configure** the locales in `angular.json`:

```json
"projects": {
  "my-angular-app": {
    "i18n": {
      "locales": {
        "fr": "src/locale/messages.fr.xlf",
        "de": "src/locale/messages.de.xlf"
      }
    }
  }
}
```

**7. Build per locale** with `--localize` (generates a separate output set for each language):

```bash
ng build --localize
```

**8. Locale switching (optional)** — register locale data and set `LOCALE_ID`:

```typescript
import { NgModule, LOCALE_ID } from '@angular/core';
import { AppComponent } from './app.component';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeDe from '@angular/common/locales/de';

registerLocaleData(localeFr, 'fr');
registerLocaleData(localeDe, 'de');

@NgModule({
  declarations: [AppComponent],
  imports: [CommonModule],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr' } // change as needed
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

In summary: mark text with `i18n`, extract with `ng extract-i18n`, translate locale files, register them in `angular.json`, build with `ng build --localize`, and configure `LOCALE_ID` for switching.

## What is Webpack, and how does Angular use it?

**Webpack** is a module bundler: it processes JavaScript modules and their dependencies (plus CSS, images, fonts, etc.) into one or more output bundles. It's highly configurable through loaders and plugins.

**What it does:**

- **Module bundling** — combines modules into output files, reducing HTTP requests.
- **Code splitting** — splits code into chunks loaded on demand, optimizing load time.
- **Asset management** — processes stylesheets, images, fonts, and includes them in bundles.
- **Dev and production builds** — fast builds with live reload for development; minification and optimization for production.
- **Transformations via loaders** — e.g., Babel to transpile modern JS, CSS loaders to include styles.

**How Angular uses it (through the CLI):**

- **Configuration** — the CLI configures Webpack internally for bundling, code splitting, and asset management, hiding the complexity.
- **Dev server** — `ng serve` uses Webpack Dev Server with HMR and live reload.
- **Build** — `ng build` uses Webpack to compile and bundle, producing minified JS, optimized styles, and hashed filenames for cache busting.
- **Code splitting / lazy loading** — Webpack's splitting enables lazy-loaded modules.
- **Asset management** — assets are processed and included via loaders/plugins.
- **Customization** — advanced users can extend the config.

**Customizing the config** — use `@angular-builders/custom-webpack` to extend or override the defaults:

```bash
npm install @angular-builders/custom-webpack --save-dev
```

```json
{
  "architect": {
    "build": {
      "builder": "@angular-builders/custom-webpack:browser",
      "options": {
        "customWebpackConfig": { "path": "./extra-webpack.config.js" }
      }
    }
  }
}
```

```typescript
const path = require('path');

module.exports = {
  resolve: {
    alias: {
      'my-alias': path.resolve(__dirname, 'src/my-custom-path')
    }
  }
};
```

The CLI also relies on **builders** (e.g., `@angular-devkit/build-angular`) defined in `angular.json` to drive the build process.

In short, Webpack bundles and optimizes assets, and Angular uses it under the hood via the CLI, with customization available through custom-webpack builders.

## What is Ivy in Angular, and what are its benefits?

**Ivy** is Angular's rendering engine and compiler, introduced in Angular 8 and the default since Angular 9 (replacing View Engine). It brings new optimizations for performance and efficiency.

**Benefits:**

- **Smaller bundles** — better tree shaking removes unused code, and Ivy generates more compact, optimized code.
- **Faster change detection** — Ivy's **incremental DOM** updates only the parts of the DOM that changed instead of recreating the view.
- **Improved build times** — a more efficient compiler speeds up builds and tests.
- **Enhanced debugging** — clearer error messages and better stack traces.
- **Compatibility** — backward compatible with existing apps and improved interoperability with libraries and third-party modules.
- **Simpler internals** — simplified components/directives and a more efficient template compiler that handles complex templates better.
- **Dynamic component loading** — improved support for dynamic and lazy-loaded components.

**Key features:** incremental DOM for efficient updates; the **R3 compiler** for stronger tree shaking; more efficient local views and directives; improved dynamic component creation; and more detailed error messages.

**Transition:** automatic for Angular 9+ (Ivy is the default); before 9, developers could manually opt in via project configuration.

In short, Ivy is a major architectural advance delivering smaller bundles, faster change detection, quicker builds, better debugging, and improved compatibility.
