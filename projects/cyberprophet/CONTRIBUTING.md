# Contributing to PageMint Client

## Language Policy

All written output must be in English without exception:

- Source code (comments, variable names, log messages)
- Git commit messages and branch names
- Pull request titles, descriptions, and reviews
- Documentation (README, AGENTS.md, docs/*.md, etc.)
- GitHub Issues and Discussions

> Verbal communication with the project owner may be in Korean.
> Everything that goes into the repository or GitHub must be in English.

## Design Principles

### SOLID

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md#solid-principles-in-this-codebase) for the full Flutter-specific mapping.

| Principle | Flutter Application |
| --- | --- |
| **S** — Single Responsibility | Each widget/class has one reason to change. |
| **O** — Open/Closed | Extend via new classes or providers, not by modifying existing ones. |
| **L** — Liskov Substitution | Widget subtypes must be interchangeable where `Widget` is expected. |
| **I** — Interface Segregation | Providers expose only what consumers need. |
| **D** — Dependency Inversion | Widgets depend on abstractions (providers, `ThemeData`), not concrete implementations. |

### DRY — Don't Repeat Yourself

- Extract any logic or UI fragment used in two or more places into a shared widget, helper, or provider.
- Never duplicate color values, text styles, or spacing constants — always reference `AppColors`, `AppTextStyles`, and `flutter_screenutil` extensions.
- Shared API call logic belongs in `core/network/`; shared UI belongs in `core/widgets/`.

### KISS — Keep It Simple, Stupid

- Prefer the simplest solution that satisfies the requirement.
- Avoid multi-layer abstractions when a single function or widget is sufficient.

### YAGNI — You Aren't Gonna Need It

- Do not add providers, models, parameters, or widgets for hypothetical future use.
- Only implement what is explicitly required by the current task.
- Remove dead code immediately; do not leave it commented out "just in case".

## File Organization

- **One class/widget per file.** Group related files into a folder instead of combining them in one file.

## Code Standards

### Color Usage

Never hardcode colors inline. Always reference `AppColors`:

```dart
// correct
color: AppColors.primary

// forbidden
color: Color(0xFF6DE1D2)
```

### Sizing

All layout values must use flutter_screenutil extensions:

```dart
// correct
padding: EdgeInsets.all(16.w)
fontSize: 14.sp
borderRadius: BorderRadius.circular(8.r)

// forbidden
padding: EdgeInsets.all(16)
```

## Commits and PRs

- Branch from `main`, open a PR with a clear description
- All PR titles and descriptions in English
- Run `flutter analyze lib/` before pushing — zero errors required
