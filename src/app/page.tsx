import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Services } from "@/components/sections/services";
import { WhyUs } from "@/components/sections/why-us";
import { Capabilities } from "@/components/sections/capabilities";
import { AiChatbots } from "@/components/sections/ai-chatbots";
import { CtaBand } from "@/components/sections/cta-band";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <div className="about-services-stack">
          <div className="about-scroll-track">
            <About>
              <Capabilities />
            </About>
          </div>
          <Services />
        </div>
        <WhyUs />
        <CtaBand />
        <AiChatbots />
      </main>
      <SiteFooter />
    </div>
  );
}
