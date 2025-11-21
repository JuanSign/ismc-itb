import localFont from "next/font/local";

export const gigaSans = localFont({
  src: [
    {
      path: "../../public/fonts/GigaSans-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-giga-sans",
  display: "swap",
});

export const poppins = localFont({
  src: [
    {
      path: "../../public/fonts/Poppins-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Poppins-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
  display: "swap",
});