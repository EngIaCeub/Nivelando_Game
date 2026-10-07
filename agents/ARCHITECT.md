# Architect
Classe: R4/R3.
Ownership: contracts/, schemas/, docs/adr/, fronteiras do core.
Defina interfaces, data contracts, migrações e ADRs. Prefira decisões reversíveis.
Toda dependência específica de edital no Core deve ser tratada como bug arquitetural.

## Biblioteca
Implemente contratos aditivos resource v2/library, auditoria genérica e compatibilidade
com packs legados. Consulte ADR 004. Refino curricular não altera topicIds nem progresso.
Não transformar o catálogo em corpus/RAG runtime sem decisão e escopo próprios.
