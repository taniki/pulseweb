# Création d'une table articles à partir des restes de l'analyse

CREATE TABLE articles AS
SELECT DISTINCT wos_id as id, 
(SELECT data FROM ISIPubdate WHERE id = articles2terms.wos_id) as date,
(SELECT data FROM baseLanguage WHERE id = articles2terms.wos_id) as lang,
(SELECT data FROM byline WHERE id = articles2terms.wos_id) as author,
(SELECT data FROM sourceName WHERE id = articles2terms.wos_id) as source,
(SELECT data FROM headline WHERE id = articles2terms.wos_id) as title,
(SELECT data FROM leadParagraph WHERE id = articles2terms.wos_id) as abstract
FROM articles2terms

# De l'optimisation pour les champions

CREATE UNIQUE INDEX articles_id_idx ON articles(id)