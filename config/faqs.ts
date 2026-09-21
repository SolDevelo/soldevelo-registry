// Home page FAQs. Plain data so the section and the page's FAQPage JSON-LD read
// from one source and cannot drift. Backticked spans render as inline code.
export type Faq = { question: string; answer: string }

export const FAQS: Faq[] = [
  {
    question: "How do I install an item?",
    answer:
      "Register the `@soldevelo` namespace once in your project's `components.json`, then run `shadcn add` with the item name. The CLI writes the source into your repository along with the shadcn components it depends on.",
  },
  {
    question: "Do I need to install a package?",
    answer:
      "No. There is no wrapper package and no runtime dependency on this site. The CLI copies readable source into your repository, and from that point it is ordinary code in your project.",
  },
  {
    question:
      "What is the difference between a component, a block and a template?",
    answer:
      "A component is one primitive that renders a domain value consistently. A block is a complete screen region such as a table or a filter bar. A template is a whole page, shipped with editable copies of every section it is built from.",
  },
  {
    question: "Why is every item prefixed with a project name?",
    answer:
      "The registry publishes for several open-source projects, so the prefix keeps two of them from colliding on a name. Each item also declares `meta.project`, and the build rejects a name that disagrees with it.",
  },
  {
    question: "Will an item match my own theme?",
    answer:
      "Items style themselves with semantic tokens rather than raw colours, so they pick up your palette. Where an item uses a token this registry adds, such as `success` or `warning`, it ships that token and applies it additively without overwriting your values.",
  },
  {
    question: "Does it work with any shadcn setup?",
    answer:
      "It needs React 19, Tailwind CSS v4, and a `base-*` style in `components.json`, which is the `shadcn init` default. The legacy `new-york` and `radix-*` styles install Radix primitives, which reject the `render` prop some items use.",
  },
  {
    question: "Can I add an item for my own project?",
    answer:
      "Yes. The registry and this site are open source. Add your project to the config, drop the source into the matching folder, declare the item, and open a pull request.",
  },
]
