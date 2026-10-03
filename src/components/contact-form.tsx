"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fieldClass = "min-h-[52px] rounded-xl border border-foreground/20 bg-background px-4 text-base focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-lime/40 md:text-base";

export function ContactForm({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const sending = useRef(false);
  const action = `https://formsubmit.co/${email}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    for (const name of ["name", "email", "message"]) {
      const field = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;
      const value = String(fields.get(name) ?? "").trim();
      field.setCustomValidity(value ? "" : "Please fill in this field.");
      fields.set(name, value);
    }
    if (!form.reportValidity()) return;

    sending.current = true;
    setStatus("sending");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${email}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(fields)),
        credentials: "omit",
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || result?.success !== true && result?.success !== "true") throw new Error("Submission rejected");
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      clearTimeout(timeout);
      sending.current = false;
    }
  }

  return (
    <form action={action} method="POST" onSubmit={submit}
      onInput={(event) => {
        const field = event.target;
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.setCustomValidity("");
        if (status === "success") setStatus("idle");
      }} aria-label="Contact ZEN" aria-busy={status === "sending"}>
      <input type="hidden" name="_subject" value="New ZEN website enquiry" />
      <input type="hidden" name="_template" value="table" />
      <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <fieldset disabled={status === "sending"} className="space-y-6 disabled:opacity-70">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2.5">
            <Label htmlFor="contact-name" className="section-label">Name</Label>
            <Input id="contact-name" name="name" autoComplete="name" placeholder="Your name" maxLength={100} required className={fieldClass} />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="contact-email" className="section-label">Email</Label>
            <Input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" maxLength={254} required className={fieldClass} />
          </div>
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="contact-message" className="section-label">Message</Label>
          <textarea id="contact-message" name="message" placeholder="Tell us what you have in mind" rows={4} maxLength={5000} required
            className={`${fieldClass} block min-h-36 w-full resize-y py-3 outline-none transition-colors placeholder:text-muted-foreground`} />
        </div>
        <button type="submit" className="inline-flex min-h-[52px] w-full items-center justify-between gap-8 rounded-full bg-lime px-7 text-sm font-semibold text-ink outline-none transition-[filter] hover:brightness-95 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:cursor-wait sm:w-auto">
          {status === "sending" ? "Sending…" : "Send message"}
          <ArrowUpRight className="size-5" aria-hidden="true" />
        </button>
      </fieldset>
      <div className="section-meta mt-4 min-h-6" role="status" aria-live="polite" aria-atomic="true">
        {status === "success" && <p>Thanks! Your message has been submitted.</p>}
        {status === "error" && <p>We couldn’t send your message. Try again or <a href={`mailto:${email}`} className="font-medium underline underline-offset-4">email us</a>.</p>}
      </div>
    </form>
  );
}
