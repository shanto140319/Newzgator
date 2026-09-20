import Link from "next/link";
export default function NotFound() {
  return <main id="main-content" className="mx-auto max-w-xl p-12 text-center"><h1 className="text-2xl font-bold">সংবাদ পাওয়া যায়নি</h1><Link href="/" className="mt-6 inline-block underline">সব খবরে ফিরুন</Link></main>;
}
