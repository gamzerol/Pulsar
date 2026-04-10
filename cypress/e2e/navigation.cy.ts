/// <reference types="cypress" />

// E2E test: Tab navigasyonu
describe("Alt navigasyon", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("sayfa yüklenince Home görünür", () => {
    cy.contains("Pulsar").should("exist");
  });

  it("Antrenman tabına tıklanınca WorkoutPage açılır", () => {
    cy.get('[data-testid="tab-workout"]').click();
    cy.contains("Antrenman").should("be.visible");
  });
});
