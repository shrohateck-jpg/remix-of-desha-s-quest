import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/contexts/LangContext";
import { LegalLayout } from "./privacy";

export const Route = createFileRoute("/_authenticated/terms")({
  head: () => ({ meta: [{ title: "الشروط والأحكام — ديشا" }] }),
  component: TermsPage,
});

function TermsPage() {
  const { dir } = useLang();
  const ar = dir === "rtl";
  const sections = ar ? [
    ["استخدام الخدمة", "استخدم ديشا بطريقة قانونية وآمنة. أنت مسؤول عن التحديات والمحتوى والصور التي ترفعها."],
    ["الحساب", "حافظ على أمان بيانات الدخول وأبلغنا عن أي استخدام غير مصرح به. لا يجوز انتحال شخصية الآخرين."],
    ["النتائج الآلية", "تقييم الصور آلي وقد لا يكون دقيقاً دائماً. النتيجة جزء من تجربة اللعبة وليست حكماً مهنياً أو قانونياً."],
    ["التغييرات والتوفر", "قد تتغير الميزات أو تتوقف مؤقتاً للصيانة. سنسعى لتقديم تجربة مستقرة دون ضمان توفرها بلا انقطاع."],
  ] : [
    ["Using the service", "Use DESHA lawfully and safely. You are responsible for the challenges, content, and images you submit."],
    ["Your account", "Keep your sign-in details secure and report unauthorized use. You may not impersonate others."],
    ["Automated results", "Image assessment is automated and may not always be accurate. Results are part of the game, not professional or legal judgments."],
    ["Changes and availability", "Features may change or pause for maintenance. We aim for reliability but cannot guarantee uninterrupted availability."],
  ];
  return <LegalLayout title={ar ? "الشروط والأحكام" : "Terms of Use"} intro={ar ? "نموذج معلومات عام يوضح قواعد استخدام ديشا، وليس استشارة قانونية." : "A general informational template describing the rules for using DESHA; it is not legal advice."} sections={sections} back={ar ? "العودة للإعدادات" : "Back to Settings"} />;
}
