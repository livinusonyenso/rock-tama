# Visual check: 2026-11-16T10-43-58

**Result:** FAIL · 13 passed · 1 failed · 0 incomplete · 0 info

Sections: carousel-focus-pause, carousel-swipe · Viewports: mobile 375px, desktop 1440px

> Automated checks catch overflow, loading, console and regression problems. Reference comparison sheets are indicative (the reference is a scaled mock) and must be reviewed by a person; passing checks are not proof of pixel-perfect accuracy.

| Scope | Check | Status | Detail |
|---|---|---|---|
| home @mobile 375px | fonts loaded | PASS | loaded |
| home @mobile 375px | images loaded | PASS |  |
| home @mobile 375px | no horizontal overflow | PASS |  |
| home @mobile 375px | no console errors | PASS |  |
| carousel-swipe @mobile 375px | horizontal swipe advances and vertical scrolling retained | PASS |  |
| carousel-swipe @mobile 375px | no horizontal overflow | PASS |  |
| carousel-swipe @mobile 375px | no console errors | PASS |  |
| home @desktop 1440px | fonts loaded | PASS | loaded |
| home @desktop 1440px | images loaded | PASS |  |
| home @desktop 1440px | no horizontal overflow | PASS |  |
| home @desktop 1440px | no console errors | PASS |  |
| carousel-focus-pause @desktop 1440px | focus pauses rotation | FAIL | got {"active":"<a class=\"inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-button font-semibold uppercase tracking-nav transition-[background-color,border-color,box-shadow,filter,translate] duration-150 ease-standard bg-gold-gradient text-ink-900 shadow-gold min-h-13 px-7 text-sm lg:px-8 lg:text-lg hover:shadow-gold-hover hover:brightness-105 focus-ring-dark hover:-translate-y-px active:translate-y-0 motion-reduce:hover:translate-y-0 \" href=\"/shop\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-shopping-cart size-5 shrink-0 lg:size-6\" aria-hidden=\"true\"><path d=\"m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18\"></path><path d=\"M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25\"></path><circle cx=\"18\" cy=\"20\" r=\"2\"></circle><circle cx=\"8\" cy=\"20\" r=\"2\"></circle></svg><span>Shop Now</span></a>","focused":false,"target":"<a class=\"inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-button font-semibold uppercase tracking-nav transition-[background-color,border-color,box-shadow,filter,translate] duration-150 ease-standard bg-gold-gradient text-ink-900 shadow-gold min-h-13 px-7 text-sm lg:px-8 lg:text-lg hover:shadow-gold-hover hover:brightness-105 focus-ring-dark hover:-translate-y-px active:translate-y-0 motion-reduce:hover:translate-y-0 \" href=\"/shop\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-shopping-cart size-5 shrink-0 lg:size-6\" aria-hidden=\"true\"><path d=\"m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18\"></path><path d=\"M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25\"></path><circle cx=\"18\" cy=\"20\" r=\"2\"></circle><circle cx=\"8\" cy=\"20\" r=\"2\"></circle></svg><span>Shop Now</span></a>"} |
| carousel-focus-pause @desktop 1440px | no horizontal overflow | PASS |  |
| carousel-focus-pause @desktop 1440px | no console errors | PASS |  |
