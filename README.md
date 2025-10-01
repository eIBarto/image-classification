## Automated Image Classification Platform (Next.js + AWS Amplify + Gemini)

Eine webbasierte Anwendung zur automatisierten Bildklassifikation für Forschende ohne Programmierkenntnisse. Die Plattform bietet einen durchgängigen Workflow von Projektverwaltung, Bild-Upload und -Vorverarbeitung über KI-gestützte Klassifikation bis hin zu Auswertung und Vergleich mehrerer Klassifikationsläufe.

Diese Codebasis realisiert den in der Arbeit beschriebenen Prototypen mit Next.js (App Router) und AWS Amplify (Gen 2). Die Bildklassifikation nutzt multimodale LLMs (Google Gemini) über serverseitige Funktionen; die Evaluation aggregiert Ergebnisse und berechnet Qualitätskennzahlen (u. a. Cohen's Kappa, Krippendorff's Alpha, F1, Confusion Matrices).

## Inhalte

- Überblick und Funktionsumfang
- Architektur
- Voraussetzungen und Einrichtung
- Lokale Entwicklung
- Deployment
- Nutzung: Schritt-für-Schritt-Workflow
- Datenmodell und Speicherlayout
- Evaluation und Metriken
- Fehlerbehebung
- Sicherheit & Lizenz

## Überblick

- **Zielgruppe**: Forschende ohne Programmierhintergrund, die Bilddaten KI-gestützt klassifizieren und evaluieren möchten.
- **Kernfunktionen**:
  - Projekt- und Benutzerverwaltung (Mitgliedschaften, Rollen: VIEW/MANAGE)
  - Upload und serverseitige Bildvorverarbeitung (Resize, Formatkonvertierung)
  - Labels, Prompts und Prompt-Versionen verwalten
  - Views zusammenstellen (Dateien + optionale Gold-Standard-Labels)
  - Klassifikationsläufe mit LLM (Gemini) ausführen, Ergebnisse speichern
  - Evaluation/Analytics: Mehrheitsentscheid, Gütemaße, Intercoder-Reliabilität, Konfusionsmatrizen
  - Realtime-Updates der Klassifikationsergebnisse in der UI

## Architektur

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind, shadcn/ui, React Query
  - Einstieg: `app/` (u. a. `app/(app)/projects/...`)
- **Backend (Amplify Gen 2)**:
  - Auth: Amazon Cognito
  - Data: AppSync GraphQL + DynamoDB, Schema definiert in `amplify/data/resource.ts`
  - Storage: Zwei S3-Buckets
    - Upload-Bucket `upload-media-bucket` (Benutzer lädt Rohbilder hoch)
    - Media-Bucket `media-bucket` (generierte Derivate, UI-Zugriff)
  - Functions/Lambdas:
    - `storage/on-upload`: S3-Event-Trigger. Prüft Projektmitgliedschaft, rendert Derivate mit Sharp, legt `File` und `ProjectFile` an.
    - Klassifikation:
      - `classification-candidate/classify-candidate`
      - `classification-candidate/classify-candidates`
      - `classification/classify-classification`
      - Verwenden `@google/generative-ai` (Gemini), lesen Bilder aus dem Media-Bucket und schreiben `Result`-Einträge.
    - Analytics:
      - `functions/evaluation-wrangler` (TypeScript): Aggregiert Rohdaten aus dem GraphQL-Modell.
      - `functions/get-analytics` (Python 3.11): Berechnet Kennzahlen (Cohen's Kappa, Krippendorff's Alpha, F1 etc.) und liefert strukturierte Ergebnisse an die App.
  - Infrastruktur: konfiguriert in `amplify/backend.ts` (inkl. Sharp-Layer für On-Upload-Funktion und S3→Lambda-Notification)

### Datenfluss (vereinfacht)

