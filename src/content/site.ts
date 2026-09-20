export const site = {
  name: "theace9",
  role: "Software Engineer / AI-Assisted Developer",
  location: "Manchester, UK",
  intro: "Products, automation, infrastructure and intelligent workflows — engineered from prototype to production.",
  email: "",
  github: "",
  linkedin: "",
  availability: false,
} as const;

export const capabilities = [
  { id: "product", index: "01", title: "Product Engineering", detail: "Interfaces, application logic and product systems designed to survive real use." },
  { id: "backend", index: "02", title: "Web & Backend", detail: "APIs, dashboards, databases, integrations and the application layer between them." },
  { id: "automation", index: "03", title: "Automation", detail: "Reliable workflows that remove repetitive mechanics while keeping failure states visible." },
  { id: "ai", index: "04", title: "AI-Assisted Systems", detail: "Coding agents used for leverage inside a deliberate architecture, review and verification loop." },
  { id: "infra", index: "05", title: "Infrastructure & Deployment", detail: "Linux, Nginx, Cloudflare, CI/CD and operational paths from commit to production." },
  { id: "interactive", index: "06", title: "Game & Interactive Tooling", detail: "Automation and interactive systems built with the same reliability discipline as product software." },
] as const;

export const stackLayers = [
  { layer: "INTERFACE", tech: ["React", "Next.js", "TypeScript", "Tailwind", "Three.js"] },
  { layer: "APPLICATION", tech: ["Node.js", "PHP", "REST APIs"] },
  { layer: "SERVICES", tech: ["Integrations", "Queues", "Workers"] },
  { layer: "DATA", tech: ["MySQL", "PostgreSQL", "Redis"] },
  { layer: "AUTOMATION", tech: ["AI agents", "Testing loops", "Structured prompting"] },
  { layer: "INFRASTRUCTURE", tech: ["Linux", "Nginx", "CloudPanel", "Cloudflare"] },
  { layer: "DELIVERY", tech: ["GitHub Actions", "VPS / dedicated", "Observability"] },
] as const;

export const principles = [
  ["01", "Understand the failure modes", "A feature is not finished because the happy path works."],
  ["02", "Keep systems observable", "Logs, states and failures should explain what the system is doing."],
  ["03", "Automate repetitive work", "Human attention belongs on decisions, not repeatable mechanics."],
  ["04", "Use AI for leverage, not blind trust", "Generated code still needs architecture, review and verification."],
] as const;