import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LangProvider } from "@/contexts/LangContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AudioProvider } from "@/contexts/AudioContext";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-glow">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">الصفحة دي مش موجودة 😅</h2>
        <p className="mt-2 text-sm text-muted-foreground">يمكن اتمسحت أو إنت كتبت اللينك غلط... بيحصل.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="gradient-magic glow inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-primary-foreground"
          >
            ارجع للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">الصفحة معملتش تحميل</h1>
        <p className="mt-2 text-sm text-muted-foreground">حصلت مشكلة عندنا. جرب تعمل تحديث أو ارجع للرئيسية.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="gradient-magic inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-primary-foreground"
          >
            جرب تاني
          </button>
          <a
            href="/"
            className="glass inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-foreground"
          >
            الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "ديشا — لعبة الإنتاجية الشريرة 😈" },
      { name: "description", content: "حوّل مهامك لتحديات، وخلي ديشا يحكم عليك بالصور." },
      { name: "author", content: "DESHA" },
      { property: "og:title", content: "ديشا — لعبة الإنتاجية الشريرة 😈" },
      { property: "og:description", content: "حوّل مهامك لتحديات، وخلي ديشا يحكم عليك بالصور." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#17111f" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/o4czYmHwtDbZ7OW5bLlSP3diOxZ2/social-images/social-1783874774306-ChatGPT_Image_Jul_12,_2026,_07_45_22_PM.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Changa:wght@500;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <ThemeProvider>
      <LangProvider>
        <AudioProvider>
          <QueryClientProvider client={queryClient}>
            <Outlet />
          </QueryClientProvider>
        </AudioProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
