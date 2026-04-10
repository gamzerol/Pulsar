import {
  today,
  getWeekNumber,
  formatDate,
  formatShortDate,
  getMonthName,
  workoutTypeLabel,
  categoryLabel,
  calculateStreak,
  WORKOUT_TYPE_COLORS,
  CATEGORY_COLORS,
} from "./utils";

// ---------------------------------------------------------------------------
// today
// ---------------------------------------------------------------------------
describe("today", () => {
  it("YYYY-MM-DD formatında döner", () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("gerçek bugünün tarihini döner", () => {
    const expected = new Date().toISOString().split("T")[0];
    expect(today()).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// getWeekNumber  (ISO 8601 — hafta Pazartesi başlar)
// ---------------------------------------------------------------------------
describe("getWeekNumber", () => {
  it("2024-01-01 → hafta 1", () => {
    expect(getWeekNumber("2024-01-01")).toBe(1);
  });

  it("2024-12-30 → hafta 1 (2025'in ilk ISO haftası)", () => {
    expect(getWeekNumber("2024-12-30")).toBe(1);
  });

  it("2024-12-29 → hafta 52", () => {
    expect(getWeekNumber("2024-12-29")).toBe(52);
  });

  it("2020-12-31 → hafta 53 (53 haftalı yıl)", () => {
    expect(getWeekNumber("2020-12-31")).toBe(53);
  });

  it("2024-04-08 (Pazartesi) → hafta 15", () => {
    expect(getWeekNumber("2024-04-08")).toBe(15);
  });

  it("2024-04-14 (Pazar) → hafta 15", () => {
    expect(getWeekNumber("2024-04-14")).toBe(15);
  });

  it("2024-04-10 (Çarşamba) → hafta 15", () => {
    expect(getWeekNumber("2024-04-10")).toBe(15);
  });

  it("2025-01-01 → hafta 1", () => {
    expect(getWeekNumber("2025-01-01")).toBe(1);
  });

  it("2021-01-01 → hafta 53 (2020'nin son ISO haftası)", () => {
    expect(getWeekNumber("2021-01-01")).toBe(53);
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------
describe("formatDate", () => {
  it("string döner", () => {
    expect(typeof formatDate("2024-06-15")).toBe("string");
  });

  it("boş string döndürmez", () => {
    expect(formatDate("2024-06-15").length).toBeGreaterThan(0);
  });

  it("yıl içermez (format: 'gün ay haftanın-günü')", () => {
    // Örn: "Cumartesi, 15 Haziran"
    expect(formatDate("2024-06-15")).not.toContain("2024");
  });

  it("farklı tarihler için farklı çıktı verir", () => {
    expect(formatDate("2024-01-01")).not.toBe(formatDate("2024-06-15"));
  });
});

// ---------------------------------------------------------------------------
// formatShortDate
// ---------------------------------------------------------------------------
describe("formatShortDate", () => {
  it("string döner", () => {
    expect(typeof formatShortDate("2024-06-15")).toBe("string");
  });

  it("boş string döndürmez", () => {
    expect(formatShortDate("2024-06-15").length).toBeGreaterThan(0);
  });

  it("formatDate'den daha kısa veya eşit uzunlukta olur", () => {
    const short = formatShortDate("2024-06-15");
    const long = formatDate("2024-06-15");
    expect(short.length).toBeLessThanOrEqual(long.length);
  });

  it("farklı tarihler için farklı çıktı verir", () => {
    expect(formatShortDate("2024-01-01")).not.toBe(formatShortDate("2024-06-15"));
  });
});

// ---------------------------------------------------------------------------
// getMonthName
// ---------------------------------------------------------------------------
describe("getMonthName", () => {
  const months = [
    [1, "Ocak"],
    [2, "Şubat"],
    [3, "Mart"],
    [4, "Nisan"],
    [5, "Mayıs"],
    [6, "Haziran"],
    [7, "Temmuz"],
    [8, "Ağustos"],
    [9, "Eylül"],
    [10, "Ekim"],
    [11, "Kasım"],
    [12, "Aralık"],
  ] as const;

  test.each(months)("%i. ay → %s", (num, name) => {
    expect(getMonthName(num)).toBe(name);
  });
});

// ---------------------------------------------------------------------------
// workoutTypeLabel
// ---------------------------------------------------------------------------
describe("workoutTypeLabel", () => {
  it("strength → Güç", () => expect(workoutTypeLabel("strength")).toBe("Güç"));
  it("cardio → Kardiyo", () => expect(workoutTypeLabel("cardio")).toBe("Kardiyo"));
  it("flexibility → Esneklik", () => expect(workoutTypeLabel("flexibility")).toBe("Esneklik"));
  it("other → Diğer", () => expect(workoutTypeLabel("other")).toBe("Diğer"));
});

// ---------------------------------------------------------------------------
// categoryLabel
// ---------------------------------------------------------------------------
describe("categoryLabel", () => {
  it("chest → Göğüs", () => expect(categoryLabel("chest")).toBe("Göğüs"));
  it("back → Sırt", () => expect(categoryLabel("back")).toBe("Sırt"));
  it("legs → Bacak", () => expect(categoryLabel("legs")).toBe("Bacak"));
  it("shoulders → Omuz", () => expect(categoryLabel("shoulders")).toBe("Omuz"));
  it("arms → Kol", () => expect(categoryLabel("arms")).toBe("Kol"));
  it("core → Karın", () => expect(categoryLabel("core")).toBe("Karın"));
  it("cardio → Kardiyo", () => expect(categoryLabel("cardio")).toBe("Kardiyo"));
});

// ---------------------------------------------------------------------------
// calculateStreak
// ---------------------------------------------------------------------------
describe("calculateStreak", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-04-10T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("boş dizi → 0", () => {
    expect(calculateStreak([])).toBe(0);
  });

  it("yalnızca bugün → 1", () => {
    expect(calculateStreak(["2024-04-10"])).toBe(1);
  });

  it("yalnızca dün → 1", () => {
    expect(calculateStreak(["2024-04-09"])).toBe(1);
  });

  it("bugün ve dün → 2", () => {
    expect(calculateStreak(["2024-04-10", "2024-04-09"])).toBe(2);
  });

  it("art arda 5 gün → 5", () => {
    expect(
      calculateStreak([
        "2024-04-10",
        "2024-04-09",
        "2024-04-08",
        "2024-04-07",
        "2024-04-06",
      ])
    ).toBe(5);
  });

  it("arada boşluk varsa zinciri keser", () => {
    // 10, 09, (08 eksik), 07 → sadece 10 ve 09 sayılır
    expect(
      calculateStreak(["2024-04-10", "2024-04-09", "2024-04-07"])
    ).toBe(2);
  });

  it("eski tarihler bugüne bağlı değilse 0 döner", () => {
    expect(calculateStreak(["2024-03-01", "2024-03-02"])).toBe(0);
  });

  it("tekrar eden tarihler tek sayılır", () => {
    expect(
      calculateStreak(["2024-04-10", "2024-04-10", "2024-04-09"])
    ).toBe(2);
  });

  it("sırasız girişleri doğru işler", () => {
    expect(
      calculateStreak(["2024-04-08", "2024-04-10", "2024-04-09"])
    ).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// WORKOUT_TYPE_COLORS
// ---------------------------------------------------------------------------
describe("WORKOUT_TYPE_COLORS", () => {
  it("tüm workout type'ları için renk içerir", () => {
    expect(WORKOUT_TYPE_COLORS).toMatchObject({
      strength: expect.stringMatching(/^#[0-9a-fA-F]{6}$/),
      cardio: expect.stringMatching(/^#[0-9a-fA-F]{6}$/),
      flexibility: expect.stringMatching(/^#[0-9a-fA-F]{6}$/),
      other: expect.stringMatching(/^#[0-9a-fA-F]{6}$/),
    });
  });
});

// ---------------------------------------------------------------------------
// CATEGORY_COLORS
// ---------------------------------------------------------------------------
describe("CATEGORY_COLORS", () => {
  it("tüm kategoriler için renk içerir", () => {
    expect(CATEGORY_COLORS).toMatchObject({
      chest: expect.stringMatching(/^#[0-9a-fA-F]{6}$/),
      back: expect.stringMatching(/^#[0-9a-fA-F]{6}$/),
      legs: expect.stringMatching(/^#[0-9a-fA-F]{6}$/),
      shoulders: expect.stringMatching(/^#[0-9a-fA-F]{6}$/),
      arms: expect.stringMatching(/^#[0-9a-fA-F]{6}$/),
      core: expect.stringMatching(/^#[0-9a-fA-F]{6}$/),
      cardio: expect.stringMatching(/^#[0-9a-fA-F]{6}$/),
    });
  });
});
