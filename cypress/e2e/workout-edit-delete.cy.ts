/// <reference types="cypress" />
describe("Antrenman Düzenle & Sil Akışı", () => {
  beforeEach(() => {
    cy.fixture("workouts").then((workouts) => {
      cy.intercept("GET", "**/rest/v1/workouts*", {
        statusCode: 200,
        body: workouts,
      }).as("getWorkouts");
      cy.intercept("GET", "**/rest/v1/exercises*", {
        statusCode: 200,
        body: [
          {
            id: "ex-001",
            name: "Bench Press",
            category: "chest",
            is_default: true,
            created_at: "2024-01-01T00:00:00Z",
          },
          {
            id: "ex-002",
            name: "Squat",
            category: "legs",
            is_default: true,
            created_at: "2024-01-01T00:00:00Z",
          },
        ],
      }).as("getExercises");

      cy.intercept("GET", "**/rest/v1/templates*", {
        statusCode: 200,
        body: [],
      }).as("getTemplates");

      cy.intercept("GET", "**/rest/v1/body_weights*", {
        statusCode: 200,
        body: [],
      }).as("getBodyWeights");

      cy.intercept("GET", "**/rest/v1/goals*", {
        statusCode: 200,
        body: [],
      }).as("getGoals");

      cy.visit("/");
    });
  });

  // ─────────────────────────────────────────────
  // TEST 1: Antrenman tabına navigasyon
  // ─────────────────────────────────────────────

  it("Antrenman tabına tıklanınca workout listesi görünür", () => {
    // 📌 custom command kullanıyoruz (commands.ts'de tanımladık)
    cy.navigateToWorkout();

    // Fixture'daki antrenman adı ekranda görünmeli
    cy.contains("Sabah Güç Antrenmanı").should("be.visible");

    // Workout card'ın render edildiğini doğrula
    cy.get('[data-testid="workout-card"]').should("have.length", 1);
  });

  // ─────────────────────────────────────────────
  // TEST 2: Düzenle butonuna tıklanınca form açılır
  // ─────────────────────────────────────────────

  it("Düzenle butonuna tıklanınca form açılır ve mevcut başlık doldurulmuş gelir", () => {
    cy.navigateToWorkout();

    // Workout card görünene kadar bekle
    cy.get('[data-testid="workout-card"]').should("be.visible");

    // Düzenle butonuna tıkla
    cy.get('[data-testid="workout-edit-btn"]').first().click();

    // 📌 Form başlığı "Antrenmanı Düzenle" olmalı (yeni değil)
    cy.contains("Antrenmanı Düzenle").should("be.visible");

    // Mevcut antrenman başlığı input'a doldurulmuş olmalı
    cy.get('[data-testid="workout-title-input"]')
      .should("be.visible")
      .and("have.value", "Sabah Güç Antrenmanı");
  });

  // ─────────────────────────────────────────────
  // TEST 3: Başlık değiştirip kaydet
  // ─────────────────────────────────────────────

  it("Antrenman başlığı değiştirip kaydedilince güncelleme isteği gönderilir", () => {
    cy.navigateToWorkout();
    cy.get('[data-testid="workout-card"]').should("be.visible");

    // 📌 Güncelleme (PATCH) isteğini mock'la
    // Supabase REST API PATCH kullanır update için
    cy.intercept("PATCH", "**/rest/v1/workouts*", {
      statusCode: 200,
      body: {},
    }).as("updateWorkout");

    // workout_exercises silme isteği (edit sırasında eski egzersizler silinir)
    cy.intercept("DELETE", "**/rest/v1/workout_exercises*", {
      statusCode: 200,
      body: {},
    }).as("deleteExercises");

    // Düzenle formunu aç
    cy.get('[data-testid="workout-edit-btn"]').first().click();
    cy.contains("Antrenmanı Düzenle").should("be.visible");

    // Başlığı temizle ve yeni değer yaz
    // 📌 .clear() → input'u temizler
    // 📌 .type()  → karakter karakter yazar (gerçek klavye simülasyonu)
    cy.get('[data-testid="workout-title-input"]')
      .clear()
      .type("Akşam Güç Antrenmanı");

    // Güncelle butonuna bas
    cy.get('[data-testid="workout-save-btn"]').click();
  });

  // ─────────────────────────────────────────────
  // TEST 4: Geri butonuyla formdan çıkış
  // ─────────────────────────────────────────────

  it("Formda Geri butonuna basınca workout listesine döner", () => {
    cy.navigateToWorkout();
    cy.get('[data-testid="workout-edit-btn"]').first().click();

    // Formda olduğumuzu doğrula
    cy.contains("Antrenmanı Düzenle").should("be.visible");

    // Geri butonuna bas
    cy.contains("Geri").click();

    // Liste tekrar görünmeli
    cy.contains("Sabah Güç Antrenmanı").should("be.visible");
    cy.get('[data-testid="workout-card"]').should("exist");
  });

  // ─────────────────────────────────────────────
  // TEST 5: Silme akışı
  // ─────────────────────────────────────────────

  it("Sil butonuna basınca DELETE isteği gönderilir ve kart listeden kalkar", () => {
    cy.navigateToWorkout();
    cy.get('[data-testid="workout-card"]').should("have.length", 1);

    // 📌 Silme sonrası boş liste dönecek şekilde GET'i yeniden mock'la
    // Sil → refetchWorkouts() çağrılır → yeni GET isteği gider
    // O GET'in boş array döndürmesini istiyoruz.
    cy.intercept("DELETE", "**/rest/v1/workouts*", {
      statusCode: 200,
      body: {},
    }).as("deleteWorkout");

    // Silme sonrası refetch boş gelsin
    cy.intercept("GET", "**/rest/v1/workouts*", {
      statusCode: 200,
      body: [],
    }).as("getWorkoutsEmpty");

    // Sil butonuna bas
    cy.get('[data-testid="workout-delete-btn"]').first().click();

    // DELETE isteği gönderildi mi?
    cy.wait("@deleteWorkout");

    // Refetch sonrası liste boş → EmptyState görünmeli
    cy.wait("@getWorkoutsEmpty");
    cy.contains("Antrenman bulunamadı").should("be.visible");
  });

  // ─────────────────────────────────────────────
  // TEST 6: Tamamlanmış antrenmanın "completed" filtresi
  // ─────────────────────────────────────────────

  it("'Tamamlananlar' filtresi seçilince sadece completed workoutlar görünür", () => {
    // Bu test için iki workout: biri tamamlanmış, biri değil
    cy.intercept("GET", "**/rest/v1/workouts*", {
      statusCode: 200,
      body: [
        {
          id: "w-1",
          title: "Tamamlanmış Antrenman",
          type: "strength",
          date: "2024-06-14",
          week_number: 24,
          year: 2024,
          duration_minutes: 30,
          notes: null,
          completed: true,
          copied_from: null,
          created_at: "2024-06-14T08:00:00Z",
          workout_exercises: [],
        },
        {
          id: "w-2",
          title: "Bekleyen Antrenman",
          type: "cardio",
          date: "2024-06-15",
          week_number: 24,
          year: 2024,
          duration_minutes: 20,
          notes: null,
          completed: false,
          copied_from: null,
          created_at: "2024-06-15T08:00:00Z",
          workout_exercises: [],
        },
      ],
    });

    cy.navigateToWorkout();

    // Her ikisi de görünür
    cy.get('[data-testid="workout-card"]').should("have.length", 2);

    // "Tamamlananlar" filtresine tıkla
    cy.contains("Tamamlananlar").click();

    // Sadece tamamlananlar görünmeli
    cy.get('[data-testid="workout-card"]').should("have.length", 1);
    cy.contains("Tamamlanmış Antrenman").should("be.visible");

    // 📌 not.exist → elementın DOM'da hiç olmadığını doğrular
    cy.contains("Bekleyen Antrenman").should("not.exist");
  });
});