1. Upload nach S3 unter `projects/submissions/{identityId}/{accountId}/{projectId}/{filename}`
2. `on-upload` Lambda rendert Derivate (z. B. 64x64 und 1024x1024 als WEBP) und speichert unter `projects/shared/{projectId}/{fileId}/{format}/{WxH}/{filename}` im Media-Bucket; erzeugt `File` + `ProjectFile` im Datenschema
3. Klassifikationslauf liest Derivate aus dem Media-Bucket, ruft Gemini mit Prompt + Labelschema auf und speichert je Datei ein `Result` (Label + Confidence)
4. UI zeigt Fortschritt via GraphQL-Subscription (`Result.onCreate`)
5. Analytics ruft aggregierte Daten (`getAnalytics`) ab, Python-Funktion bereitet Metriken auf

## Voraussetzungen

- Node.js 20+
- npm 9+ (oder kompatibel zu Node 20)
- AWS Account + IAM-Berechtigungen für Amplify, AppSync, DynamoDB, Cognito, S3, Lambda
- Konfigurierte AWS Anmeldedaten (z. B. via AWS CLI Profile)
- Optional: GitHub/CI (siehe `amplify.yml`)

### Amplify (Gen 2) Setup

- Globale Abhängigkeiten sind nicht zwingend nötig; die CLI wird via npx genutzt.
- Secrets werden in Amplify als Umgebungsgeheimnisse verwaltet.

## Installation & Lokale Entwicklung

1. Abhängigkeiten installieren:
   - `npm ci`
2. Backend-Sandbox in AWS provisionieren (temporäre Entwicklungsumgebung):
   - `npx ampx sandbox`
   - Dadurch wird `amplify_outputs.json` erzeugt/aktualisiert, das der App Konfigurationen bereitstellt.
3. Frontend starten:
   - `npm run dev`
4. App im Browser öffnen: `http://localhost:3000`

Hinweise:
- Für die Klassifikationsfunktionen muss das Secret `GEMINI_API_KEY` gesetzt sein (siehe unten). Ohne Secret schlagen Klassifikationsaufrufe fehl.
- Die Python-Analytics-Funktion wird beim Sandbox/Deploy-Bundling mit Abhängigkeiten versehen; für lokale Frontend-Entwicklung ist Docker nicht erforderlich.

## Konfiguration & Secrets

- Secrets werden in den Funktionsressourcen referenziert, z. B.:
  - `amplify/data/classification-candidate/classify-candidate/resource.ts`
  - `amplify/data/classification-candidate/classify-candidates/resource.ts`
  - `amplify/data/classification/classify-classification/resource.ts`
- Erforderlich:
  - `GEMINI_API_KEY`: API-Schlüssel für Google Generative AI (Gemini)
- Beispiel (CLI):
  - `npx ampx secrets set GEMINI_API_KEY=YOUR_KEY`
  - Alternativ im Amplify Console UI als Umgebungsgeheimnis setzen.
- Weitere Umgebungsvariablen (Standardwerte in den Ressourcen gesetzt):
  - `on-upload`: `MEDIA_IMAGE_SIZES` (z. B. `64x64,1024x1024`), `MEDIA_IMAGE_FORMATS` (z. B. `webp`), `MEDIA_IMAGE_QUALITY` (z. B. `80`)
  - Klassifikation: `MEDIA_IMAGE_SIZE` (`1024x1024`), `MEDIA_IMAGE_FORMAT` (`webp`), `GEMINI_MODEL_NAME` (z. B. `gemini-2.0-flash`)

## Deployment

- Wichtig (Amplify Console): Vor dem Deployen in den App-Einstellungen unter HOSTING → Build-Einstellungen das Build-Image auf `public.ecr.aws/codebuild/amazonlinux-x86_64-standard:5.0` setzen.
-
- Persistente Umgebung deployen:
  - `npx ampx deploy`
