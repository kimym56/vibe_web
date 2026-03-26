# PageMint — Design System

> This document is the single source of truth for colors, typography, and theming.
> Every team member — including future contributors — should read this before touching UI code.
> **Keep this document in sync with any code changes.**

---

## 1. Color Palette

### Brand Colors

| Role                | Name            | Value     | Preview | Usage                                                      |
| ------------------- | --------------- | --------- | ------- | ---------------------------------------------------------- |
| **Primary**         | Mint            | `#6DE1D2` | 🟢      | CTA buttons, highlights, badges, title accents             |
| **Primary Dark**    | Mint Dark       | `#52C4B5` | 🟢      | Pressed/hover state of primary                             |
| **Primary Surface** | Mint Surface    | `#0F211E` | ⬛      | Tinted surface behind Mint on dark canvases                |
| **Secondary**       | Sunny Yellow    | `#FFD63A` | 🟡      | Gradient endpoints, AI accents, supporting highlights      |
| **Secondary Dark**  | Yellow Dark     | `#E6BD2F` | 🟡      | Pressed state of secondary                                 |
| **Tertiary**        | Warm Orange     | `#FFA955` | 🟠      | Tertiary highlights, warm accents                          |
| **Quaternary**      | Coral           | `#F75A5A` | 🔴      | Alert accents, emphasis states                             |

> **Secondary as Accent Rule**: Sunny Yellow supports AI/tech energy. Use for gradient endpoints, AI accents, and supporting highlights.

### Dark Theme Backgrounds

| Layer             | Constant                   | Value     | Used For                         |
| ----------------- | -------------------------- | --------- | -------------------------------- |
| Base Scaffold     | `AppColors.darkBg`         | `#0D0F14` | Scaffold background, main canvas |
| Surface / Sidebar | `AppColors.darkSurface`    | `#161B27` | Sidebars, panels, headers        |
| Card / Input      | `AppColors.darkCard`       | `#1E2538` | Cards, bubbles, input fields     |
| Border            | `AppColors.darkBorder`     | `#2D3748` | Dividers, outlines               |
| User Bubble       | `AppColors.darkUserBubble` | `#1E3A5F` | User chat bubble background      |

### Light Theme Backgrounds

Designed with **4–9% luminance steps** between layers, matching the dark theme's depth.

| Layer            | Constant                      | Value     | L%  | Usage                              |
| ---------------- | ----------------------------- | --------- | --- | ---------------------------------- |
| Base Scaffold    | `AppColors.lightBg`           | `#EFF2F7` | 95% | Scaffold, tinted cool gray         |
| Surface / Panel  | `AppColors.lightSurface`      | `#FFFFFF` | 100%| Sidebars, panels — pure white     |
| Card / Input     | `AppColors.lightCard`         | `#F5F7FA` | 97% | Cards, bubbles, input fields       |
| Border           | `AppColors.lightBorder`       | `#CBD5E1` | 84% | Dividers, outlines — stronger      |
| User Bubble      | `AppColors.lightUserBubble`   | `#DCEEFC` | —   | User chat bubble background        |
| Selected BG      | `AppColors.lightMintTint`     | `#E6FAF7` | —   | Selected/active state background   |
| Active Border    | `AppColors.lightMintBorder`   | `#A7EDE4` | —   | Active state mint border           |

### Text Colors

| Role           | Constant                                   | Dark      | Light     |
| -------------- | ------------------------------------------ | --------- | --------- |
| Primary text   | `darkTextPrimary` / `lightTextPrimary`     | `#E2E8F0` | `#0F172A` |
| Secondary text | `darkTextSecondary` / `lightTextSecondary` | `#94A3B8` | `#334155` |
| Muted text     | `darkTextMuted`                            | `#CBD5E1` | —         |
| Emphasis text  | `lightTextEmphasis`                        | —         | `#1E293B` |
| Tertiary text  | `lightTextTertiary`                        | —         | `#334155` |

### Semantic Colors

