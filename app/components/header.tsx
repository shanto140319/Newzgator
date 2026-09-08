const categories = [
  "সর্বশেষ",
  "বাংলাদেশ",
  "বিশ্ব",
  "রাজনীতি",
  "অর্থনীতি",
  "খেলা",
  "প্রযুক্তি",
  "বিনোদন",
];

export function Header() {
  const today = new Intl.DateTimeFormat("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date());

  return (
    <header className="site-header">
      <div className="topline">
        <div className="container topline-inner">
          <span>বাংলাদেশ ও বিশ্বের নির্ভরযোগ্য সংবাদ</span>
          <time>{today}</time>
        </div>
      </div>

      <div className="container masthead">
        <a className="brand" href="#top" aria-label="নিউজগেটর হোম">
          <span className="brand-mark" aria-hidden="true">
            ন
          </span>
          <span>
            নিউজ<span>গেটর</span>
          </span>
        </a>
        <div className="masthead-note">
          <span className="masthead-rule" />
          সংবাদ, সংক্ষেপে
        </div>
      </div>

      <nav className="category-nav" aria-label="সংবাদ বিভাগ">
        <div className="container nav-scroll">
          {categories.map((category, index) => (
            <a
              key={category}
              className={index === 0 ? "active" : undefined}
              href="#latest-heading"
            >
              {category}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