- CI/CD: Siehe `amplify.yml` für Build/Deploy in Amplify Console.
 - Für detaillierte Hinweise siehe die Amplify-Dokumentation (Next.js App Router): [deployment section](https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/#deploy-a-fullstack-app-to-aws)

## Nutzung: Schritt-für-Schritt

1. Registrieren/Anmelden (Cognito)
2. Projekt anlegen
3. Mitglieder hinzufügen (Rollen: `VIEW` oder `MANAGE`), sofern kollaborativ gearbeitet wird
4. Labels definieren (Name, Beschreibung)
5. Prompt anlegen und Prompt-Versionen definieren; Labels einer Version zuordnen
6. Dateien hochladen:
   - Über die UI (empfohlen), oder
   - direkt nach S3 in den Upload-Bucket unter `projects/submissions/{identityId}/{accountId}/{projectId}/{filename}` (die `on-upload`-Funktion übernimmt Verarbeitung und Registrierung)
7. View erstellen und Dateien der View zuordnen (optional: Gold-Standard-Label je Datei setzen)
8. Klassifikation anlegen (View + Prompt-Version auswählen, Parameter wie Temperatur/TopP/MaxLength setzen) und starten
9. Fortschritt beobachten; Ergebnisse erscheinen sukzessive (Realtime-Updates per Subscription)
10. Evaluation/Analytics im entsprechenden Bereich öffnen; Kennzahlen und Vergleiche einsehen

## Datenmodell (Auszug)

- `User` (accountId, owner, memberships, projects, files)
- `Project` (name, description, authorId, members, files, views, prompts, classifications)
- `ProjectMembership` (accountId, projectId, access: `VIEW|MANAGE`)
- `File` (path, name, owner, results)
- `ProjectFile` (projectId, fileId)
- `View` (projectId, files, classifications)
- `ViewFile` (viewId, fileId, optional `labelId` als Gold-Standard)
- `Label` (name, description, projectId)
- `Prompt` (projectId, activeVersion, versions, labels)
- `PromptVersion` (promptId, version, text, zugehörige Labels)
- `Classification` (projectId, viewId, promptId, version, Parameter, results)
- `Result` (classificationId, fileId, labelId, confidence)

## S3-Speicherlayout

- Upload-Bucket (`upload-media-bucket`):
  - `projects/submissions/{identityId}/{accountId}/{projectId}/{filename}`
- Media-Bucket (`media-bucket`):
  - `projects/shared/{projectId}/{fileId}/{format}/{WxH}/{filename}`

## Evaluation & Analytics

- Abrufbar über GraphQL-Query `getAnalytics` (verkettet TS- und Python-Funktion)
- Python (`amplify/functions/get-analytics/index.py`):
  - Aufbereitung in Long-/Wide-Format
  - Intercoder-Kontingenzmatrix, Mehrheitsentscheid
  - Gold-Standard-Vergleich (sofern vorhanden)
  - Kennzahlen: Accuracy, Precision, Recall, F1 (macro/weighted), Confusion Matrix
  - Reliabilität: Cohen's Kappa (paarweise), Krippendorff's Alpha (nominal)

## Fehlerbehebung (Troubleshooting)

- Upload schlägt fehl oder Dateien erscheinen nicht:
  - Pfadformat prüfen (genau 6 Komponenten im Upload-Pfad)
  - Mitgliedschaft im Zielprojekt erforderlich (`VIEW` oder `MANAGE`)
  - Logs der `on-upload`-Funktion prüfen (S3→Lambda Trigger, Sharp-Layer vorhanden?)
- Klassifikation bricht ab / keine Ergebnisse:
  - `GEMINI_API_KEY` als Secret gesetzt?
  - Prompt-Version mit Labels verknüpft?
  - Bildderivate existieren im Media-Bucket (`1024x1024/webp`)?
  - LLM-Antwort muss dem erwarteten JSON-Schema entsprechen (Value + Confidence)
- Analytics leer:
  - Mindestens eine Klassifikation mit Ergebnissen notwendig
  - Für Gold-Standard-Vergleich müssen `ViewFile`-Labels gesetzt sein

## Sicherheit

- Zugriffskontrolle per Cognito (User Pools) und AppSync-Regeln
- S3-Pfade sind so konzipiert, dass nur berechtigte Nutzer:innen schreiben/lesen können (siehe `amplify/storage/resource.ts`)
- API-Schlüssel für Gemini werden als Secret in Amplify verwaltet (nicht im Code speichern)

## Lizenz

Dieses Projekt ist unter der MIT-0 Lizenz lizenziert. Siehe `LICENSE`.
