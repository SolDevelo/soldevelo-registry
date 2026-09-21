"use client"

import { MessageCircleQuestionMarkIcon } from "lucide-react"
import { motion, type Variants } from "motion/react"

import { withInlineCode } from "@/components/mono"
import { SectionEyebrow } from "@/components/section-eyebrow"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FAQS } from "@/config/faqs"

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

const rise: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease },
  },
}

export function RegistryFaqs() {
  return (
    <section
      aria-labelledby="faqs-heading"
      className="mx-auto w-full max-w-2xl"
    >
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } },
        }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <motion.div variants={rise}>
          <SectionEyebrow
            mark={
              <MessageCircleQuestionMarkIcon
                className="size-4"
                aria-hidden="true"
              />
            }
            lead="Before You"
            emphasis="Install"
          />
        </motion.div>

        <motion.h2
          variants={rise}
          id="faqs-heading"
          className="font-heading text-3xl font-medium tracking-tighter text-balance sm:text-4xl"
        >
          Questions, Answered
        </motion.h2>

        <motion.p
          variants={rise}
          className="max-w-md text-pretty text-muted-foreground"
        >
          What the CLI writes, how naming works, and what happens to your theme.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease, delay: 0.15 }}
        className="mt-10"
      >
        <Accordion defaultValue={[FAQS[0].question]}>
          {FAQS.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger className="py-4">
                <span className="text-left text-sm font-medium sm:text-base">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <span className="block text-sm leading-relaxed text-muted-foreground">
                  {withInlineCode(faq.answer)}
                </span>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  )
}
