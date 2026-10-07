# StudyOS Agentic Factory

Arquitetura agêntica para o Codex Desktop construir **sites de estudo gamificados a partir de editais**.

O TCE-GO TI 2026 é o primeiro `Exam Pack`, mas o sistema foi desenhado para receber novos editais sem reescrever o motor.

## Ideia central

```text
StudyOS Core
  ├─ learning engine
  ├─ revisão
  ├─ questões
  ├─ gamificação
  ├─ analytics
  ├─ persistência
  └─ UI/PWA
        │
        ├─ Exam Pack: TCE-GO TI 2026
        ├─ Exam Pack: BACEN futuro
        ├─ Exam Pack: Metrô-DF futuro
        └─ Exam Pack: qualquer novo edital
```

Cada novo edital vira um **pacote de dados e configuração**, não um novo sistema do zero.

## Modos de publicação

1. **Standalone**: gera um site separado por edital, ideal para GitHub Pages.
2. **Multi-exam hub**: vários Exam Packs na mesma aplicação.
3. **Forkable template**: cria um novo repositório/site a partir do Core + 1 Exam Pack.

## Como começar no Codex Desktop

1. Extraia este ZIP.
2. Abra a pasta como projeto.
3. Execute:
   `Leia AGENTS.md e execute prompts/00-bootstrap-factory.md.`
4. Quando o Core estiver estável, execute:
   `prompts/10-build-tce-go-first-pack.md`
5. Para um edital futuro, use:
   `prompts/20-create-new-exam-from-edital.md`

## Regra de ouro

A UI e os algoritmos pertencem ao `core/`.
Conteúdo de concurso pertence a `exam-packs/<exam-id>/`.
Nunca copie regras específicas de um edital para o Core.

## StudyOS V1.0

A release de produção usa IndexedDB local, PWA/offline após a primeira carga e backup JSON
em Configurações / Sobre. Consulte [docs/USER_GUIDE.md](docs/USER_GUIDE.md) e
[docs/RELEASE_NOTES_1.0.0.md](docs/RELEASE_NOTES_1.0.0.md).

Biblioteca didática: consulte docs/DIDACTIC_LIBRARY_PLAN.md, contracts/DIDACTIC_LIBRARY.md
 e docs/DIDACTIC_LIBRARY_ARCHITECTURE_REPORT.md. Diagnóstico: node scripts/library-audit.mjs <exam-id>.

## Prévia da implementação Pixel plataforma

Na raiz deste checkout, execute `node scripts/build-standalone.mjs` e depois
`node scripts/preview-standalone.mjs tce-go-ti-2026 4180`.
Abra `http://127.0.0.1:4180/Nivelando_Game/`. Essa prévia usa dados locais do pack e um
armazenamento de navegador separado da origem pública. Relatório de implementação:
`docs/design/PLATFORM_IMPLEMENTATION_REPORT.md`. A nova direção ainda não foi publicada.
