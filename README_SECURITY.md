# KONFIGURACJA BEZPIECZEŃSTWA - WEATHER STATION

## API KEYS - WAŻNE INFORMACJE

API keys zostały przeniesione do bezpiecznej lokalizacji ze względów bezpieczeństwa.

### Lokalizacja rzeczywistych kluczy:
```
/home/pi5/.config/weather-station/settings.json
```

### Wymagane klucze:
1. **mapApiKey**: Klucz Mapbox dla map bazowych (wymagany)
2. **reverseGeoApiKey**: Klucz LocationIQ dla geolokalizacji (opcjonalny)

### Konfiguracja aplikacji:
Aplikacja powinna być skonfigurowana do odczytu kluczy z bezpiecznej lokalizacji:
```javascript
const settingsPath = process.env.WEATHER_SETTINGS_PATH || '/home/pi5/.config/weather-station/settings.json';
```

### Uprawnienia:
- Plik settings.json ma uprawnienia 600 (tylko właściciel może odczytywać/zapisywać)
- Katalog .config/weather-station ma uprawnienia 700

### Rotacja kluczy:
- Regularnie zmieniaj klucze API
- Monitoruj użycie kluczy w panelach dostawców
- Nie commituj kluczy do repozytoriów Git

---
*Wygenerowane przez system audytu bezpieczeństwa*