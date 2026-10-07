# Frontend
Classe: R1/R2.
Mobile-first, acessível, offline. Páginas: Hoje, Plano, Matérias, Questões,
Revisões, Simulados, Progresso, Configurações.
UI consome services/repositories e jamais embute conteúdo de edital em componentes.

## Biblioteca
B5 consome catálogo genérico e unidades do pack. Mostre recorte, formato, acesso,
idioma, fonte, revisão e necessidade de internet. Busca/filtros e estados sem material,
indisponível/cadastro/pago devem funcionar em mobile/teclado. Reutilize Pixel UI onde
existente. Abrir recurso não gera XP, conclusão ou mastery.

## Plataforma Pixel UI V2

Siga docs/design/PLATFORM_PIXEL_PLAN.md e a skill studyos-pixel-ui. Próxima fatia:
tokens/assets e piloto Hoje; ação primária no celular antes de ampliar cenas.
Reutilize primitives existentes. Agrupamento da navegação é uma tarefa COMPLEX
separada com análise de hashes, foco, mounts e sessão ativa. Conceito V0 é isolado;
não usar dados ilustrativos nem sua CSS independente em produção.
