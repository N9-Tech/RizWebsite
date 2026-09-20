export interface Project {
  slug: string;
  title: string;
  summary: string;
  description: string;
  year?: string;
  categories: string[];
  stack: string[];
  visual: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  decisions: string[];
  reliability: string[];
  links?: { live?: string; github?: string };
}

export const projects: Project[] = [
  {
    slug: "web-product",
    title: "Web product system",
    summary: "A deployed product spanning interface, application logic, data and operations.",
    description: "A representative case-study shell for a public web product. Replace this placeholder record with a project that can be discussed publicly.",
    categories: ["Product", "Web"],
    stack: ["Next.js", "TypeScript", "API", "Database"],
    visual: "/images/project-web.svg",
    challenge: "Keep the user-facing workflow simple while preserving robust state, validation and operational visibility.",
    solution: "Separate content, application rules and infrastructure concerns; make failure states explicit and test the full input-to-output flow.",
    decisions: ["Data-driven UI boundaries", "Server-side validation", "Observable failure states", "Deployment-aware architecture"],
    reliability: ["Empty and partial states", "Failed requests", "Duplicate actions", "Slow network", "Route recovery"]
  },
  {
    slug: "android-automation",
    title: "Android automation",
    summary: "Background automation built around recovery, timing and observable state.",
    description: "A representative shell for an Android control/automation project with reliability-oriented background logic.",
    categories: ["Android", "Automation"],
    stack: ["Android", "Kotlin/Java", "Background services", "Device automation"],
    visual: "/images/project-android.svg",
    challenge: "Automation has to recover when timing, process state and foreground assumptions stop being ideal.",
    solution: "Model launch and recovery as explicit states, centralise timing rules and keep fallbacks independent from the happy path.",
    decisions: ["Single-lane action queue", "Recovery state machine", "Bounded retries", "User-visible status"],
    reliability: ["Process restarts", "Stale state", "Timeouts", "Rapid repeated events", "Background restrictions"]
  },
  {
    slug: "interactive-systems",
    title: "Interactive systems",
    summary: "Game and tooling systems where automation, state and interaction meet.",
    description: "A public-facing case-study shell for interactive/game tooling without exposing private scripts or implementation details.",
    categories: ["Interactive", "Tooling"],
    stack: ["Luau", "Roblox", "Automation", "State systems"],
    visual: "/images/project-interactive.svg",
    challenge: "Coordinate changing world state, timing-sensitive actions and user controls without brittle behaviour.",
    solution: "Keep world observation, decisions and actions separate, with conservative scheduling and explicit fallbacks.",
    decisions: ["State-driven actions", "Protected user controls", "Server-aware timing", "Bounded work loops"],
    reliability: ["Missing targets", "World transitions", "State drift", "Capacity limits", "Rejoin recovery"]
  },
  {
    slug: "infrastructure",
    title: "Deployment infrastructure",
    summary: "Servers, delivery pipelines and services designed to stay understandable in production.",
    description: "A representative infrastructure case study covering deployment, hosting, reverse proxying, queues and observability.",
    categories: ["Infrastructure", "Delivery"],
    stack: ["Linux", "Nginx", "Cloudflare", "GitHub Actions"],
    visual: "/images/project-infra.svg",
    challenge: "Create a deployment path that is easy to operate, recover and upgrade without hiding the moving parts.",
    solution: "Prefer boring, observable infrastructure with explicit health, logs and repeatable deployment mechanics.",
    decisions: ["Simple service boundaries", "Automated deploy checks", "Reverse-proxy separation", "Upgrade path documented"],
    reliability: ["Rollback", "Disk pressure", "Service restart", "Certificate renewal", "Deployment failure"]
  },
  {
    slug: "ai-engineering",
    title: "AI-assisted engineering",
    summary: "Agent acceleration inside a review, test and verification discipline.",
    description: "A representative case study for agent-assisted development where the agent accelerates implementation without owning final technical judgement.",
    categories: ["AI", "Engineering"],
    stack: ["Coding agents", "Git", "CI", "Automated tests"],
    visual: "/images/project-ai.svg",
    challenge: "Get the speed benefit of coding agents without turning generated output into unreviewed product code.",
    solution: "Decompose work, constrain context, review whole-file behaviour, trace failure paths and require executable checks before shipping.",
    decisions: ["Spec-first tasks", "Independent review pass", "Repeatable checks", "Human release gate"],
    reliability: ["Agent assumptions", "Stale context", "Partial changes", "Hidden regressions", "Unverified claims"]
  }
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}