| State            | Constant                   | Value     |
| ---------------- | -------------------------- | --------- |
| Success          | `AppColors.success`        | `#34D399` |
| Success Surface  | `AppColors.successSurface` | `#065F46` |
| Error            | `AppColors.error`          | `#F75A5A` |
| Error Surface    | `AppColors.errorSurface`   | `#7F1D1D` |
| Warning          | `AppColors.warning`        | `#FFA955` |
| On Primary       | `AppColors.onPrimary`      | `#0F172A` |
| Disabled (light) | `AppColors.lightDisabled`  | `#CBD5E1` |
| Disabled (dark)  | `AppColors.darkDisabled`   | `#475569` |

### AI Chat Colors

| Role            | Constant                  | Value             |
| --------------- | ------------------------- | ----------------- |
| AI accent       | `AppColors.aiAccent`      | Same as `primary` |
| AI accent light | `AppColors.aiAccentLight` | `#A2F0E6`         |

---

## 2. File Structure

```
lib/core/theme/
├── app_colors.dart        — All color constants (the only place Color(0xFF...) is allowed)
├── app_text_styles.dart   — TextTheme definitions for light and dark
└── app_theme.dart         — ThemeData getters: AppTheme.light / AppTheme.dark
```

---

## 3. Usage Guide

### ✅ Correct

```dart
// Inside widget tree (preferred)
final color = Theme.of(context).colorScheme.primary; // Mint

// Outside ThemeData — CustomPainter, Canvas, etc.
final color = AppColors.primary; // Mint #6DE1D2

// Local alias inside a widget file (allowed — must reference AppColors)
static const Color _gold = AppColors.primary;
static const Color _navy = AppColors.lightTextPrimary;
```

### ❌ Forbidden

```dart
// Never hardcode colors inline — add to AppColors first
final color = Color(0xFF3B82F6); // ❌ violates Single Source of Truth
```

---

## 4. Typography

### Font Stack

| Role | Family | Source | Reason |
| -------------- | -------------- | -------------- | --------------------------------------------------- |
| **Primary** | Inter | `google_fonts` | Modern geometric sans-serif; optimised for screens. |
| **KR Fallback** | Noto Sans KR | `google_fonts` | Covers Korean glyphs absent from Inter. |

CanvasKit resolves fonts **glyph-by-glyph**: Latin characters render with Inter; Korean characters automatically fall back to Noto Sans KR. No manual `RichText` splitting is required.

```dart
// Defined once in AppTextStyles — applied to every TextStyle in the scale.
static String get _primary => GoogleFonts.inter().fontFamily!;
static final List<String> _fallback = [GoogleFonts.notoSansKr().fontFamily!];
```


| Token            | sp   | Weight | Used For                 |
| ---------------- | ---- | ------ | ------------------------ |
| `displayLarge`   | 48sp | 800    | Hero titles              |
| `displayMedium`  | 36sp | 700    | Section titles           |
| `headlineLarge`  | 28sp | 700    | Page headings            |
| `headlineMedium` | 22sp | 700    | Card headings            |
| `headlineSmall`  | 18sp | 600    | Sub-headings             |
| `titleLarge`     | 16sp | 700    | Emphasized body          |
| `bodyLarge`      | 14sp | 400    | Body text (height 1.6)   |
| `bodyMedium`     | 13sp | 400    | Supporting descriptions  |
| `bodySmall`      | 12sp | 400    | Captions, metadata       |
| `labelLarge`     | 13sp | 600    | Button labels            |
| `labelMedium`    | 12sp | 600    | Chips, badges            |
| `labelSmall`     | 11sp | 400    | Timestamps, micro labels |

> ScreenUtil design size: **1920 × 1080** (landscape baseline).
> Portrait mode dynamically uses the device's actual dimensions.

> **Minimum font size**: 11sp. No visible text may use a size smaller than 11sp to meet legibility standards.

---

## 5. Theme Setup

Wired in `lib/app/app.dart` with runtime switching via `themeModeProvider`:

```dart
MaterialApp.router(
  theme: AppTheme.light,
  darkTheme: AppTheme.dark,
  themeMode: ref.watch(themeModeProvider),
  locale: appLocale.flutterLocale,
  ...
)
```

The `themeModeProvider` defaults to `ThemeMode.system` and persists the user's choice in `SharedPreferences`.

---

## 6. ColorScheme Mapping

