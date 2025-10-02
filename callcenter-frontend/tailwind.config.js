/**
 * Tailwind CSS configuration for the call center frontend.
 *
 * This file tells Tailwind where to look for class names and enables
 * basic theme customizations. If you add new directories for pages or
 * components, be sure to include them in the `content` array.
 */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};