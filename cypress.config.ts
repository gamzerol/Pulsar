import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 390,
    viewportHeight: 844,
    supportFile: "cypress/support/e2e.ts",
    fixturesFolder: "cypress/fixtures",
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx}",
    video: false,
    screenshotOnRunFailure: true,
  },
});