| ColorScheme key | AppColors value                        | Description                      |
| --------------- | -------------------------------------- | -------------------------------- |
| `primary`       | `AppColors.primary` (`#6DE1D2`)        | Mint — primary CTA               |
| `onPrimary`     | `#0F172A`                              | Text/icons on Mint backgrounds   |
| `secondary`     | `AppColors.secondary` (`#FFD63A`)      | Sunny Yellow — secondary accent  |
| `onSecondary`   | `AppColors.onPrimary`                  | Text/icons on Yellow backgrounds |
| `surface`       | `darkSurface` / `lightSurface`         | Panel backgrounds                |
| `onSurface`     | `darkTextPrimary` / `lightTextPrimary` | Default text color               |

---

## 7. Design Principles

1. **Mint First** — Use Mint (`#6DE1D2`) consistently for all CTAs and primary highlights.
2. **Yellow as Accent** — Use Sunny Yellow for gradient endpoints, AI accents, and supporting highlights.
3. **System Theme Default** — `themeModeProvider` defaults to `ThemeMode.system`. Users can switch between light, dark, or system themes at runtime.
4. **No Hardcode** — All colors must come from `AppColors`. Inline `Color(0xFF...)` declarations are forbidden outside `app_colors.dart`.
5. **ScreenUtil Always** — All size values use `.w` `.h` `.sp` `.r`. No fixed `double` pixel values.

---

## 8. Internationalization (i18n)

### Package

[slang](https://pub.dev/packages/slang) `^4.12.1` — type-safe i18n for Dart/Flutter with Riverpod integration.

| Package              | Role                                                              |
| -------------------- | ----------------------------------------------------------------- |
| `slang`              | Core type-safe translation engine                                 |
| `slang_flutter`      | Flutter-specific helpers (`TranslationProvider`, `flutterLocale`) |
| `slang_build_runner` | Code generation via build_runner                                  |

### File Structure

```
lib/i18n/
├── ko.i18n.json       — Korean (base locale, always complete)
├── en.i18n.json       — English
├── strings.g.dart     — Generated root (DO NOT EDIT)
├── strings_ko.g.dart  — Generated Korean (DO NOT EDIT)
└── strings_en.g.dart  — Generated English (DO NOT EDIT)

lib/core/providers/
└── locale_provider.dart  — Runtime locale state (LocaleNotifier)

slang.yaml             — slang configuration (project root)
```

### Configuration (`slang.yaml`)

```yaml
base_locale: ko # Korean is the base — must be 100% complete
fallback_strategy: base_locale # Missing keys fall back to Korean
input_directory: lib/i18n
input_file_pattern: .i18n.json
output_directory: lib/i18n
output_file_name: strings.g.dart
key_case: camel
flutter_integration: true
translate_var: t
enum_name: AppLocale
```

### Locale Provider

```dart
// lib/core/providers/locale_provider.dart
final localeProvider = NotifierProvider<LocaleNotifier, AppLocale>(LocaleNotifier.new);

class LocaleNotifier extends Notifier<AppLocale> {
  @override
  AppLocale build() => AppLocale.ko; // Defaults to Korean

  void setLocale(AppLocale locale) => state = locale;
}
```

### Usage in Widgets

```dart
// Access translations
final t = Translations.of(context);
Text(t.promo.ctaLabel)

// Change locale at runtime
ref.read(localeProvider.notifier).setLocale(AppLocale.en);
```

### Adding New Strings

1. Add the key to `lib/i18n/ko.i18n.json` (base locale — **required**)
2. Add the key to all other locale files (e.g. `en.i18n.json`)
3. Run `dart run slang` to regenerate `strings.g.dart`
4. Use via `Translations.of(context).yourKey`

### Adding a New Language

1. Create `lib/i18n/{locale}.i18n.json` (e.g. `ja.i18n.json`)
2. Translate all keys (missing keys auto-fall-back to Korean per `fallback_strategy`)
3. Run `dart run slang`
4. The new locale appears in `AppLocale` enum automatically

### Rules

- **Korean (`ko`) must always be 100% complete** — it is the ultimate fallback
- **Never edit generated files** (`*.g.dart`) — they are overwritten on next `dart run slang`
- **All translation keys use camelCase** (configured via `key_case: camel`)
- **Parameterized strings** use `${variable}` syntax in JSON (e.g. `"${collected}/${total} collected"`)

---

_Last updated: 2026-03-21 | Maintainer: PageMint Team_
