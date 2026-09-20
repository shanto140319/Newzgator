import Link from "next/link";
export function Footer() {
  return (
    <footer className="bg-[#0c1c34] text-white dark:bg-[#070b11] reading:bg-[#514438]">
      <div className="mx-auto flex w-[min(1240px,calc(100%-48px))] items-end justify-between gap-10 py-12 max-sm:block max-sm:w-[calc(100%-30px)] max-sm:py-10">
        <div>
          <Link
            className="inline-flex items-center gap-2.5 text-2xl leading-none font-extrabold tracking-[-0.035em]"
            href="/"
          >
            <span
              className="grid size-9 -rotate-3 place-items-center rounded-[11px_11px_4px_11px] bg-[#e9482b] text-lg font-extrabold text-white"
              aria-hidden="true"
            >
              ন
            </span>
            <span>
              নিউজ<span className="text-[#e9482b] reading:text-[#ffad92]">গেটর</span>
            </span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-400 reading:text-[#d6c8b5]">
            দেশ ও বিশ্বের গুরুত্বপূর্ণ সংবাদ এক পাতায়, সহজে ও দ্রুত।
          </p>
        </div>
        <div className="flex gap-6 text-sm font-semibold text-slate-300 max-sm:mt-8 max-sm:flex-wrap reading:text-[#eee4d3]">
          <Link className="hover:text-white" href="/">
            সর্বশেষ
          </Link>
          <Link className="hover:text-white" href="mailto:hello@newsgator.news">
            যোগাযোগ
          </Link>
          <Link className="hover:text-white" href="#top">
            উপরে যান ↑
          </Link>
        </div>
      </div>
      <div className="mx-auto flex w-[min(1240px,calc(100%-48px))] justify-between gap-6 border-t border-white/10 py-4 text-xs text-slate-400 max-sm:grid max-sm:w-[calc(100%-30px)] max-sm:gap-0.5 reading:text-[#d6c8b5]">
        <span>© {new Date().getFullYear()} নিউজগেটর</span>
        <span>খবরের স্বত্ব সংশ্লিষ্ট প্রকাশকের</span>
      </div>
    </footer>
  );
}
