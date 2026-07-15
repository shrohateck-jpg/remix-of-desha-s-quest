import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Shield } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

export const Route = createFileRoute("/_authenticated/privacy")({
  head: () => ({ meta: [{ title: "سياسة الخصوصية — ديشا" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { dir } = useLang();
  const ar = dir === "rtl";
  const sections = ar ? [
    ["البيانات التي نستخدمها", "نستخدم بيانات حسابك والتحديات التي تنشئها وصور الإثبات التي ترفعها لتقديم تجربة ديشا والتحقق من إنجاز التحديات."],
    ["كيف نستخدم البيانات", "تُستخدم البيانات لتشغيل الحساب، حساب النقاط والمستويات، عرض سجلك، وتحليل دليل الصورة الخاص بالتحدي."],
    ["الصور والذكاء الاصطناعي", "قد تُحلل صور الإثبات آلياً لتقييم علاقتها بالتحدي. تجنب رفع صور تحتوي على معلومات حساسة أو أشخاص دون موافقتهم."],
    ["التحكم في بياناتك", "يمكنك تسجيل الخروج أو حذف حسابك وبياناته من الإعدادات. بعض السجلات قد تُحتفظ بها إذا كان ذلك مطلوباً للأمان أو الالتزامات القانونية."],
  ] : [
    ["Data we use", "We use your account data, challenges, and uploaded proof images to provide DESHA and verify challenge completion."],
    ["How data is used", "Data powers your account, points, levels, history, and the analysis of challenge proof images."],
    ["Images and AI", "Proof images may be analyzed automatically for relevance to your challenge. Avoid sensitive content or people who have not consented."],
    ["Your controls", "You can sign out or delete your account and associated data from Settings. Limited records may be retained for security or legal obligations."],
  ];
  return <LegalLayout title={ar ? "سياسة الخصوصية" : "Privacy Policy"} intro={ar ? "هذه معلومات عامة توضح طريقة تعامل ديشا مع بياناتك، وليست استشارة قانونية." : "This general template explains how DESHA handles data and is not legal advice."} sections={sections} back={ar ? "العودة للإعدادات" : "Back to Settings"} />;
}

export function LegalLayout({ title, intro, sections, back }: { title: string; intro: string; sections: string[][]; back: string }) {
  return <article className="flex flex-col gap-6"><Link to="/settings" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"><ArrowRight size={17} className="ltr:rotate-180" />{back}</Link><header className="glass rounded-3xl p-6 md:p-8"><span className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary-glow"><Shield size={22} /></span><h1 className="font-display mt-5 text-4xl font-black">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{intro}</p></header><div className="glass flex flex-col gap-7 rounded-3xl p-6 md:p-8">{sections.map(([heading, body]) => <section key={heading}><h2 className="text-lg font-black">{heading}</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p></section>)}</div></article>;
}
