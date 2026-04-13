// cypress/support/commands.ts
//
// 📌 KAVRAM: Custom Cypress Command nedir?
// cy.visit(), cy.get() gibi built-in komutlara ek olarak
// kendi komutlarını tanımlayabilirsin.
//
// Örnek kullanım yeri: cy.navigateToWorkout()
// Avantajı: Aynı adım birden fazla testte tekrarlanıyorsa
// tek yerden yönetilir. DRY prensibi.

// TypeScript için type genişletme
declare namespace Cypress {
  interface Chainable {
    /**
     * Antrenman tabına navigate eder
     * @example cy.navigateToWorkout()
     */
    navigateToWorkout(): Chainable<void>;
  }
}

// Custom command tanımı
Cypress.Commands.add("navigateToWorkout", () => {
  cy.get('[data-testid="tab-workout"]').click();
  // Sayfanın yüklenmesini bekle
  cy.contains("Antrenman").should("be.visible");
});
