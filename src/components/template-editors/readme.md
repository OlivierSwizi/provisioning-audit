# Template Editors

This folder contains reusable components for managing **multilingual notification templates** with dynamic keyword insertion.  
The main entry point is `MultilangNotificationEditor`, which provides a user-friendly interface for editing notification titles and bodies across multiple languages.

---

## 1. MultilangNotificationEditor – Usage Guide

### Purpose

`MultilangNotificationEditor` is a React component (Ant Design v5 + React-Quill) that allows users to edit notification templates in multiple languages.  
It ensures at least **French (`fr`)** and **English (`en`)** are always present, while additional locales can be added or removed (with restrictions).

The editor supports **keywords** (`{{keyword}}`) that can be inserted into the text. Keywords are displayed with a **light red highlight**, and clicking on them opens a contextual menu to replace them.

### Props

| Prop             | Type       | Default                                            | Description                                                                           |
| ---------------- | ---------- | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `title`          | `string`   | —                                                  | Title displayed in the card header.                                                   |
| `keywords`       | `string[]` | `[]`                                               | List of keywords available for insertion (e.g. `["ssid", "siteName", "passphrase"]`). |
| `value`          | `array`    | `[]`                                               | Current multilingual template value. Format shown below.                              |
| `onChange`       | `function` | —                                                  | Callback fired whenever the template is updated. Receives the updated array.          |
| `fieldMap`       | `object`   | `{ titleField: "title", bodyField: "message" }`    | Allows remapping of fields (e.g. use `subject` and `body`).                           |
| `defaultLocales` | `string[]` | `["fr", "en"]`                                     | Locales that must always be present (cannot be removed).                              |
| `allowedLocales` | `string[]` | `["fr", "en", "nl", "de", "es", "it", "pt", "pl"]` | Locales available in the “Add language” dropdown.                                     |

### Value Format

The component works with an array of objects:

```json
[
  {
    "locale": "fr",
    "title": "Vos accès Wi-Fi sont disponibles",
    "message": "Connectez vous au réseau Wifi {{ssid}} de {{siteName}} avec le code {{passphrase}}."
  },
  {
    "locale": "en",
    "title": "Your Wi-Fi access is available",
    "message": "Connect to the Wifi network {{ssid}} at {{siteName}} with the code {{passphrase}}."
  }
]
```
