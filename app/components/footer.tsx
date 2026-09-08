export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <div>
          <a className="brand footer-brand" href="#top">
            <span className="brand-mark" aria-hidden="true">
              ন
            </span>
            <span>
              নিউজ<span>গেটর</span>
            </span>
          </a>
          <p>দেশ ও বিশ্বের গুরুত্বপূর্ণ সংবাদ এক পাতায়, সহজে ও দ্রুত।</p>
        </div>
        <div className="footer-links" aria-label="ফুটার লিংক">
          <a href="#latest-heading">সর্বশেষ</a>
          <a href="mailto:hello@newsgator.news">যোগাযোগ</a>
          <a href="#top">উপরে যান ↑</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} নিউজগেটর</span>
        <span>খবরের স্বত্ব সংশ্লিষ্ট প্রকাশকের</span>
      </div>
    </footer>
  );
}
