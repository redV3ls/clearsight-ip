module.exports = {
  content: [
    "./src/**/*.ts",
    "./src/**/*.tsx",
    "./src/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#14b8a6',
        accent: '#14b8a6',
        background: '#0f172a',
        text: '#e2e8f0'
      }
    }
  },
  future: {
    hoverOnlyWhenSupported: true
  }
};

