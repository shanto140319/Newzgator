"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main id="main-content" className="mx-auto max-w-xl p-12 text-center"><h1 className="text-2xl font-bold">সংবাদ আনা যায়নি</h1><p role="alert" className="my-4">একটু পর আবার চেষ্টা করুন।</p><button type="button" className="rounded border px-5 py-3" onClick={reset}>আবার চেষ্টা করুন</button></main>;
}
