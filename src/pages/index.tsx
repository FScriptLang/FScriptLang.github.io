import React, {useState} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './index.module.css';

type DemoKey = 'script' | 'interpret' | 'compile' | 'dotnet' | 'javascript';

const demos: Record<DemoKey, {label: string; filename: string; language: string; code: string}> = {
  script: {
    label: 'The script',
    filename: 'pricing.fss',
    language: 'FScript',
    code: `type Customer =
  { Name: string
    Plan: string
    Seats: int }

export let quote (customer: Customer) =
  let basePrice =
    match customer.Plan with
    | "scale" -> 29
    | "team" -> 19
    | _ -> 9

  basePrice * customer.Seats`,
  },
  interpret: {
    label: 'Interpreter',
    filename: 'terminal',
    language: 'Shell',
    code: `# Learn with the interactive REPL
fscript

# Run a source file without a build step
fscript pricing.fss

# Select permissions for effectful scripts (Next)
fscript --permissions IO report.fss

# Keep repeatable settings in fscript.toml`,
  },
  compile: {
    label: 'Compiler',
    filename: 'terminal',
    language: 'Shell',
    code: `# Iterate with the interpreter
fscript pricing.fss

# Build an optimized .NET assembly
fscript compile pricing.fss --target dotnet \\
  --output out/pricing
dotnet out/pricing/pricing.dll

# Publish a native executable for this platform
fscript compile pricing.fss --target dotnet \\
  --aot --output out/pricing-native

# Or generate a buildable C# project
fscript compile pricing.fss --target csharp \\
  --output out/pricing-csharp`,
  },
  dotnet: {
    label: 'Embedded .NET',
    filename: 'Pricing.fs',
    language: 'F#',
    code: `open System.IO
open FScript.Language
open FScript.Runtime

let source = File.ReadAllText "pricing.fss"
let externs = Registry.all hostContext
let pricing = ScriptHost.loadSource externs source

let customer =
  VRecord (Map.ofList
    [ "Name", VString "Acme"
      "Plan", VString "scale"
      "Seats", VInt 12L ])

let total =
  ScriptHost.invoke pricing "quote" [ customer ]
// Change the rule. Keep the host.`,
  },
  javascript: {
    label: 'Embedded JS',
    filename: 'pricing.mjs',
    language: 'JavaScript',
    code: `import { load, invoke } from
  "@magnusopera/fscript";

const pricing = load(source);

const total = invoke(pricing, "quote", [{
  Name: "Acme",
  Plan: "scale",
  Seats: 12
}]);

// The language runs inside your process.`,
  },
};

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function DemoWindow() {
  const [activeDemo, setActiveDemo] = useState<DemoKey>('script');
  const demo = demos[activeDemo];

  return (
    <div className={styles.demoWindow}>
      <div className={styles.windowBar}>
        <div className={styles.windowDots} aria-hidden="true"><i /><i /><i /></div>
        <span className={styles.windowTitle}>{demo.filename}</span>
        <span className={styles.liveBadge}><i /> {activeDemo === 'script' ? 'source' : activeDemo === 'compile' ? 'standalone' : activeDemo === 'interpret' ? 'CLI' : 'in-process'}</span>
      </div>
      <div className={styles.demoTabs} role="tablist" aria-label="Interpret, compile, or embed FScript">
        {(Object.keys(demos) as DemoKey[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={activeDemo === key}
            className={activeDemo === key ? styles.demoTabActive : styles.demoTab}
            onClick={() => setActiveDemo(key)}>
            {demos[key].label}
          </button>
        ))}
      </div>
      <div className={styles.codeArea}>
        <div className={styles.lineNumbers} aria-hidden="true">
          {demo.code.split('\n').map((_, index) => <span key={index}>{index + 1}</span>)}
        </div>
        <pre><code>{demo.code}</code></pre>
      </div>
      <div className={styles.windowFooter}>
        <span><i className={styles.statusDot} /> type checked</span>
        <span>{demo.language}</span>
      </div>
    </div>
  );
}

