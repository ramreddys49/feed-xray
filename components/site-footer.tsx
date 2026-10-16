import { footerNav, SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer
      id="about-this-project"
      className="mt-auto border-t border-white/8 bg-black/25 px-4 py-6 md:px-6 lg:px-8"
    >
      <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-slate-100">{SITE.name}</p>
          <p className="mt-1 text-sm leading-6 text-slate-400">{SITE.about}</p>
          <p className="mt-2 text-[11px] leading-5 text-slate-500">{SITE.fictionalNotice}</p>
        </div>
        <nav aria-label="Project" className="flex flex-wrap gap-3 text-sm">
          {footerNav().map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-cyan-100/90 underline-offset-2 hover:underline"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
