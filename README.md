# Aplikacja webowa automatyzująca proces rekrutacji do szkół ponadpodstawowych

## Aplikacja została stworzona jako praca inżynierska.

## Technologie:

### Frontend:

- Framework: React
- Build Tool: Vite
- Język: TypeScript

### Backend:

- Framework: Express
- Język: TypeScript

## Instalacja
- git clone https://github.com/julgitt/Electronic-School-Enrollment-System
- Przejdź do katalogu projektu.
-  Aplikacja jest podzielona na dwie warstwy: frontendową w katalogu /client oraz backendową w katalogu /server. Należy przejść do obu podkatalogów i uruchomić polecenie npm install w każdym z nich, aby zainstalować brakujące zależności.
- Plik /server/.env zawiera parametry konfiguracyjne, które muszą być uzupełnione, aby zapewnić prawidłowe działanie aplikacji.
- Przejdź do katalogu public/database/db_backups. W tym miejscu znajdują się pliki z kopiami zapasowymi bazy danych. Należy zaimportować jedną z nich do utworzonej wcześniej bazy danych. Aby zaimportować dane użyłam polecenia psql -U <DB\_USER> -d <DB\_NAME> -f <nazwa pliku z kopią bazy danych>. Zmienne <DB\_USER> <DB\_NAME> pochodzą z pliku /server/.env.
- Aby uruchomić warstwę frontendową przejdź do podfolderu /client i uruchom polecenie npm start
- Aby uruchomić warstwę backendową przejdź do podfolderu /server i uruchom polecenie npm start
- Aby wejść na stronę przejdź pod adres: http://localhost:5173