function HomepageHeader() {
  const mascot = useBaseUrl('/img/logo.svg');

  return (
    <header className={styles.hero}>
      <div className={styles.heroGrid} aria-hidden="true" />
      <div className={styles.orbOne} aria-hidden="true" />
      <div className={styles.orbTwo} aria-hidden="true" />
      <div className={`container ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><span>Open source</span> · Interpret · Compile · Embed</div>
          <Heading as="h1" className={styles.heroTitle}>
            Interpret. Compile.<br /><em>Embed.</em>
          </Heading>
          <p className={styles.heroLead}>
            FScript is a typed, functional scripting language for standalone programs and application scripting.
            Start with the interpreter, compile for optimized .NET and native execution,
            or embed scripts in an application that controls their APIs and resources.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} to="/sandbox">
              Try FScript <Arrow />
            </Link>
            <Link className={styles.secondaryAction} to="/manual/next/learn/quickstart">
              Get started
            </Link>
          </div>
          <div className={styles.installLine}>
            <span className={styles.prompt}>$</span>
            <code>dotnet tool install --global MagnusOpera.FScript</code>
          </div>
          <div className={styles.heroProof}>
            <span>Static type inference</span>
            <span>.NET &amp; JavaScript embedding</span>
            <span>Typed host APIs</span>
            <span>Optimized compilation</span>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.mascotMark}>
            <img src={mascot} alt="" width="92" height="92" />
            <span>YOUR CODE</span>
          </div>
          <DemoWindow />
        </div>
      </div>
      <div className={styles.heroTicker} aria-label="How FScript runs">
        <div>
          <span>INTERPRETER</span><i>✦</i><span>COMPILE .NET</span><i>✦</i><span>PUBLISH NATIVE AOT</span><i>✦</i>
          <span>EMBED IN .NET</span><i>✦</i><span>EMBED IN JAVASCRIPT</span><i>✦</i>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <Layout
      title="FScript: Interpret. Compile. Embed."
      description="FScript is a typed, functional scripting language for standalone programs and application scripting. Learn with the interpreter, compile for performance, or embed scripts under application control.">
      <HomepageHeader />
      <main className={styles.main}>
        <section className={styles.workflowScene} aria-label="Three ways to use FScript">
          <div className={`container ${styles.workflowGrid}`}>
            <div>
              <p className={styles.sectionLabel}>Interpreter</p>
              <Heading as="h2" id="run-scripts">Learn it. Run it.</Heading>
              <p>
                Start here to get used to the language. Explore expressions in the REPL, automate
                everyday tasks, and run <code>fscript program.fss</code> without a build step.
                Static type inference checks source before execution.
              </p>
              <p>
                In Next, execution starts with no permissions. Choose grants, providers, and a
                filesystem root through CLI options or <code>fscript.toml</code> as your script grows.
              </p>
              <Link className={styles.inlineLink} to="/manual/next/interpreter/overview">Use the interpreter <Arrow /></Link>
              <Link className={styles.inlineLink} to="/manual/next/interpreter/configuration-and-permissions">Configure execution <Arrow /></Link>
            </div>
            <div>
              <p className={styles.sectionLabel}>Compiler</p>
              <Heading as="h2">Optimize. Distribute.</Heading>
              <p>
                Compile working scripts for performance and standalone deployment. Build optimized
                .NET assemblies, self-contained executables, native AOT binaries, or a C# project.
                Generated programs run without an FScript interpreter.
              </p>
              <p>
                Set build and publishing defaults in <code>fscript.toml</code>. The .NET compiler
                specializes functions and fuses eligible pipelines; generated programs run with OS permissions.
              </p>
              <Link className={styles.inlineLink} to="/manual/next/compiler/overview">Use the compiler <Arrow /></Link>
              <Link className={styles.inlineLink} to="/manual/next/compiler/optimizations">Explore the optimizations <Arrow /></Link>
            </div>
            <div>
              <p className={styles.sectionLabel}>Embedded</p>
              <Heading as="h2">Put your app in control.</Heading>
              <p>
                Load scripts through a .NET or JavaScript host API, inspect exported types, and invoke
                rules inside your application. Update pricing, policies, or workflows without rebuilding
                the host application.
              </p>
              <p>
                The host owns typed APIs, source resolution, lifecycle, and resource policy.
                .NET hosts explicitly grant capabilities; optional configuration can narrow those grants.
              </p>
              <Link className={styles.inlineLink} to="/manual/next/embedding/overview">Embed FScript <Arrow /></Link>
              <Link className={styles.inlineLink} to="/manual/next/embedding/host-permissions">Control host permissions <Arrow /></Link>
            </div>
          </div>
        </section>

        <section className={styles.languageScene}>
          <div className={`container ${styles.sceneIntro}`}>
            <p className={styles.sectionLabel}>Language lineage</p>
            <Heading as="h2">Name the thing.<br /><em>Or just ask for its shape.</em></Heading>
            <div className={styles.sceneSummary}>
              <p className={styles.sceneLead}>
                FScript keeps the part of the ML family that makes programs pleasant to reason about: inferred
                types, immutable data, unions, curried functions, and pattern matching. Then it adds a useful choice.
                A record can carry a domain name, or a function can accept any value with the fields it needs.
              </p>
              <Link className={styles.inlineLink} to="/manual/learn/language-tour">Meet the language <Arrow /></Link>
            </div>
          </div>
        </section>

        <section className={styles.javascriptScene}>
          <div className={`container ${styles.javascriptGrid}`}>
            <div className={styles.browserStage} aria-label="FScript running in a browser">
              <div className={styles.browserChrome}><i /><i /><i /><span>app.example / live-pricing</span></div>
              <div className={styles.browserBody}>
                <div className={styles.browserEditor}>
                  <span>rules/discount.fss · loaded</span>
                  <pre><code>{`let discount customer =
  match customer.Plan with
  | "scale" -> 20
  | "team"  -> 10
  | _       -> 0`}</code></pre>
                </div>
                <div className={styles.browserResult}>
                  <span>TYPE</span><code>Customer → int</code>
                  <span>RESULT</span><strong>20</strong>
                </div>
              </div>
              <div className={styles.browserStatus}><span><i /> checked in this tab</span><span>npm · ESM</span></div>
            </div>
            <div className={styles.javascriptCopy}>
              <p className={styles.sectionLabel}>JavaScript support</p>
              <Heading as="h2">Ship the app. Change the rules while it runs.</Heading>
              <p>
                FScript is an npm package for browsers and Node. Keep pricing, eligibility, feature decisions, or
                customer-specific policy outside the application bundle. Fetch a rule when you need it, check its
                types, and call its exported functions from JavaScript.
              </p>
              <p>
                The host supplies typed operations and decides where rule files come from. A new rule can take effect
                without rebuilding the interface or restarting the process. The application keeps running; the part
                you meant to make configurable is free to change.
              </p>
              <Link className={styles.inlineLink} to="/manual/next/embedding/fable-javascript">Load rules from JavaScript <Arrow /></Link>
            </div>
          </div>
        </section>

        <section className={styles.finalLinks}>
          <div className={`container ${styles.finalLinksInner}`}>
            <p>FScript is open source.</p>
            <nav aria-label="Start using FScript">
              <Link to="/sandbox">Open the sandbox</Link>
              <Link to="/manual/next/learn/quickstart">Install and run</Link>
              <Link to="/manual/next/interpreter/overview">Use the interpreter</Link>
              <Link to="/manual/next/compiler/overview">Compile a program</Link>
              <Link to="/manual/next/embedding/overview">Embed FScript</Link>
              <a href="https://github.com/FScriptLang/FScript">GitHub <Arrow /></a>
            </nav>
          </div>
        </section>
      </main>
    </Layout>
  );
}
